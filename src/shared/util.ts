export const isDev = getIsDev();

function getIsDev(): boolean {
	const ENV = process.env.NODE_ENV || window.process.env.NODE_ENV;
	if (ENV) {
		return ENV.toLowerCase().includes("dev");
	} else {
		return false
	}
}