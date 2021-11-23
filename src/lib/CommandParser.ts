import { Command, CommandResult } from '@models';
import { BaseFTP, FTP, SFTP } from "@lib";
import { FTPConnectTypes } from '@shared';

export function parseCommand(cmd: string, args: string[]): CommandResult {
	switch (findCmd(cmd)) {
		case Command.CONNECT: {

			if (args.length < 2) {
				throw false;
			}

      const ftpType = findType(args[0]);
			const ip = args[1].split(':')[0];
			const port = parseInt(args[1].split(':')[1]) || 21;
      const username = args[2];
      const password = args[3];

      return {
        command: Command.CONNECT,
        data: {
          ip,
          ftpPort: port,
          sshPort: 22,
          username,
          password,
          ftpType,
        }
      };
		}

		// TODO ...
	}

	throw false;
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