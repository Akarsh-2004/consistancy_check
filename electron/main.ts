import { app, BrowserWindow } from 'electron';
import * as path from 'path';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#ffffff',
    show: false
  });

  // Load the index.html file in development, or the built files in production
  if (isDev) {
    win.loadURL('http://localhost:5173');
    // Open the DevTools in development mode
    win.webContents.openDevTools();
  } else {
    // In production, load the built files
    const indexPath = path.join(__dirname, '..', 'app', 'index.html');
    console.log('Loading index.html from:', indexPath);
    
    // Add a small delay to ensure the file is ready
    setTimeout(() => {
      win.loadFile(indexPath).catch(err => {
        console.error('Failed to load index.html:', err);
        // Fallback to a simple error page
        win.loadURL(`data:text/html;charset=utf-8,
          <html>
            <body>
              <h1>Error Loading Application</h1>
              <p>Failed to load the application. Please try reinstalling.</p>
              <pre>${err}</pre>
            </body>
          </html>
        `);
      });
    }, 1000);
  }

  // Show the window once it's ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Log any renderer process errors
  win.webContents.on('did-fail-load', (_event, _errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
  });
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('Error creating window:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
