import { ConnectConfig } from 'ssh2';
import { Terminal } from 'xterm';
import { connect, Socket } from "socket.io-client";
import { ResizeData } from '@models';
import { FitAddon } from 'xterm-addon-fit';
import { buildSocketURL } from '.';

export class SSH {

	private term?: Terminal;
	private elem: HTMLElement;
	private fitAddon: FitAddon;
	connected = false;
	private onDisconnect?: () => void;
	private socket?: Socket;

	constructor(fitAddon: FitAddon, onDisconnect?: () => void) {
		this.fitAddon = fitAddon;
		this.onDisconnect = onDisconnect;
	}

	disconnect = (): void => {
		this.connected = false;
		this.socket && this.socket.close();
		this.socket && this.socket.removeAllListeners()
		this.onDisconnect && this.onDisconnect();
		this.term && this.term.clear();
		this.socket = undefined;
		this.onDisconnect = undefined;
		this.term = undefined;
	}

	connect(config: ConnectConfig, term: Terminal, elem: HTMLElement): void {
		this.term = term;
		this.elem = elem;

		const socket = connect(buildSocketURL());
		this.socket = socket;
		socket.once("connect", () => {
			socket.emit("ssh", config)
			this.connected = true;
			// term.write("\r\n*** Connected to backend***\r\n");
			// Browser -> Backend
			term.onData((data) => {
				socket.emit("ssh:data", data);
			});
			socket.on("ssh:init", () => {
				this.resize();
			})
			// Backend -> Browser
			socket.on("ssh:data", function (data: string) {
				term.write(data);
			});
			socket.on("ssh:disconnect", this.disconnect);
		});
	}

	resize(): void {
		if (!this.socket || !this.elem || !this.fitAddon) return;

		this.fitAddon.fit();
		const dim = this.fitAddon.proposeDimensions();
		const style = this.elem.getBoundingClientRect();
		const data: ResizeData = {
			cols: dim.cols,
			height: style.height,
			rows: dim.rows,
			width: style.width,
		};
		this.socket.emit("ssh:resize", data);
	}

}

export default SSH;