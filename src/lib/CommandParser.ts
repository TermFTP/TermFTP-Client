import { Command } from '@models';

export function parse(cmd: string, args: string[]): boolean {

	switch (findCmd(cmd)) {
		case Command.CONNECT:

			//TODO

			break;

		// TODO ...
	}

	return true;
}

function findCmd(cmd: string): Command {
	for (const c in Command) {
		if (c.toUpperCase() == cmd.toUpperCase())
			return c as Command;
	}
	return null;
}