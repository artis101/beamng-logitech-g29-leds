const testModeButton = document.getElementById("test-mode-button");
const wheelStatus = document.getElementById("wheel-status");
const wheelStatusVocal = document.getElementById("wheel-status-vocal");

const udpStatus = document.getElementById("udp-status");
const udpStatusVocal = document.getElementById("udp-status-vocal");
const udpAddress = document.getElementById("udp-address");
const udpPort = document.getElementById("udp-port");

const packetStatus = document.getElementById("packet-status");
const packetStatusVocal = document.getElementById("packet-status-vocal");

const modeStatusVocal = document.getElementById("mode-status-vocal");

const gameStatusItems = document.getElementById("game-status-items");

const rpmStatus = document.getElementById("rpm-status");
const maxRpmStatus = document.getElementById("max-rpm-status");

// eslint-disable-next-line no-undef
udpAddress.innerHTML = config.udpAddress;
// eslint-disable-next-line no-undef
udpPort.innerHTML = config.udpPort;

testModeButton.addEventListener("click", () => {
  // eslint-disable-next-line no-undef
  ipcRenderer.send("switch-to-test-mode");
});

// handle frontend state responsiveness
// eslint-disable-next-line no-undef
ipcRenderer.on("state-update", (state) => {
  wheelStatus.innerHTML = state.isConnectedToWheel ? "Connected" : "Not connected";

  if (state.isConnectedToWheel) {
    if (state.isConnectedToUDP) {
      if (state.inTestMode) {
        testModeButton.innerHTML = "Change to game mode";
        testModeButton.disabled = false;
      } else {
        testModeButton.innerHTML = "Change to test mode ";
        testModeButton.disabled = false;
      }
    } else {
      testModeButton.innerHTML = "Waiting for connection...";
      testModeButton.disabled = true;
    }

    wheelStatusVocal.innerHTML = "The app is successfully connected to the Logitech G29 wheel!";
  } else {
    testModeButton.innerHTML = "Waiting for connection...";
    testModeButton.disabled = true;
    wheelStatusVocal.innerHTML = "The app is now waiting to connect to the Logitech G29 wheel...";
  }

  if (state.isConnectedToUDP) {
    udpStatus.innerHTML = "Connected";
    udpStatusVocal.innerHTML = "The app is connected to the game via UDP on";
  } else {
    udpStatus.innerHTML = "Not connected";
    udpStatusVocal.innerHTML = "The app is now waiting to connect to the game via UDP on";
    packetStatus.innerHTML = "No";
    packetStatusVocal.innerHTML = "";
  }

  if (state.dataReceived && state.isConnectedToUDP) {
    packetStatusVocal.innerHTML = "The app has received data from the game!";
    packetStatus.innerHTML = "Yes";
    gameStatusItems.className = "";
  } else {
    packetStatusVocal.innerHTML = "The app is waiting to receive data from the game...";
    packetStatus.innerHTML = "No";
    gameStatusItems.className = "disabled";
  }

  if (state.inTestMode) {
    modeStatusVocal.innerHTML =
      "The app is now in test mode. You can test the app by pressing the accelerator pedal, and the LEDs will react accordingly.";
    gameStatusItems.className = "disabled";
  } else {
    modeStatusVocal.innerHTML =
      "The app is now in game mode. The LED's will now respond to the RPM received from game data";
  }

  if (state.currentRpm >= 0) {
    rpmStatus.innerHTML = state.currentRpm;
  }

  maxRpmStatus.innerHTML = `${parseInt(state.maxRpm, 10)}`;
});
