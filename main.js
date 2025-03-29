// DOM Elements
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const timeDisplay = document.getElementById('time-display');
const startPauseButton = document.getElementById('start-pause');
const resetButton = document.getElementById('reset');
const messageDiv = document.getElementById('message');

// Timer State
let timerInterval = null;
let totalSeconds = 0; // Total seconds remaining
let initialMinutes = 5; // Default initial minutes
let initialSeconds = 0; // Default initial seconds
let isPaused = false;

// --- Helper Functions ---

/**
 * Formats seconds into MM:SS format.
 * @param {number} seconds - The total seconds to format.
 * @returns {string} The formatted time string.
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Updates the time display element.
 */
function updateDisplay() {
  timeDisplay.textContent = formatTime(totalSeconds);
}

/**
 * Disables or enables input fields.
 * @param {boolean} disabled - True to disable, false to enable.
 */
function setInputDisabled(disabled) {
    minutesInput.disabled = disabled;
    secondsInput.disabled = disabled;
}

/**
 * Resets the timer to the initial state or the last set duration.
 */
function resetTimer() {
  clearInterval(timerInterval); // Stop any active interval
  timerInterval = null;
  isPaused = false;

  // Get values from input fields or use defaults
  initialMinutes = parseInt(minutesInput.value) || 0;
  initialSeconds = parseInt(secondsInput.value) || 0;

  // Ensure seconds are within valid range
  if (initialSeconds > 59) initialSeconds = 59;
  if (initialSeconds < 0) initialSeconds = 0;
  if (initialMinutes < 0) initialMinutes = 0;

  // Update input fields to reflect potentially corrected values
  minutesInput.value = initialMinutes;
  secondsInput.value = initialSeconds;

  totalSeconds = initialMinutes * 60 + initialSeconds;

  updateDisplay();
  startPauseButton.textContent = 'Start';
  setInputDisabled(false); // Enable inputs
  messageDiv.textContent = ''; // Clear any messages
}

/**
 * Starts or resumes the countdown.
 */
function startTimer() {
  if (timerInterval) return; // Already running

  if (!isPaused) {
    // Starting fresh or after reset
    initialMinutes = parseInt(minutesInput.value) || 0;
    initialSeconds = parseInt(secondsInput.value) || 0;

    // Validate and correct input values
    if (initialSeconds > 59) initialSeconds = 59;
    if (initialSeconds < 0) initialSeconds = 0;
    if (initialMinutes < 0) initialMinutes = 0;
    minutesInput.value = initialMinutes;
    secondsInput.value = initialSeconds;

    totalSeconds = initialMinutes * 60 + initialSeconds;

    if (totalSeconds <= 0) {
        messageDiv.textContent = 'Please set a duration greater than 0.';
        return; // Don't start if duration is zero or negative
    }
  }

  isPaused = false;
  setInputDisabled(true); // Disable inputs while running
  startPauseButton.textContent = 'Pause';
  messageDiv.textContent = ''; // Clear messages

  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      messageDiv.textContent = 'Time\'s up!';
      // Optionally add an alert or sound
      // alert("Time's up!");
      resetTimer(); // Reset to initial state after finishing
      return;
    }

    totalSeconds--;
    updateDisplay();
  }, 1000); // Update every second
}

/**
 * Pauses the countdown.
 */
function pauseTimer() {
  if (!timerInterval) return; // Not running

  clearInterval(timerInterval);
  timerInterval = null;
  isPaused = true;
  startPauseButton.textContent = 'Resume';
  setInputDisabled(false); // Re-enable inputs when paused (optional, could keep disabled)
}

// --- Event Listeners ---

startPauseButton.addEventListener('click', () => {
  if (timerInterval) {
    // If running, pause it
    pauseTimer();
  } else {
    // If not running (either paused or initial state), start/resume it
    startTimer();
  }
});

resetButton.addEventListener('click', resetTimer);

// Initialize the display on page load
document.addEventListener('DOMContentLoaded', resetTimer);

// Optional: Update initial values if inputs change while timer is not running
minutesInput.addEventListener('change', () => {
    if (!timerInterval && !isPaused) {
        resetTimer(); // Update display if changed while stopped
    }
});
secondsInput.addEventListener('change', () => {
    if (!timerInterval && !isPaused) {
        resetTimer(); // Update display if changed while stopped
    }
});
