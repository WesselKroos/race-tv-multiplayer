const electronLocalshortcut = require('electron-localshortcut')

const registerBrowserWindowHotkeyListeners = (win) => {
  electronLocalshortcut.register(win, ['F5'], () => {
    win.webContents.send('reload')
  })
  electronLocalshortcut.register(win, ['F12'], () => {
    win.webContents.send('openDevTools')
  })
}

const registerVideoWindowHotkeyListeners = (ipcMain, videoWindows) => {
  ipcMain.handle('reload', (event, videoId) => {
    videoWindows[videoId].win.webContents.send('reload')
  })
  ipcMain.handle('openDevTools', (event, videoId) => {
    videoWindows[videoId].win.webContents.send('openDevTools')
  })
}

const registerPreloadHotkeyListeners = (win, ipcRenderer, videoId) => {
  win.addEventListener('keydown', e => {
    console.log('keydown', e.key)
    if(e.key === 'F5') {
      ipcRenderer.invoke('reload', videoId)
    }
    if(e.key === 'F12') {
      ipcRenderer.invoke('openDevTools', videoId)
    }
  })
}

const handleHotkeyListeners = (ipcRenderer, webview) => {
  ipcRenderer.on('reload', (e, b) => {
    webview.reloadIgnoringCache()
  })

  ipcRenderer.on('openDevTools', (e, b) => {
    webview.openDevTools()
  })
}

module.exports = {
  registerBrowserWindowHotkeyListeners,
  registerVideoWindowHotkeyListeners,
  registerPreloadHotkeyListeners,
  handleHotkeyListeners
}