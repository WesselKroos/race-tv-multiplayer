const { ipcRenderer } = require('electron')
const { handleHotkeyListeners } = require('./lib/window/hotkeys')

const webview = document.querySelector('#webview')

document.querySelector('#back-btn').addEventListener('click' , () => {
  webview.goBack()
})
document.querySelector('#forward-btn').addEventListener('click' , () => {
  webview.goForward()
})
document.querySelector('#reload-btn').addEventListener('click' , () => {
  webview.reloadIgnoringCache()
})

handleHotkeyListeners(ipcRenderer, webview)

const urlBar = document.querySelector('#url-bar')
urlBar.addEventListener('focus', () => {
  document.execCommand('selectAll', false, null)
})

const urlBarProtocol = document.querySelector('#url-bar-protocol')
const urlBarHost = document.querySelector('#url-bar-host')
const urlBarPath = document.querySelector('#url-bar-path')
webview.addEventListener('page-title-updated', event => {
  const url = webview.getURL()
  const [ protocol, hostAndPath ] = url.split('://')
  urlBarProtocol.textContent = `${protocol}://`
  const [ host, ...path ] = hostAndPath.split('/')
  urlBarHost.textContent = host
  urlBarPath.textContent = `/${path.join('/')}`
  document.title = `Race TV Multiplayer | ${webview.getTitle()}`
})

// let lastIconUrl = ''
// webview.addEventListener('page-favicon-updated', event => {
//   const iconUrl = event.favicons[0]
//   if(lastIconUrl === iconUrl) return

//   lastIconUrl = iconUrl
//   ipcRenderer.invoke('icon-ipc', iconUrl)
// })

let currentUrl = 'https://f1tv.formula1.com'
webview.addEventListener('did-navigate-in-page', event => {
  if(event.url.startsWith('https://f1tv.formula1.com/detail/')) {
    const referrer = currentUrl
    
    webview.goBack()
    ipcRenderer.invoke('video-ipc', event.url, referrer)
  }
  currentUrl = event.url
})

let webviewReady = false
const loadWebview = () => {
  if(!webviewReady || !history.state || !history.state.useragent) return
  webview.setUserAgent(history.state.useragent)
  webview.loadURL('https://f1tv.formula1.com')
}
ipcRenderer.on('useragent', (event, useragent) => {
  history.replaceState({ ...history.state, useragent }, '')
  loadWebview()
})

const onDomReady = () => {
  webview.removeEventListener('dom-ready', onDomReady)
  webviewReady = true
  loadWebview()
}
webview.addEventListener('dom-ready', onDomReady)