# Race TV Multiplayer 

 Race TV Multiplayer is an open source F1TV desktop client for Windows with support for multi-monitor setups.

__This app is unofficial and is not associated in any way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing BV.__


# Installation (Windows)
1. Download the installer: [Download the Race TV Multiplayer installer](https://github.com/WesselKroos/race-tv-multiplayer/releases/download/1.0.0/Race.TV.Multiplayer.Setup.1.0.0.exe)
2. Execute the installer. If a SmartScreen warning pops up, select 'More info' and click 'Run anyway'.
#### Optional steps if you have an NVidia graphics card and stuttering video playback:
3. Open the `NVidia Control Panel`, go to: `3D settings` > `Manage 3D settings` > `Program Settings`.
4. Then add the `Race TV Multiplayer` app
5. Turn the program settings **Vertical sync** to `Off` and **Max Frame Rate** to `Off`
6. Press the `Apply` button and restart the app

# For developers (Windows)
## Installation
1. Install the LTS version of Node: [Node (LTS)](https://nodejs.org/)
2. Run in a cmd window: `npm install`
#### Optional steps for DRM support: (Required to play streams with Widevine DRM)
3. Install python 3: [Python 3](https://www.python.org/downloads/)
4. Install the castlabs-evs package for Python: `python -m pip install --upgrade castlabs-evs`
5. Sign up for an EVS account: `python -m castlabs_evs.account signup`
6. For DRM support while develping, sign the electron.exe file: `python -m castlabs_evs.vmp sign-pkg node_modules/electron/dist`
7. For more info about EVS: https://github.com/castlabs/electron-releases/wiki/EVS

## Start the app
1. run in a cmd window: `npm start`