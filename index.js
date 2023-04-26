const { app, BrowserWindow } = require("electron");
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
const path = require("path");
const fs = require("fs");
const server = require("./app");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: { 
      webSecurity: false ,
      nodeIntegration: true
    }
  });
 // win.loadURL("http://localhost:3000");
//  win.loadFile("./index.html");
  win.loadFile(`${__dirname}/index.html`);
};
app.whenReady().then(() => {
  createWindow();
});