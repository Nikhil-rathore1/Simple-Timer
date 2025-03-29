// DOM Elements
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const timeDisplay = document.getElementById('time-display');
const startPauseButton = document.getElementById('start-pause');
const resetButton = document.getElementById('reset');
const lapButton = document.getElementById('lap'); // New Lap button
const messageDiv = document.getElementById('message');
const lapsList = document.getElementById('laps-list'); // New Laps list UL

// Timer State
const TIMER_INTERVAL_MS = 100; // Update interval (e.g., 100ms for tenths of a second)
let timerInterval = null;
let totalMilliseconds = 0; // Total milliseconds remaining
let initialMinutes = 1; // Default initial minutes
let initialSeconds = 0; // Default initial seconds
let isPaused = false;
let laps = []; // Array to store lap times

// --- Helper Functions ---

/**
 * Formats milliseconds into MM:SS.d format.
 * @param {number} ms - The total milliseconds to format.
 * @returns {string} The formatted time string.
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100); // Get tenths of a second
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}

/**
 * Updates the time display element.
 */
function updateDisplay() {
  timeDisplay.textContent = formatTime(totalMilliseconds);
}

/**
 * Renders the recorded laps in the list.
 */
function renderLaps() {
    lapsList.innerHTML = ''; // Clear previous laps
    if (laps.length === 0) {
        lapsList.innerHTML = '<li>No laps recorded yet.</li>';
        return;
    }
    laps.forEach((lapTime, index) => {
        const li = document.createElement('li');
        const lapNumberSpan = document.createElement('span');
        lapNumberSpan.className = 'lap-number';
        lapNumberSpan.textContent = `Lap ${index + 1}:`;

        const lapTimeSpan = document.createElement('span');
        lapTimeSpan.className = 'lap-time';
        lapTimeSpan.textContent = formatTime(lapTime);

        li.appendChild(lapNumberSpan);
        li.appendChild(lapTimeSpan);
        lapsList.appendChild(li);
    });
    // Scroll to bottom of laps list
    lapsList.parentNode.scrollTop = lapsList.parentNode.scrollHeight;
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
  laps = []; // Clear laps

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

  totalMilliseconds = (initialMinutes * 60 + initialSeconds) * 1000;

  updateDisplay();
  renderLaps(); // Clear lap display
  startPauseButton.textContent = 'Start';
  lapButton.disabled = true; // Disable lap button on reset
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

    totalMilliseconds = (initialMinutes * 60 + initialSeconds) * 1000;

    if (totalMilliseconds <= 0) {
        messageDiv.textContent = 'Please set a duration greater than 0.';
        return; // Don't start if duration is zero or negative
    }
  }

  isPaused = false;
  setInputDisabled(true); // Disable inputs while running
  startPauseButton.textContent = 'Pause';
  lapButton.disabled = false; // Enable lap button when running
  messageDiv.textContent = ''; // Clear messages

  // Store the start time to calculate drift
  let expected = Date.now() + TIMER_INTERVAL_MS;

  timerInterval = setInterval(() => {
    const now = Date.now();
    const drift = now - expected; // Calculate the difference

    if (drift > TIMER_INTERVAL_MS) {
        // Adjust if interval was significantly delayed (e.g., tab inactive)
        // This part might need refinement depending on desired accuracy vs performance
        console.warn("Timer drift detected:", drift);
    }

    if (totalMilliseconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      totalMilliseconds = 0; // Ensure it's exactly 0
      updateDisplay(); // Final display update
      messageDiv.textContent = 'Time\'s up!';
      lapButton.disabled = true; // Disable lap button when finished
      // Optionally add an alert or sound
      // alert("Time's up!");
      // Keep inputs disabled until reset is pressed
      return;
    }

    totalMilliseconds -= TIMER_INTERVAL_MS;
    if (totalMilliseconds < 0) totalMilliseconds = 0; // Prevent negative values

    updateDisplay();

    // Set the next expected time
    expected += TIMER_INTERVAL_MS;

  }, TIMER_INTERVAL_MS); // Update based on interval constant
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
  lapButton.disabled = true; // Disable lap button when paused
  // Keep inputs disabled while paused, only enable on reset
  // setInputDisabled(false);
}

/**
 * Records the current time as a lap.
 */
function recordLap() {
    if (!timerInterval || isPaused) return; // Only record laps while running

    laps.push(totalMilliseconds);
    renderLaps();
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

lapButton.addEventListener('click', recordLap); // Add listener for lap button

// Initialize the display on page load
document.addEventListener('DOMContentLoaded', resetTimer);

// Optional: Update initial values if inputs change while timer is not running
minutesInput.addEventListener('change', () => {
    if (!timerInterval && !isPaused) {
        resetTimer(); // Update display if changed while stopped/reset
    }
});
secondsInput.addEventListener('change', () => {
    if (!timerInterval && !isPaused) {
        resetTimer(); // Update display if changed while stopped/reset
    }
});
