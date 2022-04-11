const { ipcRenderer } = require('electron')

const waitForDomElement = (check, containerSelector, callback) => {
  if (check()) {
    callback()
  } else {
    const observer = new MutationObserver((mutationsList, observer) => {
      if (!check()) return
      observer.disconnect()
      callback()
    })
    observer.observe(document.querySelector(containerSelector), {
      childList: true,
      subtree: true
    })
    return observer
  }
}

let videoId;
let playerSettings;
const onLoad = () => {
  waitForDomElement(() => document.querySelector('.embedded-player-container.show video'), 'body', async () => {
    document.body.classList.add('playing')

    const switcher = document.querySelector('.channel-switcher-container')
    const selectSwitch = (settings) => {
      const button = (settings.control !== 'driver cams')
        ? switcher.querySelector(`button[aria-label="${settings.control}"]`)
        : Array.from(switcher.querySelectorAll(`.channel-switcher-obc-list button`))
          .find(button => button.querySelector('.racing-number')?.textContent === settings.racingNumber)
      if(!button) return

      button.click()
    }
    window.selectSwitch = selectSwitch

    await new Promise(async resolve => {
      const video = document.querySelector('.embedded-player-container.show video')
      if(video.readyState < 2) {
        await new Promise(resolve => {
          const onLoadeddata = async () => {
            video.removeEventListener('loadeddata', onLoadeddata)
            await new Promise(resolve => setTimeout(resolve, 1))
            resolve()
          }
          video.addEventListener('loadeddata', onLoadeddata)
        })
      }

      resolve()
    })

    if(playerSettings?.switch) {
      selectSwitch(playerSettings?.switch)
    }

    switcher.addEventListener('click', e => {
      const button = e.path.find(elem => elem.tagName === 'BUTTON')
      if(!button) return

      const isObcList = e.path.some(elem => elem.classList?.contains('channel-switcher-obc-list'))
      const isControlsList = e.path.some(elem => elem.classList?.contains('channel-switcher-controls-list'))
      if(!isObcList && !isControlsList) return
      
      let switchSettings;
      if(isObcList) {
        const racingNumber = button.querySelector('.racing-number')?.textContent
        if(racingNumber) {
          switchSettings = {
            control: 'driver cams',
            racingNumber
          }
        }
      } else if(isControlsList) {
        const controlName = button?.ariaLabel
        if(controlName) {
          switchSettings = {
            control: controlName
          }
        }
      }

      playerSettings = playerSettings || {}
      playerSettings.switch = switchSettings
      ipcRenderer.invoke('save-player-settings', videoId, playerSettings)
    })

    //// Todo: sync videos
    // waitForDomElement(() => document.querySelector('video'), 'body', () => {
    //   const video = document.querySelector('video')
    //   console.log('video', video)
    //   // if(!video) return
    //   // video.currentTime = 30
    // })
  })
}

window.addEventListener('DOMContentLoaded', () => {
  if(document.readyState === 'complete') {
    onLoad()
  } else {
    window.addEventListener('load', onLoad)
  }
})

window.addEventListener('message', (e) => {
  if(e.data.type !== 'state') return

  videoId = e.data.state.videoId
  playerSettings = e.data.state.settings?.player
})