const { app, BrowserWindow } = require("electron");
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const server = require("./app");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: { 
      webSecurity: false 
    }
  });
  win.loadFile("./index.html");
};
app.whenReady().then(() => {
  createWindow();
});