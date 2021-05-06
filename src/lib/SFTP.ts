import { Socket, connect } from 'socket.io-client';
import { ConnectConfig } from 'ssh2';
import { FTPResponse, FTPResponseType, FTPRequestType } from '@shared';

export class SFTP {
  private socket?: typeof Socket;
  private cwd: string;

  //https://github.com/mscdex/ssh2/blob/master/SFTP.md

  constructor() {
    this.cwd = "";
  }

  connect(config: ConnectConfig, callback: (data: FTPResponse) => void): void {
    const socket = connect('localhost:15000');
    this.socket = socket;

    socket.on('connect', () => {
      socket.emit('sftp', config);

      socket.on('sftp:data', (res: FTPResponse) => {
        callback(res);
      });

    })
      .on('error', (err: any) => {
        callback({ type: FTPResponseType.ERROR, data: err.message });
      });

  }

  cd(dir: string): void {
    if (dir == '..') {
      this.cwd = this.cwd.split('/').slice(0, -2).join('/');
    }
    else
      this.cwd += dir;

    this.cwd += "/";

    this.socket.emit('sftp:data', {
      type: FTPRequestType.LIST,
      data: {
        dir: this.cwd,
      }
    })
  }

  list(dir?: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.LIST,
      data: {
        dir: dir || '',
      }
    })
  }

  get(remoteFile: string, localPath: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.GET,
      data: {
        remotePath: remoteFile,
        localPath,
      }
    })
  }

  put(source: string, destPath: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.PUT,
      data: {
        localPath: source,
        remotePath: destPath,
      }
    })
  }

  rename(oldPath: string, newPath: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.RENAME,
      data: {
        srcPath: oldPath,
        destPath: newPath,
      }
    })
  }

  deleteFile(file: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.DELETE,
      data: {
        file,
      }
    });
  }

  mkdir(path: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.MKDIR,
      data: {
        path,
      }
    });
  }

  rmdir(path: string): void {
    this.socket.emit('sftp:data', {
      type: FTPRequestType.RMDIR,
      data: {
        path,
      }
    });
  }

}



export default SFTP;