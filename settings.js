const { screen } = require('electron')
const fs = require('fs')
const getDirName = require('path').dirname;

let settings;
const getSettings = () => {
  try {
    if(!settings) {
      settings = JSON.parse(fs.readFileSync(`config/settings.json`)) || {}
    }
  } catch(ex) {
    console.warn(ex.message)
    settings = {}
  }
  return settings
}

let saveSettingsTimeout;
const saveSettings = async () => {
  if(saveSettingsTimeout) clearTimeout(saveSettingsTimeout)
  saveSettingsTimeout = undefined
  try {
    await new Promise((resolve, reject) => {
      try {
        const path = 'config/settings.json'
        fs.mkdir(getDirName(path), { recursive: true}, (error) => {
          if(error) return reject(error)
      
          try {
            const content = JSON.stringify(getSettings(), null, 2)
            fs.writeFile(path, content, (error) => {
              if(error) return reject(error)
              resolve()
            })
          } catch(error) {
            reject(error)
          }
        })
      } catch(error) {
        reject(error)
      }
    })
  } catch(error) {
    console.error(error)
  }
}

const scheduleSaveSettings = () => {
  if(saveSettingsTimeout) clearTimeout(saveSettingsTimeout)
  saveSettingsTimeout = setTimeout(async() => {
    saveSettingsTimeout = undefined
    saveSettings()
  }, 1000)
}

const flushPendingSettings = async () => {
  if(!saveSettingsTimeout) return

  saveSettingsTimeout = undefined
  await saveSettings()
}

const getSetting = (path) => {
  const pathParts = path.split('.')
  let value = getSettings()
  for(const pathPart of pathParts) {
    value = value[pathPart]
    if(value === undefined) break
  }
  return value
}

const setSetting = (path, value) => {
  const pathParts = path.split('.')
  let settingPart = getSettings()
  for(let i = 0; i < pathParts.length; i++) {
    const pathPart = pathParts[i]
    if(settingPart[pathPart] === undefined) {
      settingPart[pathPart] = {}
    }
    if(i !== pathParts.length - 1) {
      settingPart = settingPart[pathPart]
    } else {
      settingPart[pathPart] = value
    }
  }
  scheduleSaveSettings()
}

module.exports = {
  getSetting,
  setSetting,
  flushPendingSettings
}