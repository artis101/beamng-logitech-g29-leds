#!/usr/bin/node

const dgram = require("dgram");
const logitech = require("logitech-g29");
const {
  parseRpmFromMessage,
  calculateRpmFraction,
  isValidRpmFraction,
} = require("./utils");
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

let isConnectedToWheel = false;
let inTestMode = true;
let socket;

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
    logitech.connect(function (err) {
      if (err) {
        logError("Failed to connect to the steering wheel:", err);
        process.exit(1);
      }
      isConnectedToWheel = true;
      logFeedback("\n[INFO] Connected to Logitech G29");
    });
  } catch (err) {
    logError(
      "\n[ERROR] Cannot find or open Logitech G29 on this system:\n",
      err
    );
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
  createProgressBars();

  logitech.on("pedals-gas", handleGasPedalValueCb);

  logitech.on("pedals-brake", handleBrakePedalValueCb);

  logitech.on("pedals-clutch", handleClutchPedalValueCb);

  logInfo("\n[INFO] Switching to test mode, press Ctrl+C to exit");
  logFeedback("\n[INFO] Press the pedals to see the LEDs in action");
  logInfo("\n[INFO] Waiting for UDP messages...");
}

function handleMessage(maxRpm) {
  let currentRpm;
  let isInitialMessage = true;

  socket.on("message", (msg, rinfo) => {
    // If this is the first message, switch to game mode
    if (isInitialMessage) {
      inTestMode = false;
      isInitialMessage = false;
      logInfo("\n[INFO] Received first UDP message, switching to game mode");
      logFeedback(
        "\n[INFO] The LEDs will now reflect the RPM, press Ctrl+C to exit"
      );
      logFeedback("\n[INFO] Enjoy!");
    }

    if (!inTestMode) {
      currentRpm = parseRpmFromMessage(msg);
      const rpmFraction = calculateRpmFraction(currentRpm, maxRpm);

      if (isValidRpmFraction(rpmFraction)) {
        logitech.leds(rpmFraction);
        // TODO implement debug flag support
        // logInfo(
        //   `\n[INFO] Current RPM: ${currentRpm}, RPM Fraction: ${rpmFraction.toFixed(
        //     2
        //   )}`
        // );
      } else {
        // handle higher revs than maxRpm set in the config or by user
        // if the maxRpm is set too low, adjust it to the currentRpm
        if (rpmFraction > 1) {
          logWarning(
            `\n[WARN] Invalid RPM fraction: ${rpmFraction}. The Max RPM is set too low, adjusting to ${currentRpm}.`
          );
          maxRpm = currentRpm;
          logitech.leds(1);
        } else {
          logError(
            `\n[ERROR] Invalid RPM fraction: ${rpmFraction}. RPM fractions should be between 0 and 1.`
          );
        }
      }
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

function runApp({ port, address, maxRpm }) {
  setupUI();

  createAndBindSocket(port, address);

  connectToLogitechG29();

  handleTestMode();

  handleMessage(maxRpm);
}

process.on("SIGINT", cleanupAndExit);
process.on("SIGTERM", cleanupAndExit);

module.exports = {
  runApp,
};
