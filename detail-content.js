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

const onLoad = () => {
  waitForDomElement(() => document.querySelector('.embedded-player-container.show'), 'body', () => {
    document.body.classList.add('playing')
  })

  //// Todo: sync videos
  // waitForDomElement(() => document.querySelector('video'), 'body', () => {
  //   const video = document.querySelector('video')
  //   console.log('video', video)
  //   // if(!video) return
  //   // video.currentTime = 30
  // })
}

window.addEventListener('DOMContentLoaded', () => {
  if(document.readyState === 'complete') {
    onLoad()
  } else {
    window.addEventListener('load', onLoad)
  }
})