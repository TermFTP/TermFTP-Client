import { Socket } from "socket.io";
import { ClientEvents, ServerEvents, FileI, FileType, FTPResponse, FTPResponseType, FTPRequestType, ProgressType } from "../../src/shared";
import { FileType as BasicType, Client, FileInfo } from "basic-ftp";
import { FTPConfig } from "../../src/lib/BaseFTP";
import PQueue from "p-queue";
import { Factory, createPool, Options, Pool } from "generic-pool";
import { basename } from "path";
import { mkdirSync } from "fs-extra";
import { join } from "path";
import { statSync } from "fs";

const Res = FTPResponseType;
const Req = FTPRequestType;

export const FTPHandler = (socket: Socket<ClientEvents, ServerEvents>) => async (config: FTPConfig): Promise<void> => {
  const ftp = new FTP(config, socket);
  try {
    await ftp.connect();
  } catch {
    socket.emit("ftp:data", {
      type: Res.ERROR,
      data: "could not connect"
    })
    socket.disconnect();
    return;
  }

  socket.emit("ftp:data", {
    type: Res.INIT,
    data: await ftp.pwd()
  })

  socket.on("disconnect", () => {
    ftp.disconnect();
  })

  socket.on("ftp:data", async (req) => {
    try {
      switch (req.type) {
        case Req.PWD:
          socket.emit('ftp:pwd', await ftp.pwd());
          break;
        case Req.CD:
          await ftp.cd(req.data.dir);
          socket.emit('ftp:cd')
          ftpReadDir(socket, ftp);
          break;
        case Req.DELETEFILES:
          await ftp.deleteFiles(req.data.files);
          ftpReadDir(socket, ftp);
          break;
        case Req.GET_FILES:
          ftp.getFiles(req.data.files, req.data.localPath);
          break;
        case Req.LIST:
          ftpReadDir(socket, ftp);
          break;
        case Req.MKDIR:
          await ftp.mkdir(req.data.path);
          ftpReadDir(socket, ftp);
          break;
        case Req.PUT:
          await ftp.put(req.data.localPath, req.data.remotePath);
          ftpReadDir(socket, ftp);
          break;
        case Req.RENAME:
          await ftp.rename(req.data.srcPath, req.data.destPath);
          ftpReadDir(socket, ftp);
          break;
        case Req.RMDIR:
          await ftp.rmdir(req.data.path);
          ftpReadDir(socket, ftp);
          break;
        case Req.GET_FOLDERS:
          ftp.getFolders(req.data.remoteFolders, req.data.localPath);
          break;
        case Req.PUT_FILES:
          await ftp.putFiles(req.data.files, req.data.basePath);
          ftpReadDir(socket, ftp)
          break;
        case Req.PUT_FOLDERS:
          await ftp.putFolders(req.data.folders, req.data.basePath);
          ftpReadDir(socket, ftp)
          break;
        default:
          return;
      }
    } catch (e) {
      // console.log(e)
      ftpErr(socket, e);
    }
  })
}

const ftpErr = (socket: Socket<ClientEvents, ServerEvents>, err: Error) => {
  socket.emit('ftp:data', {
    type: FTPResponseType.ERROR,
    data: err.message,
  } as FTPResponse);
}

const ftpReadDir = async (socket: Socket<ClientEvents, ServerEvents>, ftp: FTP, dir?: string) => {
  socket.emit('ftp:data', {
    type: FTPResponseType.LIST,
    data: {
      files: await ftp.list(dir),
      pwd: await ftp.pwd()
    }
  })
}

export class FTP {
  config: FTPConfig;
  private _cwd: string = undefined;
  private factory: Factory<Client> = {
    create: (() => Promise.resolve(new Client())).bind(this),
    validate: (c) => Promise.resolve(c.closed),
    destroy: (c) => Promise.resolve(c.close())
  }
  private poolOpts: Options = {
    max: 4,
    min: 0
  }
  private pool: Pool<Client> = createPool<Client>(this.factory, this.poolOpts);
  private client: Client = new Client();
  private queue: PQueue = new PQueue({
    concurrency: 1,
    throwOnTimeout: true
  });
  private socket: Socket<ClientEvents, ServerEvents>;

  constructor(config: FTPConfig, socket: Socket<ClientEvents, ServerEvents>) {
    this.config = config;
    this.socket = socket;
  }

  private convertFileType(type: BasicType): FileType {
    switch (type) {
      case BasicType.Unknown:
        return FileType.UNKNOWN;
      case BasicType.Directory:
        return FileType.DIR;
      case BasicType.SymbolicLink:
        return FileType.SYMBOLIC;
      case BasicType.File:
        return FileType.FILE;
      default:
        return FileType.UNKNOWN;
    }
  }

  async connect(): Promise<void> {
    await this.client.access(this.config);
    this._cwd = await this.client.pwd();
  }

  private async _reconnect(): Promise<void> {
    try {
      const pwd = this._cwd;
      await this.queue.add(() => this.client.access(this.config));
      await this.queue.add(() => this.client.cd(pwd));
    } catch (e) {
      return Promise.reject("not connected")
    }
  }

  async pwd(): Promise<string> {
    if (this.client.closed) {
      await this._reconnect();
    }

    this._cwd = await this.queue.add(() => this.client.pwd());
    if (!this._cwd.endsWith("/")) this._cwd += "/";
    return this._cwd;
  }

  private convertFiles(files: FileInfo[]): FileI[] {
    return files
      .map((v) => ({
        type: this.convertFileType(v.type),
        date: v.modifiedAt,
        name: v.name,
        size: v.size,
      } as FileI))
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        if (a.type === FileType.DIR) {
          return -1;
        }
        return 1;
      });
  }

  private addSpecificTracker(client: Client, cwd: string, progressType: ProgressType, total?: number): void {
    client.trackProgress((i) => {
      if (i.type === "list") return;
      this.socket.emit("ftp:data", {
        type: FTPResponseType.TRANSFER_UPDATE,
        data: {
          cwd,
          name: i.name,
          progress: i.bytes,
          progressType,
          total
        }
      })
    })
  }

  async list(dir?: string): Promise<FileI[]> {
    if (this.client.closed) {
      await this._reconnect();
    }

    return this.convertFiles(await this.queue.add(() => this.client.list(dir)));
  }

  disconnect(): void {
    try {
      !this.client.closed && this.client.close();
    } catch (e) {
      //
    }
  }

  async cd(dir: string): Promise<void> {
    if (this.client.closed) {
      await this._reconnect();
    }

    // try {
    await this.queue.add(() => this.client.cd(dir));
    // } catch (e) {
    // console.log(`error: ${JSON.stringify(e)}`)
    // }
    await this.pwd();
  }

  async get(
    remoteFile: string,
    localPath: string,
    startAt?: number
  ): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    const total = await c.size(remoteFile)
    this.addSpecificTracker(c, pwd, "download", total)
    await c.downloadTo(localPath, remoteFile, startAt);
    await this.pool.release(c);
  }

  async getFiles(
    files: string[],
    localPath: string
  ): Promise<void> {
    await Promise.all(files.map(f => this.get(f, join(localPath, f))))
  }

  async getFolders(folders: FileI[], localFolder: string): Promise<void> {
    // TODO implement preemptive file tree (fetch everything from the beginning)
    await Promise.all(folders.map(f => this._getFolder(f, localFolder)));
    // await c.downloadToDir(localFolder, remoteFolder); // this apparently does not work
  }

  private async _getFolder(file: FileI, path: string): Promise<void> {
    if (file.type === FileType.DIR) {
      const pwd = this._cwd;
      const c = await this.pool.acquire();
      await c.access(this.config);
      await c.cd(pwd);
      try {
        mkdirSync(join(path, file.name));
      } catch (e) {
        //oflder already exists, who cares..
      }
      const items = (await c.list(file.name))
        .map((v) => ({
          type: this.convertFileType(v.type),
          date: v.modifiedAt,
          name: v.name,
          size: v.size,
        } as FileI));
      await this.pool.release(c);

      await Promise.all(items.map(i => {
        i.name = [file.name, i.name].join("/");
        return this._getFolder(i, path);
      }))
    } else if (file.type === FileType.FILE) {
      await this.get(file.name, join(path, file.name));
    }
  }

  async put(source: string, destPath: string): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    const stats = statSync(source);
    this.addSpecificTracker(c, pwd, "upload", stats.size)
    await c.uploadFrom(source, destPath);
    await this.pool.release(c);
  }

  async mkdir(path: string): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.ensureDir(path);
    await this.pool.release(c);
  }

  async deleteFile(file: string): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.remove(file, true);
    await this.pool.release(c);
  }

  async deleteFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(f => this.deleteFile(f)))
  }

  async rmdir(path: string): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.removeDir(path);
    await this.pool.release(c);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.rename(oldPath, newPath);
    await this.pool.release(c);
  }

  async putFolder(source: string, destPath: string): Promise<void> {
    const pwd = this._cwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    this.addSpecificTracker(c, pwd, "upload", undefined);
    await c.uploadFromDir(source, destPath);
    await this.pool.release(c);
  }

  async putFiles(files: string[], basePath?: string): Promise<void> {
    await Promise.all(files.map(f => this.put(f, (basePath ? basePath + "/" : "") + basename(f))))
  }

  async putFolders(folders: string[], basePath?: string): Promise<void> {
    await Promise.all(
      folders.map((f) => this.putFolder(f, (basePath ? basePath + "/" : "") + basename(f)))
    );
  }

  get connected(): boolean { return !this.client.closed }
}
