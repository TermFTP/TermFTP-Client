import { FileI, FileType } from "@models/file";
import { AccessOptions, Client, FileType as BasicType } from "basic-ftp";
import { BaseFTP } from "./BaseFTP";

export interface FTPConfig extends AccessOptions {
  password: string;
  sshPort: number;
}

export interface FTPEventDetails {
  change: "all" | "directory" | "files";
}

export class FTP extends BaseFTP {
  config: FTPConfig;
  client: Client;

  convertFileType(type: BasicType): FileType {
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

  constructor(config: FTPConfig) {
    super();
    this.config = config;
    this.client = new Client();
  }

  async connect(): Promise<void> {
    await this.client.access(this.config);
  }

  async pwd(): Promise<string> {
    return await this.client.pwd();
  }

  async list(dir?: string): Promise<FileI[]> {
    const list = await this.client.list(dir);
    return list.map(
      (v) =>
        ({
          type: this.convertFileType(v.type),
          date: v.modifiedAt,
          name: v.name,
          size: v.size,
        } as FileI)
    );
  }

  disconnect(): void {
    this.client.close();
  }

  async cd(dir: string): Promise<void> {
    if (!this.connected) return Promise.reject("Client is not connected");
    await this.client.cd(dir);
    this.emit("ftp-event", { details: "all" });
    return Promise.resolve();
  }

  async get(
    remoteFile: string,
    localPath: string,
    startAt?: number
  ): Promise<void> {
    if (!this.connected) return Promise.reject("Client is not connected");
    await this.client.downloadTo(localPath, remoteFile, startAt);
    return Promise.resolve();
  }

  async put(source: string, destPath: string, emit = true): Promise<void> {
    if (!this.connected) return Promise.reject("Client is not connected");
    await this.client.uploadFrom(source, destPath);
    emit && this.emit("ftp-event", { details: "all" });
    return Promise.resolve();
  }

  async mkdir(path: string): Promise<void> {
    await this.client.ensureDir(path);
    this.emit("ftp-event", { details: "all" });
    return Promise.resolve();
  }

  async deleteFile(path: string): Promise<void> {
    await this.client.remove(path);
    this.emit("ftp-event", { details: "all" });
    return Promise.resolve();
  }

  async rmdir(path: string, recursive = true): Promise<void> {
    if (recursive) await this.client.removeDir(path);
    else await this.client.removeEmptyDir(path);

    this.emit("ftp-event", { details: "all" });
    return Promise.resolve();
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await this.client.rename(oldPath, newPath);

    this.emit("ftp-event", { details: "all" });
    return Promise.resolve();
  }

  get connected(): boolean {
    return !this.client.closed;
  }
}

export default FTP;
