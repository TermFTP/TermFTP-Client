import { Socket } from "socket.io";
import { Client, ConnectConfig } from "ssh2";
import { decode } from "utf8";
import { ClientEvents, ResizeData, ServerEvents } from "@models";
import { inDev } from "@common/helpers";

export const SSHHandler = (socket: Socket<ClientEvents, ServerEvents>) => (sshConfig: ConnectConfig): void => {
	// ssh connection
	const ssh = new Client();

	ssh.on('ready', () => {
		inDev() && socket.emit("ssh:data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
		ssh.shell((err, stream) => {
			if (err)
				return socket.emit(
					"ssh:data",
					"\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
				);
			socket.emit("ssh:init")

			socket.on("ssh:data", (data) => stream.write(data))

			socket.on("ssh:resize", (data: ResizeData) => stream.setWindow(data.rows.toString(), data.cols.toString(), data.height.toString(), data.width.toString()))

			stream
				.on('data', (data: any) => socket.emit("ssh:data", decode(data.toString("binary"))))
				.on('close', () => ssh.end());

			socket.on("ssh:disconnect", () => ssh.end())
		});
	})
		// TODO handle close for prod
		.on("close", () => inDev() && socket.emit("ssh:data", "\r\n*** SSH CONNECTION CLOSED ***\r\n"))
		.on('error', (err) => socket.emit("ssh:data", "\r\nSSH CONNECTION ERROR: " + err.message + "\r\n"))
		.connect(sshConfig);
}