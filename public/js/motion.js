let motionCanvas = null;
let motionContext = null;
let previousFrame = null;
let motionCheckInterval = null;
let motionDetected = false;
let motionThreshold = 30;
let motionHistory = [];
const MOTION_HISTORY_SIZE = 5;

function initMotionDetection(videoElement) {
  if (!motionCanvas) {
    motionCanvas = document.createElement('canvas');
    motionContext = motionCanvas.getContext('2d', { willReadFrequently: true });
  }

  motionCanvas.width = 320;
  motionCanvas.height = 240;

  previousFrame = null;
  motionHistory = [];

  if (motionCheckInterval) {
    clearInterval(motionCheckInterval);
  }

  motionCheckInterval = setInterval(() => {
    detectMotion(videoElement);
  }, 1000);
}

function detectMotion(videoElement) {
  if (!videoElement || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
    motionDetected = false;
    return;
  }

  try {
    motionContext.drawImage(videoElement, 0, 0, motionCanvas.width, motionCanvas.height);
    const currentFrame = motionContext.getImageData(0, 0, motionCanvas.width, motionCanvas.height);

    if (previousFrame) {
      const diff = calculateFrameDifference(previousFrame, currentFrame);
      const hasMotion = diff > motionThreshold;

      motionHistory.push(hasMotion ? 1 : 0);
      if (motionHistory.length > MOTION_HISTORY_SIZE) {
        motionHistory.shift();
      }

      const recentMotion = motionHistory.reduce((a, b) => a + b, 0);
      motionDetected = recentMotion >= 2;
    }

    previousFrame = currentFrame;
  } catch (error) {
    console.error('Motion detection error:', error);
    motionDetected = true;
  }
}

function calculateFrameDifference(frame1, frame2) {
  let diffSum = 0;
  let pixelCount = 0;

  const sampleRate = 4;

  for (let i = 0; i < frame1.data.length; i += 4 * sampleRate) {
    const r1 = frame1.data[i];
    const g1 = frame1.data[i + 1];
    const b1 = frame1.data[i + 2];

    const r2 = frame2.data[i];
    const g2 = frame2.data[i + 1];
    const b2 = frame2.data[i + 2];

    const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    diffSum += diff;
    pixelCount++;
  }

  return pixelCount > 0 ? diffSum / pixelCount : 0;
}

function checkMotion() {
  return motionDetected;
}

function stopMotionDetection() {
  if (motionCheckInterval) {
    clearInterval(motionCheckInterval);
    motionCheckInterval = null;
  }
  previousFrame = null;
  motionHistory = [];
  motionDetected = false;
}

function setMotionSensitivity(sensitivity) {
  switch (sensitivity) {
    case 'low':
      motionThreshold = 50;
      break;
    case 'medium':
      motionThreshold = 30;
      break;
    case 'high':
      motionThreshold = 15;
      break;
    default:
      motionThreshold = 30;
  }
}

function sendChunkToServer(blob, session, record) {
  const formData = new FormData();
  formData.append("video", blob);
  formData.append("session", session);
  formData.append("record", record);

  fetch("/api/upload-video", {
    method: "POST",
    body: formData,
  }).catch(console.error);
}

