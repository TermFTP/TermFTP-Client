// import Client from "ftp";
import { FileI, FileType } from "@models";
import { FileType as BasicType, Client } from "basic-ftp";
import { BaseFTP, FTPConfig } from "./BaseFTP";
import { Factory, createPool, Options, Pool } from "generic-pool";
import { basename } from "path";
import { mkdirSync } from "fs-extra";
import { join } from "path";

export interface FTPEventDetails {
  change: "all" | "directory" | "files";
}

export type FTPEvent = CustomEvent<FTPEventDetails>;

export class FTP extends BaseFTP {
  private _pwd: string = undefined;
  private factory: Factory<Client> = {
    create: () => Promise.resolve(new Client()),
    validate: (c) => Promise.resolve(c.closed),
    destroy: (c) => Promise.resolve(c.close())
  }
  private poolOpts: Options = {
    max: 4,
    min: 0
  }
  private pool: Pool<Client>;
  private client: Client;

  constructor(config: FTPConfig) {
    super();
    this.config = config;
    this.pool = createPool<Client>(this.factory, this.poolOpts);
    this.client = new Client();
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
    this._pwd = await this.client.pwd();
  }

  async pwd(): Promise<string> {
    if (this.client.closed) {
      try {
        const pwd = this._pwd;
        await this.client.access(this.config);
        await this.client.cd(pwd);
      } catch (e) {
        return Promise.reject("not connected")
      }
    }

    this._pwd = await this.client.pwd();
    return this._pwd;
  }

  async list(dir?: string): Promise<FileI[]> {
    if (this.client.closed) {
      try {
        const pwd = this._pwd;
        await this.client.access(this.config);
        await this.client.cd(pwd);
      } catch (e) {
        return Promise.reject("not connected")
      }
    }

    const list = (await this.client.list(dir))
      .map((v) => ({
        type: this.convertFileType(v.type),
        date: v.modifiedAt,
        name: v.name,
        size: v.size,
      } as FileI));
    return list.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      if (a.type === FileType.DIR) {
        return -1;
      }
      return 1;
    });
  }

  disconnect(): void {
    try {
      !this.client.closed && this.client.close();
    } catch (e) {
      //
    }
  }

  async cd(dir: string, noEmit = false): Promise<void> {
    if (this.client.closed) {
      try {
        const pwd = this._pwd;
        await this.client.access(this.config);
        await this.client.cd(pwd);
      } catch (e) {
        return Promise.reject("not connected")
      }
    }

    await this.client.cd(dir);
    await this.pwd();
    !noEmit && this.emit("ftp-event", { details: "all" });
  }

  async get(
    remoteFile: string,
    localPath: string,
    startAt?: number
  ): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.downloadTo(localPath, remoteFile, startAt);
    this.pool.release(c);
  }

  async getFolder(remoteFolder: FileI, localFolder: string): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await this._getFolder(c, remoteFolder, localFolder);
    // await c.downloadToDir(localFolder, remoteFolder); // this apparently does not work
    this.pool.release(c);
  }

  private async _getFolder(c: Client, file: FileI, path: string): Promise<void> {
    if (file.type === FileType.DIR) {
      try {
        mkdirSync(join(path, file.name));
      } catch (e) {
        //folder already exists, who cares..
      }
      const items = (await c.list(file.name))
        .map((v) => ({
          type: this.convertFileType(v.type),
          date: v.modifiedAt,
          name: v.name,
          size: v.size,
        } as FileI));

      await Promise.all(items.map(i => {
        i.name = join(file.name, i.name);
        return this._getFolder(c, i, path);
      }))
    } else if (file.type === FileType.FILE) {
      await this.get(file.name, join(path, file.name));
    }
  }

  async put(source: string, destPath: string, noEmit = false): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.uploadFrom(source, destPath);
    !noEmit && this.emit("ftp-event", { details: "all" });
    this.pool.release(c);
  }

  async mkdir(path: string): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.ensureDir(path);
    this.emit("ftp-event", { details: "all" });
    this.pool.release(c);
  }

  async deleteFile(file: string): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.remove(file, true);
    this.emit("ftp-event", { details: "all" })
    this.pool.release(c);
  }

  async rmdir(path: string): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.removeDir(path);
    this.emit("ftp-event", { details: "all" });
    this.pool.release(c);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.rename(oldPath, newPath);
    this.emit("ftp-event", { details: "all" });
    this.pool.release(c);
  }

  async putFolder(source: string, destPath: string, noEmit = false): Promise<void> {
    const pwd = this._pwd;
    const c = await this.pool.acquire();
    await c.access(this.config);
    await c.cd(pwd);
    await c.uploadFromDir(source, destPath);
    !noEmit && this.emit("ftp-event", { details: "all" });
    this.pool.release(c);
  }

  async putFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(f => this.put(f, basename(f), true)))
    this.emit("ftp-event", { details: "all" });
  }

  async putFolders(folders: string[]): Promise<void> {
    await Promise.all(
      folders.map((f) => this.putFolder(f, basename(f), true))
    );
    this.emit("ftp-event", { details: "all" })
  }

  get connected(): boolean { return !this.client.closed }

  forceUpdate(): void {
    this.emit("ftp-event", { details: "all" })
  }
}

export default FTP;
