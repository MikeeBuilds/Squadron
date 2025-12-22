import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Add IPC methods here
    sendMessage: (channel: string, data: any) => ipcRenderer.send(channel, data),
    onMessage: (channel: string, func: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
