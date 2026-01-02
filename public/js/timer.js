let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let timerInterval = null;
let timeRemaining = 60;
let currentSession = 1;
let isPaused = false;
let isRecording = false;
let recordingNumber = 1;
let recordingInterval = null;
let currentRecordingStartTime = 0;
let reminderInterval = null;

const TOTAL_SESSIONS = 4;
const SESSION_DURATION = 60;
const RECORDING_INTERVAL = 10;

const videoPreview = document.getElementById('videoPreview');
const placeholderView = document.getElementById('placeholderView');
const timerDisplay = document.getElementById('timerDisplay');
const sessionInfo = document.getElementById('sessionInfo');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingStatus = document.getElementById('recordingStatus');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');

/* ======================
   UI UTIL
====================== */

function updateSessionIndicators() {
  document.querySelectorAll('.session-dot').forEach((dot, i) => {
    dot.classList.toggle('completed', i + 1 < currentSession);
    dot.classList.toggle('active', i + 1 === currentSession);
  });
}

function formatTime(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeRemaining);
  sessionInfo.textContent = `Sesi ${currentSession} dari ${TOTAL_SESSIONS}`;
}

/* ======================
   CAMERA
====================== */

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });

    videoPreview.srcObject = stream;
    videoPreview.style.display = 'block';
    placeholderView.style.display = 'none';
    return true;
  } catch {
    alert('Izinkan kamera untuk memulai latihan.');
    return false;
  }
}

function stopCamera() {
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
  videoPreview.srcObject = null;
  videoPreview.style.display = 'none';
  placeholderView.style.display = 'flex';
}

/* ======================
   RECORDING
====================== */

async function startRecording() {
  if (!stream) return;

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

  mediaRecorder.ondataavailable = e => e.data.size && recordedChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    sendToTelegram(blob, {
      session: currentSession,
      videoNumber: recordingNumber
    });
    recordingNumber++;
    recordedChunks = [];
  };

  mediaRecorder.start();
  isRecording = true;
  currentRecordingStartTime = Date.now();
  recordingIndicator.style.display = 'block';
  updateRecordingStatus();

  recordingInterval = setTimeout(() => {
    if (mediaRecorder.state === 'recording' && !isPaused) {
      mediaRecorder.stop();
      recordingIndicator.style.display = 'none';
      startRecording();
    }
  }, RECORDING_INTERVAL * 1000);
}

function stopRecording() {
  clearTimeout(recordingInterval);
  recordingInterval = null;
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
  isRecording = false;
  recordingIndicator.style.display = 'none';
  recordingStatus.textContent = '';
}

function updateRecordingStatus() {
  if (!isRecording) return;
  const elapsed = Math.floor((Date.now() - currentRecordingStartTime) / 1000);
  recordingStatus.textContent = `Rekam ${RECORDING_INTERVAL - elapsed}s`;
  setTimeout(updateRecordingStatus, 1000);
}

/* ======================
   TIMER
====================== */

function startTimer() {
  timerInterval = setInterval(() => {
    if (isPaused) return;
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) completeSession();
  }, 1000);
}


async function sendToTelegram(blob, meta) {
  try {
    const formData = new FormData();
    formData.append("video", blob);
    formData.append("session", meta.session);
    formData.append("videoNumber", meta.videoNumber);

    await fetch("/api/upload-video", {
      method: "POST",
      body: formData
    });
  } catch (err) {
    console.error("Gagal kirim video ke Telegram", err);
  }
}


function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/* ======================
   WORKOUT FLOW
====================== */

async function startWorkout() {
  if (!(await startCamera())) return;

  showReminder("Pastikan HP disandarkan / tripod dan tubuh terlihat di kamera");
  startReminderLoop();

  recordingNumber = 1;
  isPaused = false;
  updateSessionIndicators();
  startTimer();
  await startRecording();

  startBtn.style.display = 'none';
  pauseBtn.style.display = 'block';
  stopBtn.style.display = 'block';
}

function pauseWorkout() {
  isPaused = true;
  stopRecording();
  stopReminderLoop();
  pauseBtn.style.display = 'none';
  resumeBtn.style.display = 'block';
}

async function resumeWorkout() {
  isPaused = false;
  await startRecording();
  startReminderLoop();
  resumeBtn.style.display = 'none';
  pauseBtn.style.display = 'block';
}

function stopWorkout() {
  stopTimer();
  stopRecording();
  stopCamera();
  stopReminderLoop();
  resetWorkout();
}

async function completeSession() {
  stopTimer();
  stopRecording();

  if (currentSession < TOTAL_SESSIONS) {
    currentSession++;
    timeRemaining = SESSION_DURATION;
    recordingNumber = 1;
    updateTimerDisplay();
    updateSessionIndicators();
    await startRecording();
    startTimer();
  } else {
    completeAllSessions();
  }
}

function completeAllSessions() {
  stopTimer();
  stopRecording();
  stopCamera();
  stopReminderLoop();
  resetWorkout();
}

/* ======================
   REMINDER (MANUAL)
====================== */

function showReminder(text) {
  const el = document.getElementById("reminderToast");
  if (!el) return;
  el.textContent = text;
  el.style.opacity = "1";
  setTimeout(() => el.style.opacity = "0", 3000);
}

function startReminderLoop() {
  stopReminderLoop();
  reminderInterval = setInterval(() => {
    showReminder("Tetap lakukan gerakan dan pastikan tubuh tetap terlihat di kamera");
  }, 20000);
}

function stopReminderLoop() {
  clearInterval(reminderInterval);
  reminderInterval = null;
}

/* ======================
   RESET
====================== */

function resetWorkout() {
  currentSession = 1;
  timeRemaining = SESSION_DURATION;
  recordingNumber = 1;
  isPaused = false;
  isRecording = false;

  updateTimerDisplay();
  updateSessionIndicators();

  startBtn.style.display = 'block';
  pauseBtn.style.display = 'none';
  resumeBtn.style.display = 'none';
  stopBtn.style.display = 'none';
}

/* ======================
   INIT
====================== */

window.addEventListener('DOMContentLoaded', () => {
  updateTimerDisplay();
  updateSessionIndicators();
});
