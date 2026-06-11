#!/usr/bin/node

const dgram = require("dgram");
const readline = require("readline");
const logitech = require("logitech-g29");
const { parseRpmFromMessage, calculateRpmFraction, isValidRpmFraction } = require("./utils");
const {
  logInfo,
  logError,
  logWarning,
  setupUI,
  createProgressBars,
  updateGasPedalProgressBar,
  updateBrakePedalProgressBar,
  updateClutchPedalProgressBar,
  logFeedback,
} = require("./userInterface");
const { DEFAULT_FLASH_INTERVAL, DEFAULT_BLINK_THRESHOLD } = require("./config");

let isConnectedToWheel = false;
let inTestMode = true;
let socket;
let verboseOutput = false;
let flashInterval = DEFAULT_FLASH_INTERVAL;
let blinkThreshold = DEFAULT_BLINK_THRESHOLD;
let blinkState = 0;

let ledMode = "off"; // off | normal | shift

let currentRpm = 0
let rpmFraction = 0

function createAndBindSocket(port, address) {
  try {
    socket = dgram.createSocket("udp4");
    socket.bind(port, address);
    logFeedback(`Listening on ${address}:${port}`);
  } catch (err) {
    logError("\n[ERROR] Cannot create UDP socket:\n", err);
    process.exit(1);
  }
}

function connectToLogitechG29() {
  try {
    logitech.connect({ autocenter: false },function (err) {
      if (err) {
        logError("Failed to connect to the steering wheel:", err);
        process.exit(1);
      }
      isConnectedToWheel = true;
      logFeedback("\n[INFO] Connected to Logitech G29");
    });
  } catch (err) {
    logError("\n[ERROR] Cannot find or open Logitech G29 on this system:\n", err);
    process.exit(1);
  }
}

function handleGasPedalValueCb(val) {
  if (inTestMode) {
    logitech.leds(val);
    updateGasPedalProgressBar(val * 100);
  }
}

function handleBrakePedalValueCb(val) {
  if (inTestMode) {
    updateBrakePedalProgressBar(val * 100);
  }
}

function handleClutchPedalValueCb(val) {
  if (inTestMode) {
    updateClutchPedalProgressBar(val * 100);
  }
}

function handleTestMode() {
  if (!inTestMode) {
    inTestMode = true;
  }

  createProgressBars();

  logitech.on("pedals-gas", handleGasPedalValueCb);

  logitech.on("pedals-brake", handleBrakePedalValueCb);

  logitech.on("pedals-clutch", handleClutchPedalValueCb);

  logInfo("\n[INFO] Switching to test mode, press Ctrl+C to exit");
  logFeedback("\n[INFO] Press the pedals to see the LEDs in action");
  logInfo("\n[INFO] Waiting for UDP messages...");
}

function parseUDPMessage(msg, maxRpm) {
  currentRpm = parseRpmFromMessage(msg);
  rpmFraction = calculateRpmFraction(currentRpm, maxRpm);

  // dont let the parseudpmessage access the leds it has the ability to overwrite the blink

  if (rpmFraction <= 0) {
    ledMode = "off";
  } else if (rpmFraction >= blinkThreshold) {
    ledMode = "shift";
  } else {
    ledMode = "normal";
  }
}

function handleUserInput(input, currentMaxRpm, logInfo, logWarning, handleTestMode, cleanupAndExit) {
  switch (input) {
    case "exit":
    case "quit":
    case "q":
      cleanupAndExit();
      break;
    case "test":
      handleTestMode();
      break;
    default:
      const numberInput = Number(input);

      if (!isNaN(numberInput)) {
        currentMaxRpm = numberInput;
        logInfo(`\n[INFO] The Max RPM is now ${currentMaxRpm}`);
      } else {
        logWarning("\n[WARN] Invalid input, please enter a number or a command");
      }
      break;
  }

  return currentMaxRpm;
}

function handleGameMode(configuredMaxRpms) {
  let isInitialMessage = true;
  let currentMaxRpm = configuredMaxRpms;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", handleUserInput);

  socket.on("message", (msg) => {
    // If this is the first message, switch to game mode
    if (isInitialMessage) {
      inTestMode = false;
      isInitialMessage = false;
      logInfo("\n[INFO] Received first UDP message, switching to game mode");
      logFeedback("\n[INFO] The LEDs will now reflect the RPM, press Ctrl+C to exit");
      logFeedback("\n[INFO] Enjoy!");
    }

    if (!inTestMode) {
      parseUDPMessage(msg, currentMaxRpm);
    }
  });

  socket.on("error", (err) => {
    logError("\n[ERROR] Problem with UDP socket:", err);
    process.exit(1);
  });
}

function cleanupAndExit() {
  if (isConnectedToWheel) {
    logitech.disconnect(() => {
      logInfo("\n[INFO] Disconnected from Logitech G29");
      isConnectedToWheel = false;
    });
  }

  if (!socket._handle) {
    logInfo("[INFO] UDP socket closed");
    process.exit();
  } else {
    socket.close(() => {
      logInfo("[INFO] UDP socket closed");
      process.exit();
    });
  }
}

function runApp({
  port,
  address,
  maxRpm,
  verbose,
  flashInterval: configuredFlashInterval,
  blinkThreshold: configuredBlinkThreshold,
}) {
  verboseOutput = verbose; // ugly hack works for now
  if (configuredFlashInterval) {
    flashInterval = configuredFlashInterval;
  }
  if (configuredBlinkThreshold) {
    blinkThreshold = configuredBlinkThreshold;
  }

  setupUI();

  createAndBindSocket(port, address);

  connectToLogitechG29();

  handleTestMode();

  handleGameMode(maxRpm);

  setInterval(() => {
    if (inTestMode) return
    let safefraction = Math.max(0,Math.min(rpmFraction,1))
  switch (ledMode) {
    case "off":
      logitech.leds(0);
      break;

    case "normal":
      logitech.leds(safefraction); // optional scaling later
      break;

    case "shift":
      logitech.leds(blinkState);
      break;
  }
}, 1000/30);

setInterval(() => {
  blinkState = blinkState ? 0 : 1;
}, flashInterval);
}

process.on("SIGINT", cleanupAndExit);
process.on("SIGTERM", cleanupAndExit);

module.exports = {
  runApp,
  handleUserInput, // for tests
};
