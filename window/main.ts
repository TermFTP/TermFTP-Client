import { join } from "path";
import { app, BrowserWindow, Menu, MenuItem } from "electron";
import dotenv from "dotenv";
import { initialize } from "@electron/remote/main"
initialize()

import "./ipc";
import "./server"
import { isDev } from "../src/shared";

dotenv.config();
let win: BrowserWindow;

function createWindow(): void {
	win = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			nodeIntegration: true,
			preload: join(app.getAppPath(), "util", "preload.js"),
			contextIsolation: false
		},
		title: "TermFTP",
		center: true,
		frame: false,
		autoHideMenuBar: true,
		resizable: true,
		minHeight: 400,
		minWidth: 400,
		icon: join(app.getAppPath(), "assets", "logo.ico"),
	});

	if (isDev) {
		win.loadURL("http://localhost:14000");
		win.webContents.openDevTools();
	} else {
		win.loadURL(`http://localhost:15000`);
	}
	win.on("closed", (): void => (win = null));
	win.focus();
}

function createMenu(): void {
	const menu = new Menu();

	menu.append(
		new MenuItem({
			label: "Open console",
			accelerator: process.platform === "darwin" ? "Alt+CMD+I" : "Ctrl+Shift+I",
			click: () => {
				win.webContents.openDevTools();
			},
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

app.commandLine.appendSwitch('auto-detect', 'false')
app.commandLine.appendSwitch('no-proxy-server')
