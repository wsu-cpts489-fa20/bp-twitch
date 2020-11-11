const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');   
const path = require('path');
 
let mainWindow;
 
function createWindow() {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        webPreferences: {
            nodeIntegration: true,
            nativeWindowOpen: true,
            preload: __dirname + '/preload.js'
        }
    });
    const startURL = isDev ? 'http://localhost:8081' : `file://${path.join(__dirname, '../client/build/index.html')}`;
 
    mainWindow.loadURL(startURL);
 
    mainWindow.once('ready-to-show', () =>  {
        mainWindow.show();
        console.log(startURL);
    });
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