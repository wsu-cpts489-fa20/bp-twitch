const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const isDev = require('electron-is-dev');   
const path = require('path');
require("../server.compiled.js");
 
let mainWindow;
 
function createWindow() {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            nativeWindowOpen: true,
            preload: __dirname + '/preload.js'
        }
    });
    const startURL = 'http://localhost:8081';
 
    mainWindow.loadURL(startURL);
 
    mainWindow.once('ready-to-show', () => mainWindow.show());
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    ipcMain.on('close-window', () => {
        app.quit();
    })
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize();
    })
    ipcMain.on('maximize-window', () => {
        mainWindow.maximize();
    })
}
app.on('ready', createWindow);