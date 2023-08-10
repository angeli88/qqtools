/* 统一管理channel type */

// ipcHandle/ipcRemoteHandle
export const enum IpcRemoteHandleChannel {
  ShowOpenDialog = 'show-open-dialog',
  ShowSaveDialog = 'show-save-dialog'
}

// ipcHandle/xiaohongshuHandle
export const enum XiaohongshuHandleChannel {
  XiaohongshuWindoInit = 'xiaohongshu-window-init',
  XiaohongshuCookie = 'xiaohongshu-cookie',
  XiaohongshuDestroy = 'xiaohongshu-destroy',
  XiaohongshuChromeRemoteInit = 'xiaohongshu-chrome-remote-init',
  XiaohongshuChromeRemoteCookie = 'xiaohongshu-chrome-remote-cookie',
  XiaohongshuChromeRemoteSign = 'xiaohongshu-chrome-remote-sign'
}

// Electron ipc channel
export const enum WinIpcChannel {
  DeveloperTools = 'developer-tools'
}

// proxyServer
export const enum ProxyServerChannel {
  ProxyServer = 'proxy-server'
}