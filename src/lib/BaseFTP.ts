import { FileI } from "@models";
import { EventEmitter } from "events";
import { AccessOptions } from "basic-ftp";

export interface FTPConfig extends AccessOptions {
  sshPort: number;
}

export abstract class BaseFTP extends EventEmitter {
  config: FTPConfig;
  // private  s: Error = new Error("implement a superclass");
  // connected = false;
  constructor() {
    super();
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): void;

  abstract pwd(): Promise<string>;
  abstract list(dir?: string): Promise<FileI[]>;
  abstract cd(dir: string): Promise<void>;
  abstract get(
    remoteFile: string,
    localPath: string,
    startAt?: number
  ): Promise<void>;
  abstract getFolder(remoteFolder: FileI, localFolder: string): Promise<void>;
  abstract put(source: string, destPath: string, noEmit?: boolean): Promise<void>;
  abstract mkdir(path: string, recursive?: boolean): Promise<void>;
  abstract deleteFile(file: string): Promise<void>;
  abstract rmdir(dir: string, recursive?: boolean): Promise<void>;
  abstract rename(oldPath: string, newPath: string): Promise<void>;
  abstract putFolder(source: string, destPath: string, noEmit?: boolean): Promise<void>;
  abstract putFolders(folders: string[]): Promise<void>;
  abstract putFiles(files: string[]): Promise<void>;

  abstract get connected(): boolean;

  abstract forceUpdate(): void;
}

export function convertFileSize(size: number, decimals = 1): string {
  if (size === 0) return "";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}
