export enum Command {
	CONNECT = "connect",
	DISCONNECT = "disconnect",
	UPLOAD = "upload",
	DOWNLOAD = "download",
}

export interface CommandAction {
  type: Command,
  name: string,
  description: string[],
  references: any,
}

export interface CommandResult {
  command: Command,
  data: any,
}

export const definedCommands = [
  {
    type: Command.CONNECT,
    name: "Connect",
    description: ["connect", "TYPE", "IP", "USERNAME" , "PASSWORD"],
    references: {
      "TYPE": "FTP|SFTP|FTPS",
      "IP": "IP[:PORT]",
      "USERNAME": "username",
      "PASSWORD": "password",
    }
  },
  {
    type: Command.DISCONNECT,
    name: "Disconnect",
    description: ["disconnect"],
    references: {
       
    }
  }
]