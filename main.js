'use strict';

const {app, Menu, Tray, BrowserWindow, clipboard, ipcMain} = require('electron');
const {menubar} = require("menubar");
const path = require('path');
require('electron-reload')(process.cwd(), {
    electron: path.join(process.cwd(), 'node_modules', '.bin', 'electron')
});

app.on('ready', () => {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "preload.js"), // use a preload script
            devTools: false,
        },
        resizable: false,
        icon: __dirname + '/assets/ico/Icon-50@2x.png'
    });
    win.removeMenu();

    // Load app
    win.loadFile(path.join(__dirname, "index.html"));
    const mb = menubar({
        browserWindow: win,
        windowPosition: 'trayCenter',
        showDockIcon: false
    });


    mb.on('ready', () => {
        console.log('Menubar app is ready.');
    });

});

ipcMain.on("copy-to-clipboard", (event, args) => {
    console.log(args);
    clipboard.writeText(args);
});

