const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  saveWebsiteFiles: (data) => ipcRenderer.invoke('save-website-files', data),
});
