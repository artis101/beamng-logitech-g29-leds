const { DEFAULT_FLASH_INTERVAL, DEFAULT_BLINK_THRESHOLD, DEFAULT_MAX_RPM } = require("../config");

let state = {
  isConnectedToWheel: false,
  isConnectedToUDP: false,
  dataReceived: false,
  // app mode
  inTestMode: true,
  // adjustable user settings
  flashInterval: DEFAULT_FLASH_INTERVAL,
  blinkThreshold: DEFAULT_BLINK_THRESHOLD,
  maxRpm: DEFAULT_MAX_RPM,
  // techier stuff
  socket: null,
  currentRpm: 0.0,
};

function updateState(newState) {
  state = {
    ...state,
    ...newState,
  };
}

function getState() {
  return state;
}

module.exports = {
  updateState,
  getState,
};
