const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
// const dgram = require("dgram");
const logitech = require("logitech-g29");
const { logError, logFeedback } = require("../userInterface");
const { getState, updateState } = require("./state");

let timeout;

async function connectToLogitechG29(setState) {
  const state = getState();

  if (!state.isConnectedToWheel) {
    try {
      logitech.connect(function (err) {
        if (err) {
          logError("Failed to connect to the steering wheel:", err);
        }

        clearTimeout(timeout);

        setState({
          isConnectedToWheel: true,
        });

        logFeedback("\n[INFO] Connected to Logitech G29");
      });
    } catch (err) {
      setState({
        isConnectedToWheel: false,
      });
      logError("Failed to connect to the steering wheel:", err);
    }

    timeout = setTimeout(() => {
      connectToLogitechG29(setState);
    }, 1000);
  } else if (timeout) {
    clearTimeout(timeout);
  }
}

function createWindow() {
  // Create the browser window
  const win = new BrowserWindow({
    width: 800, // 340
    height: 675,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html file
  win.loadFile(path.join(__dirname, "index.html"));

  const setState = (newState) => {
    updateState(newState);
    win.webContents.send("state-update", getState());
  };

  logitech.on("disconnect", function () {
    setState({
      isConnectedToWheel: false,
    });
    logFeedback("\n[INFO] Disconnected from Logitech G29");

    timeout = setTimeout(() => {
      connectToLogitechG29(setState);
    }, 1000);
  });

  ipcMain.on("switch-to-test-mode", () => {
    setState({
      inTestMode: !getState().inTestMode,
    });
  });

  connectToLogitechG29(setState);

  // createAndBindSocket(PORT, ADDRESS);

  // Open the DevTools
  win.webContents.openDevTools();
}

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Create a new window when the app is activated, if no windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// When the app is ready, create the window
function runApp() {
  app.whenReady().then(() => {
    createWindow();
  });
}

module.exports = {
  getState,
  updateState,
  runApp,
};
