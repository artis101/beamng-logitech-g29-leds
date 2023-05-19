#!/usr/bin/node

const dgram = require("dgram");
const readline = require("readline");
const logitech = require("logitech-g29");

const PORT = 4444;
const ADDRESS = "127.0.0.1";
const DEFAULT_MAX_RPM = 7000;

let maxRpm = DEFAULT_MAX_RPM;
let currentRpm;
let isInitialMessage = true;
let isConnectedToWheel = false;

const socket = dgram.createSocket("udp4");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function runApp() {
  rl.on("line", (input) => {
    maxRpm = Number(input);
    console.log(`\n[INFO] The Max RPM is now ${maxRpm}`);
  });

  console.log(`
  [INFO] Logitech G29 & BeamNG.drive utility
  This utility connects your Logitech G29 steering wheel's LEDs with BeamNG.drive game by reading the car's RPM data.

  Currently in test mode: LEDs respond to the gas pedal.

  Waiting for BeamNG.drive to connect at localhost:${PORT}...
  `);

  socket.bind(PORT, ADDRESS);

  logitech.connect(function (err) {
    if (err) {
      console.error("Failed to connect to the steering wheel:", err);
      process.exit(1);
    }

    isConnectedToWheel = true;

    let inTestMode = true;

    // Test mode
    logitech.on("pedals-gas", function (val) {
      if (inTestMode) {
        logitech.leds(val);
      }
    });

    socket.on("message", (msg, rinfo) => {
      if (isInitialMessage) {
        console.log(
          "\n[INFO] Connected to BeamNG.drive, switching from test mode to game mode."
        );
        console.log(
          "[INFO] Now the LEDs will respond to the car's RPM in the game."
        );
        console.log(
          "[INFO] You can enter the Max RPM of the car you are using at any time by typing the number of RPM in and pressing enter. The default is 7000 RPM."
        );
        inTestMode = false;
        isInitialMessage = false;
      }

      if (!inTestMode) {
        currentRpm = parseRpmFromMessage(msg);
        const rpmFraction = calculateRpmFraction(currentRpm, maxRpm);

        if (isValidRpmFraction(rpmFraction)) {
          logitech.leds(rpmFraction);
          console.log(
            `\n[INFO] Current RPM: ${currentRpm}, RPM Fraction: ${rpmFraction.toFixed(
              2
            )}`
          );
        } else {
          console.error(
            `\n[ERROR] Invalid RPM fraction: ${rpmFraction}. RPM fractions should be between 0 and 1.`
          );
        }
      }
    });

    // Handle any errors on the socket
    socket.on("error", (err) => {
      console.error("\n[ERROR] Problem with UDP socket:", err);
      process.exit(1);
    });
  });
}

function parseRpmFromMessage(msg) {
  // Extract the relevant bytes from the message.
  // The RPM data starts at the 17th byte (index 16, as indexes start from 0).
  // In this case, we're assuming that the RPM data is a 4-byte (32-bit) float,
  // so we extract the 17th through 20th bytes from the message.
  const rpmBytes = [msg[16], msg[17], msg[18], msg[19]];

  // Convert the array of bytes into a Uint8Array. Uint8Array represents an array of 8-bit unsigned integers.
  const rpmUint8Array = new Uint8Array(rpmBytes);

  // The buffer property of the Uint8Array references the ArrayBuffer that backs the array.
  // Create a new Float32Array view on that same ArrayBuffer. Float32Array represents an array of 32-bit floating point numbers.
  // As both views reference the same ArrayBuffer, the data is shared between them.
  const rpmFloat32Array = new Float32Array(rpmUint8Array.buffer);

  // Return the first (and only) element of the Float32Array, which is the RPM value we're interested in.
  return rpmFloat32Array[0];
}

function calculateRpmFraction(currentRpm, maxRpm) {
  return currentRpm / maxRpm;
}

function isValidRpmFraction(rpmFraction) {
  return rpmFraction >= 0 && rpmFraction <= 1;
}

process.on("SIGINT", cleanupAndExit);
process.on("SIGTERM", cleanupAndExit);

function cleanupAndExit() {
  if (isConnectedToWheel) {
    logitech.disconnect(() => {
      console.log("\n[INFO] Disconnected from Logitech G29");
      isConnectedToWheel = false;
      if (!socket._handle) {
        console.log("[INFO] UDP socket closed");
        process.exit();
      } else {
        socket.close(() => {
          console.log("[INFO] UDP socket closed");
          process.exit();
        });
      }
    });
  } else {
    if (!socket._handle) {
      console.log("[INFO] UDP socket closed");
      process.exit();
    } else {
      socket.close(() => {
        console.log("[INFO] UDP socket closed");
        process.exit();
      });
    }
  }
}

module.exports = {
  runApp,
  parseRpmFromMessage,
  calculateRpmFraction,
  isValidRpmFraction,
};
