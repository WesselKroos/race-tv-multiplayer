const { screen } = require('electron')
const fs = require('fs')
const { getSetting, setSetting } = require('./settings')

const restoreWindowSize = (windowName, options) => {
  const bounds = getSetting(`window.${windowName}.bounds`)
  if (!bounds) return

  const area = screen.getDisplayMatching(bounds).workArea
  area.x = 20
  area.y = 20
  area.width -= 40
  area.height -= 40

  // If the saved position still valid (the window is party inside the display area), use it.
  if (
    bounds.x < area.x + area.width &&
    bounds.y < area.y + area.height &&
    bounds.x + bounds.width > area.x &&
    bounds.y + bounds.height > area.y
  ) {
    options.x = bounds.x
    options.y = bounds.y
    options.width = bounds.width
    options.height = bounds.height
  }
}

const saveBounds = (window, windowName) => {
  setSetting(`window.${windowName}.bounds`, window.getNormalBounds())
}

const trackWindowSize = (window, windowName) => {
  saveBounds(window, windowName)
  window.on('resize', () => saveBounds(window, windowName))
  window.on('move', () => saveBounds(window, windowName))
}

module.exports = {
  restoreWindowSize,
  trackWindowSize
}