import { basename } from "path";
import { Socket } from "socket.io";
import { Client, ConnectConfig, SFTPWrapper } from "ssh2";
import { ClientEvents, ServerEvents, FTPRequest, FTPRequestType, FTPResponse, FTPResponseType, FileI, FileType, ProgressType } from "../../src/shared";
import { FileEntry } from "ssh2-streams";
import fs from 'fs';
import { join } from 'path';

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

          // // DOWNLOAD FILE
          // case FTPRequestType.GET:
          //   download(socket, sftp, cwd, req.data.remotePath, req.data.localPath);
          //   break;

          // DOWNLOAD FILES
          case FTPRequestType.GET_FILES:
            for (const file of req.data.files) {
              download(socket, sftp, cwd, file, join(req.data.localPath, basename(file)))
            }
            break;

          case FTPRequestType.GET_FOLDERS:
            for (const folder of req.data.remoteFolders) {
              try {
                downloadFolders(socket, sftp, cwd, folder, join(req.data.localPath, folder.name), folder.name);
              } catch (err) {
                sftpErr(socket, { name: "Error uploading " + folder.name, message: err })
              }
            }
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
              upload(socket, sftp, file, cwd + (req.data.basePath ? req.data.basePath + "/" : ""));
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
            createDir(socket, sftp, cwd, req.data.path);
            break;

          // PUT FOLDERS
          case FTPRequestType.PUT_FOLDERS:

            for (const path of req.data.folders) {
              createDir(socket, sftp, cwd + (req.data.basePath ? req.data.basePath + "/" : ""), basename(path))
              uploadFolders(socket, sftp, cwd + (req.data.basePath ? req.data.basePath + "/" : ""), path, '', req.data.basePath)
            }

            break;

          case FTPRequestType.PWD:
            socket.emit("sftp:pwd", cwd);
            break;
        }
      });

    });

  })
    .on('error', (err) => sftpErr(socket, err))
    .connect(sshConfig);

}

const download = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, remotePath: string, localPath: string) => {
  sftp.fastGet([cwd, remotePath].join(''), localPath, {
    step: (transferred: number, chunk: number, total: number) => sftpStep(socket, [cwd, remotePath].join(''), basename(remotePath), transferred, chunk, total, "download"),
  }, (err) => {
    if (err) sftpErr(socket, err);
  });
}

const downloadFolders = async (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, folder: FileI, localPath: string, relativePath: string) => {
  const files = await readDir(sftp, [cwd, relativePath].join('/'));

  if (!fs.existsSync(localPath))
    fs.mkdirSync(localPath)

  for (const f of files) {
    if (f.type === FileType.DIR) {
      downloadFolders(socket, sftp, cwd, f, join(localPath, f.name), [relativePath, f.name].join('/'));
    } else {
      download(socket, sftp, cwd, [relativePath, f.name].join('/'), join(localPath, f.name));
    }
  }

}

const uploadFolders = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, dirPath: string, relativePath: string, basePath?: string) => {
  const files = fs.readdirSync(dirPath);

  for (const f of files) {
    if (fs.statSync(join(dirPath, f)).isDirectory()) {
      createDir(socket, sftp, cwd, [relativePath, f].join('/'));
      uploadFolders(socket, sftp, cwd, join(dirPath, f), [relativePath, f].join('/'));
    } else
      upload(socket, sftp, join(dirPath, f), [cwd, basePath ? basePath + "/" : "", relativePath].join(''))
  }

}

const createDir = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, path: string) => {
  console.log(cwd, path)
  sftp.mkdir([cwd, path].join('/'), (err) => {
    if (err) return sftpErr(socket, err);
    sftpReadDir(socket, sftp, cwd);
  });
}

const upload = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, localPath: string, cwd: string) => {
  sftp.fastPut(localPath, [cwd, basename(localPath)].join(''), {
    step: (transferred: number, chunk: number, total: number) => sftpStep(socket, cwd, basename(localPath), transferred, chunk, total, "upload"),
  }, (err) => {
    if (err) return sftpErr(socket, err);
    sftpReadDir(socket, sftp, cwd);
  });
}

const sftpStep = (socket: Socket<ClientEvents, ServerEvents>, cwd: string, name: string, transferred: number, chunk: number, total: number, type: ProgressType) => {
  socket.emit('sftp:data', {
    type: FTPResponseType.TRANSFER_UPDATE,
    data: {
      cwd, name, progress: transferred, total, progressType: type
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

const readDir = async (sftp: SFTPWrapper, dir: string): Promise<FileI[]> => {
  return new Promise((resolve, reject) => {
    sftp.readdir(dir, (err, list) => {
      if (err) {
        reject(err);
        return;
      }
      const oldList = list;
      const l: FileI[] = oldList.map(convertSftpFile).sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        if (a.type === FileType.DIR) return -1;
        return 1;
      })
      resolve(l);
    });
  })
}