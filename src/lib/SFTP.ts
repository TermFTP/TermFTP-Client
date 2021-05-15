import Client from 'socket.io-client';
import { ConnectConfig } from 'ssh2';
import { FTPResponse, FTPResponseType, FTPRequestType, FileI, FTPRequest } from '@shared';
import { BaseFTP, FTPConfig } from './BaseFTP';

const ReqT = FTPRequestType;

export class SFTP extends BaseFTP {
  private cwd: string;
  private _config: ConnectConfig;

  constructor(config: ConnectConfig) {
    super();
    this.cwd = "";
    this._config = config;
  }

  get config(): FTPConfig {
    return {
      ...this._config,
      sshPort: this._config.port,
      user: this._config.username,
      host: this._config.host,
      password: this._config.password,
      port: this._config.port,
    }
  }

  connect(callback: (data: FTPResponse) => void, config?: ConnectConfig): void {
    const socket = Client.connect('localhost:15000');
    this.socket = socket;
    this._config = config || this._config;

    socket.once('connect', () => {
      socket.emit('sftp', this._config);

      socket.on('sftp:data', (res: FTPResponse) => {
        if (res.type === FTPResponseType.LIST) {
          res.data.files = res.data.files.map(f => ({ ...f, date: new Date(f.date) }))
        }
        callback(res)
      });
    })
      .on('error', (err: any) => {
        callback({ type: FTPResponseType.ERROR, data: err.message });
      });
  }

  private emit(req: FTPRequest): void {
    this.socket?.emit('sftp:data', req);
  }

  disconnect(): void {
    this.socket?.close();
    this.cwd = undefined;
  }

  cd(dir: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket.once("sftp:cd", () => resolve())
      this.emit({
        type: ReqT.CD,
        data: {
          dir
        }
      })
    })
  }

  pwd(): Promise<string> {
    return Promise.resolve(this.cwd);
  }

  list(dir?: string): void {
    this.emit({
      type: FTPRequestType.LIST,
      data: {
        dir: dir || '',
      }
    })
  }

  get(remoteFile: string, localPath: string): void {
    this.emit({
      type: FTPRequestType.GET,
      data: {
        remotePath: remoteFile,
        localPath,
      }
    })
  }

  getFiles(files: string[], localPath: string): void {
    this.emit({
      type: FTPRequestType.GET_FILES,
      data: {
        files,
        localPath
      }
    })
  }

  /*
  put(source: string, destPath: string): void {
    this.emit({
      type: FTPRequestType.PUT,
      data: {
        localPath: source,
        remotePath: destPath,
      }
    })
  }*/

  rename(oldPath: string, newPath: string): void {
    this.emit({
      type: FTPRequestType.RENAME,
      data: {
        srcPath: oldPath,
        destPath: newPath,
      }
    })
  }

  deleteFile(file: string): void {
    this.emit({
      type: FTPRequestType.DELETE,
      data: {
        file,
      }
    });
  }

  mkdir(path: string): void {
    this.emit({
      type: FTPRequestType.MKDIR,
      data: {
        path,
      }
    });
  }

  rmdir(path: string): void {
    this.emit({
      type: FTPRequestType.RMDIR,
      data: {
        path,
      }
    });
  }

  getFolder(remoteFolder: FileI, localFolder: string): void {
    this.emit({
      type: ReqT.GET_FOLDER,
      data: {
        localPath: localFolder,
        remoteFolder
      }
    });
  }

  /*
  putFolder(source: string, destPath: string): void {
    this.emit({
      type: ReqT.PUT_FOLDER,
      data: {
        localPath: source,
        remotePath: destPath
      }
    })
  }
  */

  putFolders(folders: string[]): void {
    this.emit({
      type: ReqT.PUT_FOLDERS,
      data: {
        folders
      }
    })
  }

  putFiles(files: string[]): void {
    this.emit({
      type: ReqT.PUT_FILES,
      data: {
        files
      }
    })
  }

  get connected(): boolean {
    return this.socket?.connected;
  }
}



export default SFTP;