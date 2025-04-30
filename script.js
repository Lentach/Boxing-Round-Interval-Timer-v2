// Constants
const TIMER_STATES = {
  PREPARE: 'PREPARE',
  WORK: 'WORK',
  REST: 'REST',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED'
};

// Default Settings
const DEFAULT_SETTINGS = {
  roundMinutes: 3,
  roundSeconds: 0,
  restMinutes: 1,
  restSeconds: 0,
  roundCount: 12
};

// Timer Variables
let timerState = TIMER_STATES.PREPARE;
let currentSeconds = 0;
let currentRound = 0;
let totalRounds = DEFAULT_SETTINGS.roundCount;
let roundTime = DEFAULT_SETTINGS.roundMinutes * 60 + DEFAULT_SETTINGS.roundSeconds;
let restTime = DEFAULT_SETTINGS.restMinutes * 60 + DEFAULT_SETTINGS.restSeconds;
let timerInterval = null;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const roundDisplay = document.getElementById('round-display');
const stateDisplay = document.getElementById('state-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const applyBtn = document.getElementById('apply-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Helper: sprawdź czy jesteśmy na desktopie
function isDesktop() {
  return window.matchMedia('(min-width: 769px)').matches;
}

function showSettingsPanel() {
  settingsPanel.classList.add('settings-visible');
  if (isDesktop()) {
    settingsPanel.classList.remove('d-none');
  }
}

function hideSettingsPanel() {
  settingsPanel.classList.remove('settings-visible');
  if (isDesktop()) {
    settingsPanel.classList.add('d-none');
  }
}

// Timer Functions
function startTimer() {
  if (timerState === TIMER_STATES.PAUSED || timerState === TIMER_STATES.PREPARE) {
    if (timerState === TIMER_STATES.PREPARE) {
      currentRound = 1;
      timerState = TIMER_STATES.WORK;
      currentSeconds = roundTime;
    }
    
    timerInterval = setInterval(updateTimer, 1000);
    updateDisplay();
  }
}

function stopTimer() {
  if (timerState === TIMER_STATES.WORK || timerState === TIMER_STATES.REST) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerState = TIMER_STATES.PAUSED;
    updateDisplay();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerState = TIMER_STATES.PREPARE;
  currentRound = 0;
  currentSeconds = 0;
  updateDisplay();
}

function updateTimer() {
  if (currentSeconds > 0) {
    currentSeconds--;
  } else {
    // State transition
    if (timerState === TIMER_STATES.WORK) {
      if (currentRound < totalRounds) {
        timerState = TIMER_STATES.REST;
        currentSeconds = restTime;
      } else {
        timerState = TIMER_STATES.FINISHED;
        clearInterval(timerInterval);
      }
    } else if (timerState === TIMER_STATES.REST) {
      currentRound++;
      if (currentRound <= totalRounds) {
        timerState = TIMER_STATES.WORK;
        currentSeconds = roundTime;
      } else {
        timerState = TIMER_STATES.FINISHED;
        clearInterval(timerInterval);
      }
    }
  }
  updateDisplay();
}

function updateDisplay() {
  // Update timer display
  if (timerState === TIMER_STATES.PREPARE) {
    timerDisplay.textContent = formatTime(roundTime);
  } else {
    timerDisplay.textContent = formatTime(currentSeconds);
  }
  
  // Update round display
  roundDisplay.textContent = `Round ${currentRound}/${totalRounds}`;
  
  // Update state display with user-friendly text
  let stateText = timerState;
  if (timerState === TIMER_STATES.WORK) {
    stateText = "ROUND IN PROGRESS";
  } else if (timerState === TIMER_STATES.REST) {
    stateText = "REST PERIOD";
  } else if (timerState === TIMER_STATES.PREPARE) {
    stateText = "READY";
  } else if (timerState === TIMER_STATES.PAUSED) {
    stateText = "PAUSED";
  } else if (timerState === TIMER_STATES.FINISHED) {
    stateText = "WORKOUT COMPLETE";
  }
  stateDisplay.textContent = stateText;
  
  // Add state-specific classes for styling
  stateDisplay.className = 'h5'; // Reset classes
  if (timerState === TIMER_STATES.WORK) {
    stateDisplay.classList.add('state-work');
    timerDisplay.classList.add('state-work');
  } else if (timerState === TIMER_STATES.REST) {
    stateDisplay.classList.add('state-rest');
    timerDisplay.classList.add('state-rest');
  } else if (timerState === TIMER_STATES.PAUSED) {
    stateDisplay.classList.add('state-paused');
    timerDisplay.classList.add('state-paused');
  } else if (timerState === TIMER_STATES.FINISHED) {
    stateDisplay.classList.add('state-finished');
    timerDisplay.classList.add('state-finished');
  } else {
    // Prepare state - reset timer display color
    timerDisplay.classList.remove('state-work', 'state-rest', 'state-paused', 'state-finished');
  }
  
  // Update button states based on timer state
  startBtn.disabled = timerState === TIMER_STATES.FINISHED;
  stopBtn.disabled = timerState === TIMER_STATES.PREPARE || timerState === TIMER_STATES.PAUSED || timerState === TIMER_STATES.FINISHED;
  
  // Log current state for debugging
  console.log(`script.js: Timer state updated - ${timerState}, Round ${currentRound}/${totalRounds}, Time: ${formatTime(currentSeconds)}`);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Settings Functions
function toggleSettingsPanel() {
  // Update form values with current settings before showing
  if (!settingsPanel.classList.contains('settings-visible')) {
    document.getElementById('round-minutes').value = Math.floor(roundTime / 60);
    document.getElementById('round-seconds').value = roundTime % 60;
    document.getElementById('rest-minutes').value = Math.floor(restTime / 60);
    document.getElementById('rest-seconds').value = restTime % 60;
    document.getElementById('round-count').value = totalRounds;
    showSettingsPanel();
    console.log('script.js: Settings panel shown');
  } else {
    hideSettingsPanel();
    console.log('script.js: Settings panel hidden');
  }
}

function applySettings() {
  // Get values from form
  const roundMinutes = parseInt(document.getElementById('round-minutes').value) || 0;
  const roundSeconds = parseInt(document.getElementById('round-seconds').value) || 0;
  const restMinutes = parseInt(document.getElementById('rest-minutes').value) || 0;
  const restSeconds = parseInt(document.getElementById('rest-seconds').value) || 0;
  const roundCount = parseInt(document.getElementById('round-count').value) || 1;
  
  // Validate input
  if (roundMinutes < 0 || roundSeconds < 0 || roundSeconds > 59 ||
      restMinutes < 0 || restSeconds < 0 || restSeconds > 59 ||
      roundCount < 1) {
    alert('Please enter valid values for all fields.');
    return;
  }
  if (roundMinutes === 0 && roundSeconds === 0) {
    alert('Round time cannot be zero. Please enter a valid round time.');
    return;
  }
  // Update settings
  roundTime = roundMinutes * 60 + roundSeconds;
  restTime = restMinutes * 60 + restSeconds;
  totalRounds = roundCount;
  console.log(`script.js: Settings applied - Round time: ${formatTime(roundTime)}, Rest time: ${formatTime(restTime)}, Rounds: ${totalRounds}`);
  resetTimer();
  // Hide settings panel (slide out)
  hideSettingsPanel();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);
  settingsBtn.addEventListener('click', toggleSettingsPanel);
  applyBtn.addEventListener('click', applySettings);
  cancelBtn.addEventListener('click', hideSettingsPanel);
  // Obsługa przycisku Zamknij (X)
  const closeBtn = document.getElementById('close-settings-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideSettingsPanel);
  }
  
  // Add button hover effects
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.classList.add('shadow');
    });
    btn.addEventListener('mouseleave', function() {
      this.classList.remove('shadow');
    });
  });
  
  // Initialize
  updateDisplay();
  
  console.log('script.js: Boxing Round Interval Timer initialized successfully');
});

// Obsługa zmiany rozmiaru okna: jeśli panel jest otwarty i zmieniamy tryb mobile/desktop, popraw widoczność
window.addEventListener('resize', () => {
  if (settingsPanel.classList.contains('settings-visible')) {
    if (isDesktop()) {
      settingsPanel.classList.remove('d-none');
    } else {
      settingsPanel.classList.remove('d-none'); // na mobile panel zawsze widoczny (display: block)
    }
  } else {
    if (isDesktop()) {
      settingsPanel.classList.add('d-none');
    }
  }
}); 