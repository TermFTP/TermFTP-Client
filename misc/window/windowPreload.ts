import { ipcRenderer } from "electron";
import titlebarContext from "./titlebarContext";

window.electron_window = {
	...window?.electron_window,
	titlebar: titlebarContext,
}

ipcRenderer.on("server-port", (event, port) => {
	console.log("[ERWT] : Server port is", port);
	window.electron_window.port = port;
});

// contextBridge.exposeInMainWorld('electron_window', {
// 	titlebar: titlebarContext,
// 	process: process,
// 	setImmediate: setImmediate,
// 	clearImmediate: clearImmediate,
// });
