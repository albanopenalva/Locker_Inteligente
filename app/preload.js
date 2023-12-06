const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const {app_logger} = require("./log/app_logger");

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld('app_logger', {
  info: (context, msj) => app_logger.child(context).info(msj),
  error: (context, msj) => app_logger.child(context).error(msj),
});
