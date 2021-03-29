import * as process from 'process';
import * as path from 'path';
import * as url from 'url';
import { app, BrowserWindow, Menu } from 'electron';
import { initialize } from '@electron/remote/main';
import ipc from './ipc';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
let win: BrowserWindow | null = null;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告
initialize();

/* 初始化 */
function createWindow(): void {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      enableRemoteModule: true
    },
    icon: isDevelopment ? undefined : path.join(__dirname, '../../titleBarIcon.png')
  });

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  win.loadURL(url.format({
    pathname: isDevelopment
      ? path.join(__dirname, '../../qqtools/dist/index.html')
      : path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  win.on('closed', function(): void {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (win === null) {
    createWindow();
  }
});