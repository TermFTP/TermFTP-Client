import { Command, CommandResult, definedCommands, CommandAction, Server } from '@models';
import { FTPConnectTypes } from '@shared';

export function parseCommand(cmd: string, args: string[], servers?: Server[]): CommandResult {
	switch (findCmd(cmd)) {
		case Command.CONNECT: {
      let server: Server;

			if (args.length == 1) {
        server = servers?.find(s => s.name.toLowerCase() === args[0].toLowerCase());
        if(!server) throw "Name does not exist";
			} else if(args.length > 1) {
        server = {
          serverID: undefined,
          ftpType: findType(args[0]),
          ip: args[1].split(':')[0],
          ftpPort: parseInt(args[1].split(':')[1]) || 21,
          sshPort: undefined,
          lastConnection: undefined,
          name: undefined,
          username: args[2] || "anonymous",
          password: args[3] || "", 
        }
      } else {
        throw "Not enough arguments";
      }

      return {
        command: Command.CONNECT,
        data: {
          ...server
        }
      };

		}
    case Command.DISCONNECT: {
      return {
        command: Command.DISCONNECT,
        data: null,
      }
    }
    case Command.SAVE: {
      if(args.length !== 6)
        throw "Not enough arguments";
      return {
        command: Command.SAVE,
        data: {
          name: args[0],
          ftpType: findType(args[1]),
          ip: args[2].split(':')[0],
          ftpPort: parseInt(args[2].split(':')[1]) || 21,
          username: args[3] || "anonymous",
          password: args[4] || "",
          sshPort: parseInt(args[5]) || 22,
        }
      }
    }
  }

	throw false;
}

export function matchCommand(cmd: string): CommandAction[] {
  const actions = []

  if(cmd.length == 0)
    return []

  for(const action of definedCommands) {
    const index = action.type.toLowerCase().indexOf(cmd.toLowerCase());
    if(index !== -1)
      actions.push({index, action});
  }

  return actions.sort((a,b) => a.index - b.index).map(a => a.action).flat().slice(0,5);
}

function findCmd(cmd: string): Command {
	const keys = Object.keys(Command);
  const values = Object.values(Command);

  for (let i = 0; i < keys.length; i++) {
		const c = keys[i];

		if (c.toUpperCase() == cmd.toUpperCase())
			return values[i] as Command;
	}
	return null;
}

function findType(type: string): FTPConnectTypes {
  const keys = Object.keys(FTPConnectTypes);
  const values = Object.values(FTPConnectTypes);

  for (let i = 0; i < keys.length; i++) {
		const c = keys[i];

		if (c.toUpperCase() == type.toUpperCase())
			return values[i] as FTPConnectTypes;
	}
	return FTPConnectTypes.SFTP;
}