import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { json } from "body-parser";
import { Client, ConnectConfig } from 'ssh2';
import { decode } from 'utf8';
import cors from "cors";
import { join } from "path";
import { isDev, ResizeData, SFTPResponseType, SFTPRequestType, SFTPRequest } from "../src/shared";

const oneSecond = 1000;

const app = express();
const server = createServer(app);
const io = new IOServer(server, {
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

  socket.on('ssh', (sshConfig: ConnectConfig) => {
    // ssh connection
    const ssh = new Client();

    ssh.on('ready', () => {
      isDev && socket.emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
      ssh.shell((err, stream) => {
        if (err)
          return socket.emit(
            "data",
            "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
          );
        socket.emit("init")

        socket.on("data", (data) => stream.write(data))

        socket.on("resize", (data: ResizeData) => stream.setWindow(data.rows, data.cols, data.height, data.width))

        stream
          .on('data', (data) => socket.emit("data", decode(data.toString("binary"))))
          .on('close', () => ssh.end());

        socket.on("disconnect", () => ssh.end())
      });
    })
      .on("close", () => isDev && socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n"))
      .on('error', (err) => socket.emit("data", "\r\nSSH CONNECTION ERROR: " + err.message + "\r\n"))
      .connect(sshConfig);

  });

  socket.on('sftp', (sshConfig: ConnectConfig) => {
    const ssh = new Client();

    ssh.on('ready', () => {

      ssh.sftp((err, sftp) => {
        if (err) socket.emit('data', { type: SFTPResponseType.ERROR, data: err.message });

        //default listdir after connection established
        sftpReadDir(socket, sftp, '');

        socket.on('data', (req: SFTPRequest) => {
          switch (req.type) {
            // LIST DIRECTORY
            case SFTPRequestType.LIST:
              sftpReadDir(socket, sftp, req.data.dir);
              break;

            // DOWNLOAD FILE
            case SFTPRequestType.GET:
              sftp.fastGet(req.data.remotePath, req.data.localPath, {
                step: (transferred: number, chunk: number, total: number) => sftpStep(socket, transferred, chunk, total),
              }, (err) => {
                if (err) sftpErr(socket, err);
              });
              break;

            // UPLOAD FILE
            case SFTPRequestType.PUT:
              sftp.fastPut(req.data.localPath, req.data.remotePath, {
                step: (transferred: number, chunk: number, total: number) => sftpStep(socket, transferred, chunk, total),
              }, (err) => {
                if (err) sftpErr(socket, err);
              });
              break;

            // RENAME / MOVE
            case SFTPRequestType.RENAME:
              sftp.rename(req.data.srcPath, req.data.destPath, (err) => sftpErr(socket, err));
              break;
          }
        });

      });

    })
      .on('error', (err) => socket.emit('data', err.message))
      .connect(sshConfig);

  })


});

const sftpStep = (socket: any, transferred: number, chunk: number, total: number) => {
  socket.emit('data', {
    type: SFTPResponseType.TRANSFER_UPDATE,
    data: {
      transferred, chunk, total,
    }
  })
}

const sftpErr = (socket: any, err: any) => {
  socket.emit('data', {
    type: SFTPResponseType.ERROR,
    data: err.message,
  })
}

const sftpReadDir = (socket: any, sftp: any, dir: string) => {
  sftp.readdir(dir, (err, list) => {
    socket.emit('data', {
      type: SFTPResponseType.LIST,
      data: list,
    });
  });
}

server.listen(15000, "localhost");