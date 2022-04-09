const { screen } = require('electron')
const fs = require('fs')

const getSavedBounds = (name) => {
  try {
    const data = fs.readFileSync(`windowBounds.${name}.json`)
    const bounds = JSON.parse(data)
    return bounds
  } catch(ex) {
    console.warn(ex.message)
  }
  return null
}

const restoreWindowSize = (name, options) => {
  const bounds = getSavedBounds(name)
  if (!bounds) return

  const area = screen.getDisplayMatching(bounds).workArea
  // Windows 10 workarounds
  area.x -= 8
  area.y -= 8
  area.width += 16
  area.height += 16

  // If the saved position still valid (the window is entirely inside the display area), use it.
  if (
    bounds.x >= area.x &&
    bounds.y >= area.y &&
    bounds.x + bounds.width <= area.x + area.width &&
    bounds.y + bounds.height <= area.y + area.height
  ) {
    options.x = bounds.x
    options.y = bounds.y
  }

  // If the saved size is still valid, use it.
  if (bounds.width <= area.width || bounds.height <= area.height) {
    options.width = bounds.width
    options.height = bounds.height
  }
}

let saveBoundsTimeout = {}
const saveBounds = (window, name) => {
  if (saveBoundsTimeout[name]) clearTimeout(saveBoundsTimeout[name])
  saveBoundsTimeout[name] = undefined
  const bounds = window.getNormalBounds()
  fs.writeFileSync(`windowBounds.${name}.json`, JSON.stringify(bounds, null, 2))
}
const saveBoundsSoon = (window, name) => {
  if (saveBoundsTimeout[name]) clearTimeout(saveBoundsTimeout[name])
  saveBoundsTimeout[name] = setTimeout(() => {
    saveBounds(window, name)
  }, 1000)
}

const trackWindowSize = (window, name) => {
  window.on('resize', () => saveBoundsSoon(window, name))
  window.on('move', () => saveBoundsSoon(window, name))
  window.on('close', () => saveBounds(window, name))
}

module.exports = {
  restoreWindowSize,
  trackWindowSize
}