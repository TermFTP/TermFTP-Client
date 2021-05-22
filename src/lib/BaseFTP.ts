import { FileI, FTPResponse } from "../shared/models";
import { AccessOptions } from "basic-ftp";
import { Socket } from "socket.io-client";

export interface FTPConfig extends AccessOptions {
  sshPort: number;
}

export abstract class BaseFTP {
  protected socket?: typeof Socket;
  // private  s: Error = new Error("implement a superclass");
  // connected = false;

  abstract connect(callback: (res: FTPResponse) => void): void;
  abstract disconnect(): void;

  abstract pwd(): Promise<string>;
  abstract list(dir?: string): void;
  abstract cd(dir: string): void;
  // abstract get(
  //   remoteFile: string,
  //   localPath: string,
  //   startAt?: number
  // ): void;
  abstract getFiles(
    files: string[],
    localPath: string
  ): void;
  abstract getFolders(remoteFolders: FileI[], localFolder: string): void;
  // abstract put(source: string, destPath: string): void;
  abstract mkdir(path: string): void;
  abstract deleteFile(file: string): void;
  abstract rmdir(dir: string, recursive?: boolean): void;
  abstract rename(oldPath: string, newPath: string): void;
  abstract putFolders(folders: string[], basePath?: string): void;
  abstract putFiles(files: string[], basePath?: string): void;

  abstract get connected(): boolean;
  abstract get config(): FTPConfig;
}

export function convertFileSize(size: number, decimals = 1): string {
  if (size === 0) return "";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}
