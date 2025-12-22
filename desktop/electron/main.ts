import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startPythonBackend, stopPythonBackend } from './process_manager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hidden', // Auto-Claude style
        title: 'Squadron',
        backgroundColor: '#09090b', // Dark mode bg
    });

    // Load the index.html of the app.
    // Load the index.html of the app.
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // mainWindow.webContents.openDevTools(); // Clean startup
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    startPythonBackend(); // Start the Python server
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    stopPythonBackend(); // Ensure python is killed
    if (process.platform !== 'darwin') app.quit();
});
