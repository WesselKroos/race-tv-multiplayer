const { ipcRenderer } = require('electron')

document.querySelector('#close-btn').addEventListener('click' , () => {
  if(!history.state || history.state.videoId === undefined) return
  ipcRenderer.invoke('video-close-ipc', history.state.videoId)
})

// Auto-hide navBar
let hideNavBarTimeout
const hideNavBar = () => {
  hideNavBarTimeout = null
  document.body.classList.add('nav-hidden')
}
hideNavBarTimeout = setTimeout(hideNavBar, 2000)
window.addEventListener('mousemove', (e) => {
  if(hideNavBarTimeout) clearTimeout(hideNavBarTimeout)
  if(document.body.classList.contains('nav-hidden')) document.body.classList.remove('nav-hidden')
  hideNavBarTimeout = setTimeout(hideNavBar, 2000)
})

// Resize hints
let resizeHintTimeout
const hideResizeHint = () => {
  resizeHintTimeout = null
  document.body.classList.remove('resizing')
}
const onResize = () => {
  if(resizeHintTimeout) clearTimeout(resizeHintTimeout)
  if(!document.body.classList.contains('resizing')) document.body.classList.add('resizing')
  resizeHintTimeout = setTimeout(hideResizeHint, 3000)
}
window.addEventListener('resize', onResize)
window.addEventListener('move', onResize)

const webview = document.querySelector('#webview')
const titleBar = document.querySelector('#title-bar')
webview.addEventListener('page-title-updated', event => {
  const title = `Race TV Multiplayer | ${webview.getTitle()}`
  document.title = title
  titleBar.textContent = title
})

let webviewReady = false
const loadWebview = () => {
  if(!webviewReady || !history.state?.videoUrl || !history.state?.useragent) return
  webview.setUserAgent(history.state.useragent)
  webview.loadURL(history.state.videoUrl)

  const onDomReady = () => {
    webview.contentWindow.postMessage({ 
      type: 'state', 
      state: history.state
    }, '*')
  }
  webview.addEventListener('dom-ready', onDomReady)
  
}

const onDomReady = () => {
  webview.removeEventListener('dom-ready', onDomReady)
  webviewReady = true
  loadWebview()
}
webview.addEventListener('dom-ready', onDomReady)

ipcRenderer.on('state', (event, state) => {
  history.replaceState({ ...history.state, ...state }, '')
  loadWebview()
})

webview.addEventListener('dom-ready', () => {
  webview.insertCSS(`
::-webkit-scrollbar {
  width: 0;
}
.bmpui-ui-titlebar {
  display: none;
}

body.playing .inset-video-item-container {
  position: static !important;
}
body.playing .inset-video-item-image-container {
  position: fixed !important;
  z-index: 999999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
body.playing .bmpui-ui-playbacktoggle-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
}
body.playing .bmpui-ui-hugeplaybacktogglebutton {
  pointer-events: none;
}
body.playing .vod-detail-page > *:not(:first-child) {
  display: none;
}

.channel-switcher-obc-list {
  min-height: 100%;
}
  `)
})