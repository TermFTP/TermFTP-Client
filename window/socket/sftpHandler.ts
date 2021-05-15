import { basename } from "path";
import { Socket } from "socket.io";
import { Client, ConnectConfig, SFTPWrapper } from "ssh2";
import { ClientEvents, ServerEvents, FTPRequest, FTPRequestType, FTPResponse, FTPResponseType, FileI, FileType } from "../../src/shared";
import { FileEntry } from "ssh2-streams";
import { ProgressType } from "basic-ftp/dist/ProgressTracker";

export const SFTPHandler = (socket: Socket<ClientEvents, ServerEvents>) => (sshConfig: ConnectConfig): void => {
  const ssh = new Client();

  //https://github.com/mscdex/ssh2/blob/master/SFTP.md
  ssh.on('ready', () => {

    let cwd = "";

    ssh.exec('pwd', (err, stream) => {
      stream.on('data', (data: Buffer) => {
        cwd = data.toString().trim() + '/';
      });
    });

    ssh.sftp((err, sftp) => {
      if (err) socket.emit('sftp:data', { type: FTPResponseType.ERROR, data: err.message });

      //default listdir after connection established
      // sftpReadDir(socket, sftp, cwd);
      socket.emit("sftp:data", { type: FTPResponseType.INIT, data: cwd })

      socket.on('sftp:data', (req: FTPRequest) => {
        switch (req.type) {
          // LIST DIRECTORY
          case FTPRequestType.LIST:
            sftpReadDir(socket, sftp, [cwd, req.data.dir].join('/'));
            break;

          // CHANGE DIRECOTRY
          case FTPRequestType.CD:
            if (req.data.dir == '..') {
              cwd = cwd.split('/').slice(0, -2).join('/');
            }
            else if (req.data.dir.startsWith("/")) {
              cwd = req.data.dir
            }
            else
              cwd += req.data.dir;

            if (cwd.endsWith("/")) {
              cwd = cwd.substring(0, cwd.length - 1);
            }

            cwd += "/";
            sftpReadDir(socket, sftp, cwd);
            break;

          // DOWNLOAD FILE
          case FTPRequestType.GET:
            sftp.fastGet([cwd, req.data.remotePath].join('/'), req.data.localPath, {
              step: (transferred: number, chunk: number, total: number) => sftpStep(socket, basename(req.data.remotePath), transferred, chunk, total, "download"),
            }, (err) => {
              if (err) sftpErr(socket, err);
            });
            break;

          // UPLOAD FILE
          /*
          case FTPRequestType.PUT:
            console.log([cwd, basename(req.data.localPath)].join(''));
            upload(socket, sftp, req.data.localPath, req.data.remotePath, cwd);
            break;
          */

          // UPLOAD FILES
          case FTPRequestType.PUT_FILES:
            for (const file of req.data.files) {
              upload(socket, sftp, file, cwd);
            }
            break;

          // RENAME / MOVE
          case FTPRequestType.RENAME:
            sftp.rename([cwd, req.data.srcPath].join('/'), [cwd, req.data.destPath].join('/'), (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, cwd);
            });
            break;

          // DELETE
          case FTPRequestType.DELETE:
            sftp.unlink([cwd, req.data.file].join('/'), (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, cwd);
            });
            break;

          // RMDIR
          case FTPRequestType.RMDIR:
            sftp.rmdir([cwd, req.data.path].join('/'), (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, cwd);
            });
            break;

          // MKDIR
          case FTPRequestType.MKDIR:
            sftp.mkdir([cwd, req.data.path].join('/'), (err) => {
              if (err) return sftpErr(socket, err);
              sftpReadDir(socket, sftp, cwd);
            });
            break;



        }
      });

    });

  })
    .on('error', (err) => sftpErr(socket, err))
    .connect(sshConfig);

}

const upload = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, localPath: string, cwd: string) => {
  sftp.fastPut(localPath, [cwd, basename(localPath)].join(''), {
    step: (transferred: number, chunk: number, total: number) => sftpStep(socket, basename(localPath), transferred, chunk, total, "upload"),
  }, (err) => {
    if (err) return sftpErr(socket, err);
    sftpReadDir(socket, sftp, cwd);
  });
}

const sftpStep = (socket: Socket<ClientEvents, ServerEvents>, name: string, transferred: number, chunk: number, total: number, type: ProgressType) => {
  socket.emit('sftp:data', {
    type: FTPResponseType.TRANSFER_UPDATE,
    data: {
      name, transferred, chunk, total, type
    }
  } as FTPResponse)
}

const sftpErr = (socket: Socket<ClientEvents, ServerEvents>, err: Error) => {
  socket.emit('sftp:data', {
    type: FTPResponseType.ERROR,
    data: err.message,
  } as FTPResponse)
}

function convertSftpFile(file: FileEntry): FileI {
  const type = file.longname.substr(0, 1);
  let t = FileType.UNKNOWN;
  if (type === "-") t = FileType.FILE;
  else if (type === "d") t = FileType.DIR;
  else if (type === "l") t = FileType.SYMBOLIC;
  return {
    date: new Date(file.attrs.mtime),
    name: file.filename,
    size: file.attrs.size,
    type: t
  }
}

const sftpReadDir = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, dir: string) => {
  sftp.readdir(dir, (err, list) => {
    if (err) {
      sftpErr(socket, err);
      return;
    }
    const oldList = list;
    const l: FileI[] = oldList.map(convertSftpFile).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      if (a.type === FileType.DIR) return -1;
      return 1;
    })
    socket.emit('sftp:data', {
      type: FTPResponseType.LIST,
      data: {
        files: l,
        pwd: dir
      },
    } as FTPResponse);
  });
}