import { basename } from "path";
import { Socket } from "socket.io";
import { Client, ConnectConfig, SFTPWrapper } from "ssh2";
import { ClientEvents, ServerEvents, FTPRequest, FTPRequestType, FTPResponse, FTPResponseType } from "../../src/shared";

export const SFTPHandler = (socket: Socket<ClientEvents, ServerEvents>) => (sshConfig: ConnectConfig): void => {
  const ssh = new Client();

  ssh.on('ready', () => {

    ssh.sftp((err, sftp) => {
      if (err) socket.emit('sftp:data', { type: FTPResponseType.ERROR, data: err.message });

      //default listdir after connection established
      sftpReadDir(socket, sftp, '');

      socket.on('sftp:data', (req: FTPRequest) => {
        switch (req.type) {
          // LIST DIRECTORY
          case FTPRequestType.LIST:
            sftpReadDir(socket, sftp, req.data.dir);
            break;

          // DOWNLOAD FILE
          case FTPRequestType.GET:
            sftp.fastGet(req.data.remotePath, req.data.localPath, {
              step: (transferred: number, chunk: number, total: number) => sftpStep(socket, basename(req.data.remotePath), transferred, chunk, total),
            }, (err) => {
              if (err) sftpErr(socket, err);
            });
            break;

          // UPLOAD FILE
          case FTPRequestType.PUT:
            sftp.fastPut(req.data.localPath, req.data.remotePath, {
              step: (transferred: number, chunk: number, total: number) => sftpStep(socket, basename(req.data.localPath), transferred, chunk, total),
            }, (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, '');
            });
            break;

          // RENAME / MOVE
          case FTPRequestType.RENAME:
            sftp.rename(req.data.srcPath, req.data.destPath, (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, '');
            });
            break;

          // DELETE
          case FTPRequestType.DELETE:
            sftp.unlink(req.data.file, (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, '');
            });
            break;

          // RMDIR
          case FTPRequestType.RMDIR:
            sftp.rmdir(req.data.path, (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, '');
            });
            break;

          // MKDIR
          case FTPRequestType.MKDIR:
            sftp.mkdir(req.data.path, (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, '');
            });
            break;

        }
      });

    });

  })
    .on('error', (err) => sftpErr(socket, err))
    .connect(sshConfig);

}

const sftpStep = (socket: Socket<ClientEvents, ServerEvents>, name: string, transferred: number, chunk: number, total: number) => {
  socket.emit('sftp:data', {
    type: FTPResponseType.TRANSFER_UPDATE,
    data: {
      name, transferred, chunk, total,
    }
  } as FTPResponse)
}

const sftpErr = (socket: Socket<ClientEvents, ServerEvents>, err: Error) => {
  socket.emit('sftp:data', {
    type: FTPResponseType.ERROR,
    data: err.message,
  } as FTPResponse)
}

const sftpReadDir = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, dir: string) => {
  sftp.readdir(dir, (err, list) => {
    if (err) {
      sftpErr(socket, err);
      return;
    }
    socket.emit('sftp:data', {
      type: FTPResponseType.LIST,
      data: {
        files: list
      },
    } as FTPResponse);
  });
}