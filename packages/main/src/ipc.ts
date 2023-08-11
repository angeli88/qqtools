import { ipcMain, type BrowserWindow } from 'electron';
import openDevTools from './ipcListener/openDevTools';
import { proxyServerInit } from './proxyServer/proxyServer';
import { WinIpcChannel, ProxyServerChannel } from './channelEnum';

/* 移除所有监听的通信 */
const removeListenerChannel: Array<string> = [
  WinIpcChannel.DeveloperTools,
  ProxyServerChannel.ProxyServer
];

export function removeIpc(): void {
  for (const channel of removeListenerChannel) {
    ipcMain.removeAllListeners(channel);
  }
}

/* ipc通信 */
export function ipc(win: BrowserWindow): void {
  openDevTools(win);
  proxyServerInit();
}