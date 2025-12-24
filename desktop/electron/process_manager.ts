import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let pythonProcess: ChildProcess | null = null;
const PY_MODULE = 'squadron.server';

export function startPythonBackend() {
    if (pythonProcess) return;

    // Resolve the root of the project (parent of desktop/)
    // In dev: desktop/electron/process_manager.ts -> desktop/electron -> desktop -> root
    // In prod: resources/app/dist-electron -> resources/app -> resources -> root (packaged structure varies)

    // For now, let's optimize for DEV mode first.
    // We assume we are running from 'desktop/'
    const projectRoot = path.resolve(__dirname, '../../');

    console.log('🚀 [Process Manager] Starting Python Backend...');
    console.log('📂 [Process Manager] Project Root (CWD):', projectRoot);
    console.log('🐍 [Process Manager] Command: python -m', PY_MODULE);

    pythonProcess = spawn('python', ['-m', PY_MODULE], {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin, pipe stdout/stderr
        windowsHide: true, // Hide the terminal window
        env: {
            ...process.env,
            PYTHONUNBUFFERED: '1',
            PYTHONIOENCODING: 'utf-8' // Force UTF-8 to avoid Windows console encoding crash
        }
    });

    // Redirect Python output to Electron console
    if (pythonProcess.stdout) {
        pythonProcess.stdout.on('data', (data) => console.log(`[Python]: ${data}`));
    }
    if (pythonProcess.stderr) {
        pythonProcess.stderr.on('data', (data) => console.error(`[Python API]: ${data}`));
    }

    pythonProcess.on('error', (err) => {
        console.error('❌ Failed to start Python backend:', err);
    });

    pythonProcess.on('exit', (code, signal) => {
        console.log(`💀 Python backend exited with code ${code} and signal ${signal}`);
        pythonProcess = null;
    });
}

export function stopPythonBackend() {
    if (pythonProcess) {
        console.log('🛑 Stopping Python Backend...');
        pythonProcess.kill();
        pythonProcess = null;
    }
}
// Note: Cleanup handlers are registered in main.ts at app startup

