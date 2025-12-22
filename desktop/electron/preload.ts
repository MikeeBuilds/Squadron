import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: string, data: any) => ipcRenderer.send(channel, data),
    onMessage: (channel: string, func: (...args: any[]) => void) => {
        const subscription = (event: any, ...args: any[]) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    // Dedicated Terminal IPC
    spawnTerminal: (id: string, shell: string, args: string[], cwd: string, env?: Record<string, string>) =>
        ipcRenderer.send('terminal-spawn', { id, shell, args, cwd, env }),
    writeTerminal: (id: string, data: string) => ipcRenderer.send('terminal-write', { id, data }),
    resizeTerminal: (id: string, cols: number, rows: number) => ipcRenderer.send('terminal-resize', { id, cols, rows }),
    killTerminal: (id: string) => ipcRenderer.send('terminal-kill', { id }),
    onTerminalData: (id: string, callback: (data: string) => void) => {
        const channel = `terminal-data-${id}`;
        const subscription = (_: any, data: string) => callback(data);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    onTerminalExit: (id: string, callback: (code: number) => void) => {
        const channel = `terminal-exit-${id}`;
        const subscription = (_: any, { exitCode }: { exitCode: number }) => callback(exitCode);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    // Settings IPC
    saveApiKey: (provider: string, key: string) => ipcRenderer.invoke('settings-save-key', { provider, key }),
    getApiKey: (provider: string) => ipcRenderer.invoke('settings-get-key', { provider }),
    deleteApiKey: (provider: string) => ipcRenderer.invoke('settings-delete-key', { provider }),
    getSettings: () => ipcRenderer.invoke('settings-get-all'),
    getEnabledProviders: () => ipcRenderer.invoke('settings-get-providers'),
    hasApiKey: (provider: string) => ipcRenderer.invoke('settings-has-key', { provider }),
    // CLI Installation IPC
    checkCliInstalled: (cli: string) => ipcRenderer.invoke('cli-check-installed', { cli }),
    installCli: (installCommand: string) => ipcRenderer.invoke('cli-install', { installCommand }),
});
