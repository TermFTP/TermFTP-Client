import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { json } from "body-parser";
import cors from "cors";
import { join } from "path";
import { ClientEvents, ServerEvents } from "@models";
import { SSHHandler } from "./socket/sshHandler";
import { SFTPHandler } from "./socket/sftpHandler";
import { FTPHandler } from "./socket/ftpHandler";
import { AddressInfo } from "net";

let port: number = undefined;
const oneSecond = 1000;

const app = express();
const server = createServer(app);
const io = new IOServer<ClientEvents, ServerEvents>(server, {
	cors: {
		origin: "*",
	}
});
app.use(json())
app.use(cors());
app.use(express.static(join(__dirname, ".."), { maxAge: oneSecond }));
app.get('/', function (req, res) {
	res.sendFile(join(__dirname, '..', '/index.html'));
});

io.on('connection', function (socket) {
	socket.on('ssh', SSHHandler(socket));
	socket.on('sftp', SFTPHandler(socket));
	socket.on('ftp', FTPHandler(socket))
});

export function startServer(): Promise<number> {
	if (port) {
		return Promise.resolve(port);
	}
	return new Promise((resolve) => {
		server.listen(0, "127.0.0.1", () => {
			port = (server.address() as AddressInfo).port;
			resolve(port);
		});
	});
}