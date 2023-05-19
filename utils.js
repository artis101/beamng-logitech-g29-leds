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

module.exports = {
  parseRpmFromMessage,
  calculateRpmFraction,
  isValidRpmFraction,
};
