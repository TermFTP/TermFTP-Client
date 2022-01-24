export const isDev = getIsDev();

function getIsDev(): boolean {
	let win: Window & typeof globalThis = undefined;
	if (typeof window === "undefined") win = {} as Window & typeof globalThis
	else win = window
	const ENV = process?.env?.NODE_ENV || win?.process?.env?.NODE_ENV;
	if (ENV) {
		return ENV?.toLowerCase().includes("dev");
	} else {
		return false
	}
}