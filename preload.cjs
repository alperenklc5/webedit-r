const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  saveWebsiteFiles: (data) => ipcRenderer.invoke('save-website-files', data),
});

// Terminal API (child_process backed — no native modules required)
contextBridge.exposeInMainWorld('terminalAPI', {
  start: (cwd) => ipcRenderer.send('terminal-start', cwd),
  run: (command, cwd) => ipcRenderer.send('terminal-run', { command, cwd }),
  interrupt: () => ipcRenderer.send('terminal-interrupt'),
  kill: () => ipcRenderer.send('terminal-kill'),

  onReady: (cb) => {
    ipcRenderer.removeAllListeners('terminal-ready');
    ipcRenderer.on('terminal-ready', (_e, data) => cb(data));
  },
  onOutput: (cb) => {
    ipcRenderer.removeAllListeners('terminal-output');
    ipcRenderer.on('terminal-output', (_e, data) => cb(data));
  },
  onCommandDone: (cb) => {
    ipcRenderer.removeAllListeners('terminal-command-done');
    ipcRenderer.on('terminal-command-done', (_e, data) => cb(data));
  },
  onCwd: (cb) => {
    ipcRenderer.removeAllListeners('terminal-cwd');
    ipcRenderer.on('terminal-cwd', (_e, cwd) => cb(cwd));
  },
});
