import { Socket, connect } from 'socket.io-client';
import { ConnectConfig } from 'ssh2';
import { FileI, FileType } from "@models";
import { SFTPResponse, SFTPResponseType, SFTPRequestType } from '@shared';

export class SFTP {
  private socket?: typeof Socket;
  private cwd: string;

  //https://github.com/mscdex/ssh2/blob/master/SFTP.md

  constructor() {
    this.cwd = "";
  }

  connect(config: ConnectConfig, callback: (data: SFTPResponse) => void): void {
    const socket = connect('localhost:15000');
    this.socket = socket;

    socket.on('connect', () => {
      socket.emit('sftp', config);

      socket.on('data', (res: SFTPResponse) => {
        callback(res);
      });

    })
      .on('error', (err: any) => {
        callback({ type: SFTPResponseType.ERROR, data: err.message });
      });

  }

  cd(dir: string): void {
    if (dir == '..') {
      this.cwd = this.cwd.split('/').slice(0, -2).join('/');
    }
    else
      this.cwd += dir;

    this.cwd += "/";

    this.socket.emit('data', {
      type: SFTPRequestType.LIST,
      data: {
        dir: this.cwd,
      }
    })
  }

  list(dir?: string): void {
    this.socket.emit('data', {
      type: SFTPRequestType.LIST,
      data: {
        dir: dir || '',
      }
    })
  }

  get(remoteFile: string, localPath: string): void {
    this.socket.emit('data', {
      type: SFTPRequestType.GET,
      data: {
        remotePath: remoteFile,
        localPath,
      }
    })
  }

  put(source: string, destPath: string): void {
    this.socket.emit('data', {
      type: SFTPRequestType.PUT,
      data: {
        localPath: source,
        remotePath: destPath,
      }
    })
  }

  rename(oldPath: string, newPath: string): void {
    this.socket.emit('data', {
      type: SFTPRequestType.RENAME,
      data: {
        srcPath: oldPath,
        destPath: newPath,
      }
    })
  }

}



export default SFTP;