import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { registerTitlebarIpc } from '@misc/window/titlebarIPC';
import { registerWindowIpc } from '@misc/window/windowIPC';
import { startServer } from './server';
import { inDev } from '@common/helpers';
import { csp } from '@tools/forge/forge.config';

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let appWindow: BrowserWindow;

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export async function createAppWindow(): Promise<BrowserWindow> {
	// Create new window instance
	appWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		backgroundColor: '#202020',
		show: false,
		autoHideMenuBar: true,
		frame: false,
		titleBarStyle: 'hidden',
		icon: path.resolve('assets/images/appIcon.ico'),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			nodeIntegrationInWorker: false,
			nodeIntegrationInSubFrames: false,
			preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
			sandbox: false,
		},
		center: true,
		title: "TermFTP",
		resizable: true,
		minHeight: 400,
		minWidth: 400,
	});

	// Load the index.html of the app window.
	appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);

	// Show window when its ready to
	appWindow.on('ready-to-show', () => {
		appWindow.show()
		appWindow.webContents.send('server-port', port)
	});

	// Register Inter Process Communication for main process
	registerMainIPC();

	// Close all windows when main window is closed
	appWindow.on('close', () => {
		appWindow = null;
		app.quit();
	});

	const port = await startServer();
	if (!inDev()) {
		session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
			callback({
				responseHeaders: {
					...details.responseHeaders,
					'Content-Security-Policy': [csp(port.toString())]
				}
			})
		})
	}

	return appWindow;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
	/**
	 * Here you can assign IPC related codes for the application window
	 * to Communicate asynchronously from the main process to renderer processes.
	 */
	registerTitlebarIpc(appWindow);
	registerWindowIpc();
}

//app.commandLine.appendSwitch('no-proxy-server')
