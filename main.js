const { app, BrowserWindow, screen, ipcMain, nativeImage, session, ipcRenderer, globalShortcut } = require('electron')
const path = require('path')
const https = require('https')
const { restoreWindowSize, trackWindowSize } = require('./windowSizeStorage')

// You have to pass the directory that contains widevine library here, it is
// * `libwidevinecdm.dylib` on macOS,
// * `widevinecdm.dll` on Windows.
app.commandLine.appendSwitch('widevine-cdm-path', 'C:/Program Files (x86)/Google/Chrome/Application/100.0.4896.75/WidevineCdm/_platform_specific/win_x64/widevinecdm.dll')
// The version of plugin can be got from `chrome://components` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2449.0')

const icon = nativeImage.createFromPath('favicon-32x32.png')
const useragent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
let win;

// Open app
app.whenReady().then(() => {
  const display = screen.getPrimaryDisplay()
  const displaySize = display.workAreaSize
  const options = {
    x: 0,
    y: 0,
    width: Math.floor(displaySize.width / 2),
    height: displaySize.height,
    darkTheme: true,
    backgroundColor: '#222',
    opacity: 0,
    icon,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true,
      plugins: true
    }
  }
  restoreWindowSize('home', options)
  win = new BrowserWindow(options)
  win.setMenuBarVisibility(false)
  trackWindowSize(win, 'home')

  const readyToShow = () => {
    win.off('ready-to-show', readyToShow)
    win.webContents.send('useragent', useragent)
    win.focus()
    setTimeout(() => {
      win.setOpacity(1)
    }, 200)
  }
  win.on('ready-to-show', readyToShow)

  win.loadFile('home.html')

  // Open a window if none are open (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Close app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Download and display favicon
// ipcMain.handle('icon-ipc', async (event, iconUrl) => {
//   https.get(
//     iconUrl, 
//     {headers: {
//       'User-Agent': useragent
//     }},
//     (response) => {
//       const data = []
//       response.on('data', (chunk) => data.push(chunk))
//       response.on('end', () => {
//         if(response.statusCode !== 200) {
//           console.log('Failed to download favicon. Statuscode ', response.statusCode)
//           return
//         }
//         try {
//           const buffer = Buffer.concat(data)
//           if(!buffer) {
//             console.log('Failed to download favicon. No data received.')
//             return
//           }
//           const icon = nativeImage.createFromBuffer(buffer)
//           win.setIcon(icon)
//         } catch(ex) {
//           console.log('Failed to load favicon. Error:', ex.message)
//         }
//       })
//     }
//   )
// })

// Download and display favicon
const videoWindows = []
ipcMain.handle('video-ipc', (event, videoUrl, referrer) => {
  let windowIndex = videoWindows.findIndex(vw => vw === null)
  windowIndex = (windowIndex === -1) ? videoWindows.length : windowIndex
  const windowName = `video.${windowIndex}`

  const display = screen.getPrimaryDisplay()
  const displaySize = display.workAreaSize
  const options = {
    x: Math.floor(displaySize.width / 2),
    y: 0,
    width: Math.ceil(displaySize.width / 2),
    height: displaySize.height,
    darkTheme: true,
    backgroundColor: '#222',
    opacity: 0,
    icon,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true
    }
  }

  restoreWindowSize(windowName, options)
  const win = new BrowserWindow(options)
  win.setMenuBarVisibility(false)
  trackWindowSize(win, windowName)
  
  const videoWindow = {
    videoUrl,
    win
  }
  if(windowIndex < videoWindows.length) {
    videoWindows[windowIndex] = videoWindow
  } else {
    videoWindows.push(videoWindow)
  }
  
  const readyToShow = () => {
    win.off('ready-to-show', readyToShow)
    // win.maximize()
    win.focus()
    setTimeout(() => {
      win.setOpacity(1)
    }, 200)

    const [ noActionVideoUrl ] = videoUrl.split('?')
    win.webContents.send('state', {
      useragent,
      videoId: videoWindows.indexOf(videoWindow),
      videoUrl: `${noActionVideoUrl}?action=play`,
      referrer
    })
  }
  win.on('ready-to-show', readyToShow)

  win.on('closed', () => {
    videoWindows[videoWindows.indexOf(videoWindow)] = null
  })

  win.loadFile('detail.html')
})
ipcMain.handle('video-close-ipc', (event, videoId) => {
  videoWindows[videoId]?.win?.close()
})