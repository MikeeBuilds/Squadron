import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import * as pty from 'node-pty';
import { startPythonBackend, stopPythonBackend } from './process_manager';
import * as settingsStore from './settings-store';

// Terminal PTY Storage
const ptyProcesses = new Map<string, pty.IPty>();

function setupTerminalIPC(mainWindow: BrowserWindow) {
    ipcMain.on('terminal-spawn', (event, { id, shell, args, cwd, env }) => {
        // Kill existing process if any
        if (ptyProcesses.has(id)) {
            ptyProcesses.get(id)?.kill();
            ptyProcesses.delete(id);
        }

        // Resolve default shells and Windows extensions
        let shellPath = shell;
        if (!shellPath || shellPath === 'shell') {
            shellPath = process.platform === 'win32' ? 'powershell.exe' : 'zsh';
        }

        // On Windows, commands like 'npx' need to be 'npx.cmd'
        if (process.platform === 'win32' && !shellPath.endsWith('.exe') && !shellPath.endsWith('.cmd') && !shellPath.endsWith('.bat')) {
            if (shellPath === 'npx' || shellPath === 'npm') {
                shellPath = `${shellPath}.cmd`;
            }
        }

        console.log(`[PTY] Spawning: ${shellPath}`, args);

        // Merge custom env with process env
        const spawnEnv = { ...process.env, ...(env || {}) };

        try {
            const ptyProcess = pty.spawn(shellPath, args || [], {
                name: 'xterm-color',
                cols: 80,
                rows: 24,
                cwd: cwd || process.cwd(),
                env: spawnEnv as any,
                useConpty: true // ConPTY works better on Windows, AttachConsole errors are non-fatal
            });

            ptyProcess.onData((data) => {
                mainWindow.webContents.send(`terminal-data-${id}`, data);
            });

            ptyProcess.onExit(({ exitCode, signal }) => {
                console.log(`[PTY] Process ${id} exited with code ${exitCode}, signal ${signal}`);
                mainWindow.webContents.send(`terminal-exit-${id}`, { exitCode, signal });
                ptyProcesses.delete(id);
                console.log(`[PTY] Removed ${id}, remaining:`, Array.from(ptyProcesses.keys()));
            });

            ptyProcesses.set(id, ptyProcess);
            console.log(`[PTY] Stored process ${id}, total:`, ptyProcesses.size, Array.from(ptyProcesses.keys()));
        } catch (err) {
            console.error(`[PTY] Failed to spawn ${shellPath}:`, err);
            mainWindow.webContents.send(`terminal-data-${id}`, `\r\n\x1b[31m[ERROR] Failed to spawn ${shellPath}\x1b[0m\r\n\x1b[31m[ERROR] Error code: ${(err as any).code || 'unknown'}\x1b[0m\r\n`);
        }
    });

    ipcMain.on('terminal-write', (event, { id, data }) => {
        const ptyProcess = ptyProcesses.get(id);
        if (ptyProcess) {
            console.log(`[PTY] Writing to ${id}:`, data.length, 'bytes');
            ptyProcess.write(data);
        } else {
            console.error(`[PTY] No process found for ${id}, available:`, Array.from(ptyProcesses.keys()));
        }
    });

    ipcMain.on('terminal-resize', (event, { id, cols, rows }) => {
        const ptyProcess = ptyProcesses.get(id);
        if (ptyProcess) {
            ptyProcess.resize(cols, rows);
        }
    });

    ipcMain.on('terminal-kill', (event, { id }) => {
        const ptyProcess = ptyProcesses.get(id);
        if (ptyProcess) {
            ptyProcess.kill();
            ptyProcesses.delete(id);
        }
    });

    // Settings IPC Handlers
    ipcMain.handle('settings-save-key', async (_, { provider, key }) => {
        return settingsStore.saveApiKey(provider, key);
    });

    ipcMain.handle('settings-get-key', async (_, { provider }) => {
        return settingsStore.getApiKey(provider);
    });

    ipcMain.handle('settings-delete-key', async (_, { provider }) => {
        return settingsStore.deleteApiKey(provider);
    });

    ipcMain.handle('settings-get-all', async () => {
        return settingsStore.getAllSettings();
    });

    ipcMain.handle('settings-get-providers', async () => {
        return settingsStore.getEnabledProviders();
    });

    ipcMain.handle('settings-has-key', async (_, { provider }) => {
        return settingsStore.hasApiKey(provider);
    });

    // CLI Installation IPC Handlers
    ipcMain.handle('cli-check-installed', async (_, { cli }) => {
        const { exec } = require('child_process');
        const command = process.platform === 'win32' ? `where ${cli}` : `which ${cli}`;

        return new Promise<boolean>((resolve) => {
            exec(command, (error: any) => {
                resolve(!error);
            });
        });
    });

    ipcMain.handle('cli-install', async (_, { installCommand }) => {
        const { exec } = require('child_process');

        console.log(`[CLI Install] Running: ${installCommand}`);

        return new Promise<{ success: boolean; output: string }>((resolve) => {
            exec(installCommand, { shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash' }, (error: any, stdout: string, stderr: string) => {
                if (error) {
                    console.error(`[CLI Install] Error:`, error);
                    resolve({ success: false, output: stderr || error.message });
                } else {
                    console.log(`[CLI Install] Success:`, stdout);
                    resolve({ success: true, output: stdout });
                }
            });
        });
    });

    // Onboarding & Project IPC Handlers
    ipcMain.handle('settings-onboarding-complete', async () => {
        return settingsStore.isOnboardingComplete();
    });

    ipcMain.handle('settings-set-onboarding', async (_, { complete }) => {
        settingsStore.setOnboardingComplete(complete);
        return true;
    });

    ipcMain.handle('settings-set-project', async (_, { projectPath }) => {
        settingsStore.setProjectPath(projectPath);
        return true;
    });

    ipcMain.handle('settings-get-integrations', async () => {
        return settingsStore.getIntegrationConfig();
    });

    ipcMain.handle('settings-export-env', async (_, { targetPath }) => {
        return settingsStore.exportToEnvFile(targetPath);
    });

    ipcMain.handle('dialog-select-folder', async () => {
        const { dialog } = require('electron');
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Select Project Folder'
        });
        return result.canceled ? null : result.filePaths[0];
    });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        trafficLightPosition: { x: 16, y: 16 },
        title: 'Squadron',
        backgroundColor: '#09090b',
    });

    setupTerminalIPC(mainWindow);

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    startPythonBackend();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    // Kill all PTY processes on close
    for (const [id, ptyProcess] of ptyProcesses) {
        ptyProcess.kill();
    }
    ptyProcesses.clear();

    stopPythonBackend();
    if (process.platform !== 'darwin') app.quit();
});
