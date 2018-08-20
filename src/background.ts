'use strict'

import {app, protocol, BrowserWindow, ipcMain} from 'electron'
import * as path from 'path'
import {format as formatUrl} from 'url'
import createProtocol from 'vue-cli-plugin-electron-builder/lib/createProtocol.js'
// import Event = Electron.Event;

const isDevelopment = process.env.NODE_ENV !== 'production'
app.__dirname = __dirname;
app.__static = __static;
console.log(__dirname, __static, app.__dirname);
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: any

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], {secure: true})

function createMainWindow() {
    app.commandLine.appendSwitch('disable-web-security');
    const window = new BrowserWindow({webPreferences: {webSecurity: false}});

    if (isDevelopment) {
        // Load the url of the dev server if in development mode
        window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
        if (!process.env.IS_TEST) window.webContents.openDevTools()
    } else {
        createProtocol('app')
        //   Load the index.html when not in development
        window.loadURL(
            formatUrl({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file',
                slashes: true
            })
        )
    }

    window.on('closed', () => {
        mainWindow = null
    })

    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow()
    }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow()
})
//
// ipcMain.on('split-chapter', function (event: Event, arg: any) {
//     split(arg.file, arg.charset, arg.regex, arg.replace, (result: Array<any>) => {
//         event.sender.send('split-chapter-finished', result);
//     });
// });
// ipcMain.on('export-split-chapter-result', function (event: Event, arg: any) {
//     exportResult();
// });