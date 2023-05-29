import titlebarContext from "@misc/window/titlebarContext"

declare global {
	interface Window {
		electron_window?: {
			titlebar: typeof titlebarContext;
			port: number;
		}
		process: NodeJS.Process;
		setImmediate: typeof setImmediate;
		clearImmediate: typeof clearImmediate;
	}

	namespace Electron {
		namespace CrossProcessExports {
			interface BrowserWindow {
				serverPort: number;
			}
		}
	}
}