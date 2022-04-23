const electronLocalshortcut = require('electron-localshortcut')

const registerHotkeyListeners = (win) => {
  electronLocalshortcut.register(win, ['F5'], () => {
    win.webContents.send('reload')
  })
  electronLocalshortcut.register(win, ['F12'], () => {
    win.webContents.send('openDevTools')
  })
}

const handleHotkeyListeners = (ipcRenderer, webview) => {
  ipcRenderer.on('reload', () => {
    webview.reloadIgnoringCache()
  })

  ipcRenderer.on('openDevTools', () => {
    webview.openDevTools()
  })
}

module.exports = {
  registerHotkeyListeners,
  handleHotkeyListeners
}