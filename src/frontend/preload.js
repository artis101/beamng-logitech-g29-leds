const { ipcRenderer } = require("electron");

const { contextBridge } = require("electron");

const { PORT, ADDRESS } = require("../config");
const { getState } = require("./state");

// whitelist channels
const validChannels = ["switch-to-test-mode", "state-update"];

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("config", {
  udpPort: PORT,
  udpAddress: ADDRESS,
});

contextBridge.exposeInMainWorld("state", getState());

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_, ...args) => {
        func(...args);
      });
    }
  },
});
