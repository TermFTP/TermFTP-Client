export enum Command {
	CONNECT = "connect",
	DISCONNECT = "disconnect",
	UPLOAD = "upload",
	DOWNLOAD = "download",
}

export interface CommandResult {
  command: Command,
  data: any,
}