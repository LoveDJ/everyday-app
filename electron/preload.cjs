const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readData: () => ipcRenderer.invoke('data:read'),
  writeData: (data) => ipcRenderer.invoke('data:write', data),
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: () => ipcRenderer.invoke('data:import'),
});
