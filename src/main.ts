import { join, normalize } from "path";
import { app, BrowserWindow, Menu, MenuItem, webFrame, protocol } from "electron";
import isDev from "electron-is-dev";
import dotenv from "dotenv";
import { pathExists } from "fs-extra";

dotenv.config();
let win: BrowserWindow;

// webFrame.('file');
// webFrame.

function createWindow(): void {
  win = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      preload: join(app.getAppPath(), "util", "preload.js"),
      enableRemoteModule: true,
    },
    title: "Youtube Client",
    center: true,
    frame: false,
    autoHideMenuBar: true,
    resizable: true,
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    win.loadURL(`file://${join(__dirname, "./index.html")}`);
  }
  win.on("closed", () => (win = null));
  win.focus();
}

function createMenu(): void {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: "Open Console",
      accelerator: process.platform === "darwin" ? "Alt+CMD+I" : "Ctrl+Shift+I",
      click: () => {
        win.webContents.openDevTools();
      }, //new BrowserWindow().webContents.openDevTools
    })
  );

  menu.append(
    new MenuItem({
      label: "Quit",
      accelerator: process.platform === "darwin" ? "CMD+Q" : "Ctrl+Q",
      click: () => {
        app.quit();
      },
    })
  );

  win.setMenu(menu);
}

app.userAgentFallback =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) old-airport-include/1.0.0 Chrome Electron/7.1.7 Safari/537.36";

app.on("quit", () => app.quit());

app.on("ready", () => createWindow());
app.on("ready", () => createMenu());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
