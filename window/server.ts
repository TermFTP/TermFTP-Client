import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { json } from "body-parser";
import { Client, ConnectConfig, SFTPWrapper } from 'ssh2';
import { decode } from 'utf8';
import cors from "cors";
import { join } from "path";
import { isDev, ResizeData, SFTPResponseType, SFTPRequestType, SFTPRequest, ClientEvents, ServerEvents, SFTPResponse } from "../src/shared";
import { basename } from "path";
import { SSHHandler } from "./socket/ssh";
import { SFTPHandler } from "./socket/sftp";

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
});


server.listen(15000, "localhost");