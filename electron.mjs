import electron from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import os from 'os';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const { app, BrowserWindow, ipcMain, dialog } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Check for Vite dev server URL first (dev mode)
  const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (viteDevServerUrl) {
    // Development mode - load from Vite dev server
    mainWindow.loadURL(viteDevServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load local file
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ─── Terminal IPC handlers (child_process based — no native modules needed) ──

let shellProcess = null;
let currentCwd = os.homedir();
const isWindows = os.platform() === 'win32';

// Send current working directory to renderer
function sendCwd(sender) {
  if (!sender.isDestroyed()) {
    sender.send('terminal-cwd', currentCwd);
  }
}

ipcMain.on('terminal-start', (event, cwd) => {
  currentCwd = cwd || app.getPath('home');
  // Announce ready with a welcome message
  if (!event.sender.isDestroyed()) {
    const shellName = isWindows ? 'PowerShell' : (process.env.SHELL || 'bash');
    event.sender.send('terminal-ready', { cwd: currentCwd, shell: shellName });
  }
});

ipcMain.on('terminal-run', (event, { command, cwd }) => {
  if (cwd) currentCwd = cwd;

  // Handle built-in `cd` separately so we can track cwd
  const trimmed = command.trim();

  // cd command: resolve new directory and update cwd
  if (/^cd(\s|$)/.test(trimmed)) {
    const targetRaw = trimmed.slice(2).trim();
    const target = targetRaw || os.homedir();
    const resolved = path.isAbsolute(target)
      ? target
      : path.resolve(currentCwd, target);

    try {
      fs.accessSync(resolved, fs.constants.F_OK);
      const stat = fs.statSync(resolved);
      if (stat.isDirectory()) {
        currentCwd = resolved;
        sendCwd(event.sender);
        event.sender.send('terminal-command-done', { exitCode: 0 });
      } else {
        event.sender.send('terminal-output', `\x1b[31m'${target}' is not a directory\x1b[0m\r\n`);
        event.sender.send('terminal-command-done', { exitCode: 1 });
      }
    } catch {
      event.sender.send('terminal-output', `\x1b[31mCannot access '${target}': no such file or directory\x1b[0m\r\n`);
      event.sender.send('terminal-command-done', { exitCode: 1 });
    }
    return;
  }

  // All other commands: run via shell
  let proc;
  if (isWindows) {
    proc = spawn('powershell.exe', [
      '-NoLogo', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-Command', command,
    ], {
      cwd: currentCwd,
      env: { ...process.env, TERM: 'xterm-256color' },
      windowsHide: true,
    });
  } else {
    const shell = process.env.SHELL || 'bash';
    proc = spawn(shell, ['-c', command], {
      cwd: currentCwd,
      env: { ...process.env, TERM: 'xterm-256color', FORCE_COLOR: '1' },
    });
  }

  shellProcess = proc;

  proc.stdout.on('data', (data) => {
    if (!event.sender.isDestroyed()) {
      // Normalize newlines to \r\n for xterm
      const text = data.toString().replace(/\r?\n/g, '\r\n');
      event.sender.send('terminal-output', text);
    }
  });

  proc.stderr.on('data', (data) => {
    if (!event.sender.isDestroyed()) {
      const text = data.toString().replace(/\r?\n/g, '\r\n');
      event.sender.send('terminal-output', `\x1b[31m${text}\x1b[0m`);
    }
  });

  proc.on('error', (err) => {
    shellProcess = null;
    if (!event.sender.isDestroyed()) {
      event.sender.send('terminal-output', `\x1b[31mError: ${err.message}\x1b[0m\r\n`);
      event.sender.send('terminal-command-done', { exitCode: 1 });
    }
  });

  proc.on('close', (code) => {
    shellProcess = null;
    if (!event.sender.isDestroyed()) {
      sendCwd(event.sender);
      event.sender.send('terminal-command-done', { exitCode: code ?? 0 });
    }
  });
});

ipcMain.on('terminal-interrupt', () => {
  if (shellProcess) {
    if (isWindows) {
      // On Windows, kill the process tree
      spawn('taskkill', ['/pid', String(shellProcess.pid), '/f', '/t'], { windowsHide: true });
    } else {
      shellProcess.kill('SIGINT');
    }
  }
});

ipcMain.on('terminal-kill', () => {
  if (shellProcess) {
    shellProcess.kill();
    shellProcess = null;
  }
});

app.on('before-quit', () => {
  if (shellProcess) {
    shellProcess.kill();
    shellProcess = null;
  }
});

// ─── File save IPC handlers ───────────────────────────────────────────────────

// IPC Handler for showing save dialog
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select folder to save website files',
  });
  return result;
});

// IPC Handler for saving website files
ipcMain.handle('save-website-files', async (event, { folderPath, htmlContent, cssContent }) => {
  try {
    const indexPath = path.join(folderPath, 'index.html');
    const stylePath = path.join(folderPath, 'style.css');

    fs.writeFileSync(indexPath, htmlContent, 'utf8');
    fs.writeFileSync(stylePath, cssContent, 'utf8');

    return { success: true, message: 'Files saved successfully!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
