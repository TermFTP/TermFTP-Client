export enum Command {
	CONNECT = "connect",
	DISCONNECT = "disconnect",
  SAVE = "save"
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

export const definedCommands: CommandAction[] = [
  {
    type: Command.CONNECT,
    name: "Connect",
    description: ["connect", "TYPE", "IP", "USERNAME" , "PASSWORD"],
    references: {
      "TYPE": "FTP|SFTP|FTPS|<name>",
      "IP": "IP[:PORT]",
      "USERNAME": "username",
      "PASSWORD": "password",
    }
  },
  {
    type: Command.DISCONNECT,
    name: "Disconnect",
    description: ["disconnect"],
    references: {}
  },
  {
    type: Command.SAVE,
    name: "Save",
    description: ["save", "NAME", "TYPE", "IP", "USERNAME", "PASSWORD", "SSH"],
    references: {
      "NAME": "myserver",
      "TYPE": "FTP|SFTP|FTPS",
      "IP": "IP[:PORT]",
      "USERNAME": "username",
      "PASSWORD": "password",
      "SSH": "PORT"
    }
  }
]