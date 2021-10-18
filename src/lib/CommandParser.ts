import { Command } from '@models';
import { BaseFTP, FTP, SFTP } from "@lib";

export function parseCommand(cmd: string, args: string[]): boolean {
	switch (findCmd(cmd)) {
		case Command.CONNECT: {

			if (args.length < 2) {
				return false;
			}

			const ip = args[0];
			const port = parseInt(args[1]) || 21;

			const ftp = new FTP({
				host: ip,
				port: port,
				sshPort: 22,
			});

			ftp.connect((data) => {
				console.log(data)
			});


			break;
		}

		// TODO ...
	}

	return true;
}

const keys = Object.keys(Command);
const values = Object.values(Command);

function findCmd(cmd: string): Command {
	for (let i = 0; i < keys.length; i++) {
		const c = keys[i];

		if (c.toUpperCase() == cmd.toUpperCase())
			return values[i] as Command;
	}
	return null;
}