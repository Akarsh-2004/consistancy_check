// electron/preload.ts
// This script runs before your renderer process executes.
// It has access to Node.js APIs and can expose limited APIs to the renderer
// via the contextBridge module for security.

import { contextBridge } from 'electron';

// Expose a limited set of APIs to the renderer process
// For example, if you wanted to expose an API to get the Electron version:
contextBridge.exposeInMainWorld('electronAPI', {
  getElectronVersion: () => process.versions.electron
});