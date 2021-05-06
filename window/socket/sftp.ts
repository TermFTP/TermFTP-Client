import { basename } from "path";
import { Socket } from "socket.io";
import { Client, ConnectConfig, SFTPWrapper } from "ssh2";
import { ClientEvents, ServerEvents, SFTPRequest, SFTPRequestType, SFTPResponse, SFTPResponseType } from "../../src/shared";

export const SFTPHandler = (socket: Socket<ClientEvents, ServerEvents>) => (sshConfig: ConnectConfig): void => {
  const ssh = new Client();

  ssh.on('ready', () => {

    ssh.sftp((err, sftp) => {
      if (err) socket.emit('sftp:data', { type: SFTPResponseType.ERROR, data: err.message });

      //default listdir after connection established
      sftpReadDir(socket, sftp, '');

      socket.on('sftp:data', (req: SFTPRequest) => {
        switch (req.type) {
          // LIST DIRECTORY
          case SFTPRequestType.LIST:
            sftpReadDir(socket, sftp, req.data.dir);
            break;

          // DOWNLOAD FILE
          case SFTPRequestType.GET:
            sftp.fastGet(req.data.remotePath, req.data.localPath, {
              step: (transferred: number, chunk: number, total: number) => sftpStep(socket, basename(req.data.remotePath), transferred, chunk, total),
            }, (err) => {
              if (err) sftpErr(socket, err);
            });
            break;

          // UPLOAD FILE
          case SFTPRequestType.PUT:
            sftp.fastPut(req.data.localPath, req.data.remotePath, {
              step: (transferred: number, chunk: number, total: number) => sftpStep(socket, basename(req.data.localPath), transferred, chunk, total),
            }, (err) => {
              if (err) sftpErr(socket, err);
            });
            break;

          // RENAME / MOVE
          case SFTPRequestType.RENAME:
            sftp.rename(req.data.srcPath, req.data.destPath, (err) => sftpErr(socket, err));
            break;

          // DELETE
          case SFTPRequestType.DELETE:
            sftp.unlink(req.data.file, (err) => sftpErr(socket, err));
            break;

          // RMDIR
          case SFTPRequestType.RMDIR:
            sftp.rmdir(req.data.path, (err) => sftpErr(socket, err));
            break;

          // MKDIR
          case SFTPRequestType.MKDIR:
            sftp.mkdir(req.data.path, (err) => sftpErr(socket, err));
            break;

        }
      });

    });

  })
    .on('error', (err) => socket.emit('sftp:data', {
      type: SFTPResponseType.ERROR,
      data: err.message
    }))
    .connect(sshConfig);

}

const sftpStep = (socket: Socket<ClientEvents, ServerEvents>, name: string, transferred: number, chunk: number, total: number) => {
  socket.emit('sftp:data', {
    type: SFTPResponseType.TRANSFER_UPDATE,
    data: {
      name, transferred, chunk, total,
    }
  } as SFTPResponse)
}

const sftpErr = (socket: Socket<ClientEvents, ServerEvents>, err: Error) => {
  socket.emit('sftp:data', {
    type: SFTPResponseType.ERROR,
    data: err.message,
  } as SFTPResponse)
}

const sftpReadDir = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, dir: string) => {
  sftp.readdir(dir, (err, list) => {
    if (err) {
      sftpErr(socket, err);
      return;
    }
    socket.emit('sftp:data', {
      type: SFTPResponseType.LIST,
      data: list,
    } as SFTPResponse);
  });
}