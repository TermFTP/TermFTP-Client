import Client from "ftp";
import { EventEmitter } from "events";

export interface FTPConfig extends Client.Options {
  sshPort: number;
}

export interface FTPEventDetails {
  change: "all" | "directory" | "files";
}

HTMLDivElement;

export type FTPEvent = CustomEvent<FTPEventDetails>;

export class FTP extends EventEmitter {
  config: FTPConfig;
  client: Client;
  connected = false;

  constructor(config: FTPConfig) {
    super();
    this.config = config;
  }

  connect(): Promise<any> {
    this.client = new Client();
    const c = this.client;
    return new Promise((resolve) => {
      c.on(
        "ready",
        (() => {
          this.connected = true;
          resolve("connected");
        }).bind(this)
      );

      c.on(
        "error",
        ((e: any) => {
          this.connected = false;
          this.client = undefined;
          console.log("error", e);
          console.groupEnd();
        }).bind(this)
      );

      console.groupCollapsed(`FTP Connection: ${this.config.host}`);
      console.log("Config", this.config);
      c.connect(this.config);
    });
  }

  pwd(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject("no client");
      }
      this.client.pwd((err, path) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(path);
      });
    });
  }

  list(dir: string): Promise<Client.ListingElement[]> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject("no client");
      }
      if (dir) {
        this.client.list(dir, (err, list) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(list);
        });
      } else {
        this.client.list((err, list) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(list);
        });
      }
    });
  }

  disconnect(): void {
    if (!this.client) {
      console.error("no client");
    }
    if (this.connected) {
      this.client.end();
      this.connected = false;
      this.client = undefined;
      console.groupEnd();
    }
  }

  cd(dir: string): Promise<string> {
    if (!this.client) {
      console.error("no client");
    }
    if (this.connected) {
      return new Promise((resolve, reject) => {
        this.client.cwd(dir, (err, current) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(current);
          this.emit("ftp-event", { details: "all" });
        });
      });
    }
  }

  get(file: string): Promise<NodeJS.ReadableStream> {
    if (!this.client) {
      console.error("no client");
    }
    if (this.connected) {
      return new Promise((resolve, reject) => {
        this.client.get(file, (err, fileStream) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(fileStream);
        });
      });
    }
  }

  put(input: NodeJS.ReadableStream | Buffer, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.put(input, destPath, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
        this.emit("ftp-event", { details: "all" });
      });
    });
  }

  createFolder(path: string, recursive: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.mkdir(path, recursive, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
        this.emit("ftp-event", { details: "all" });
      });
    });
  }

  delete(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.delete(path, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
        this.emit("ftp-event", { details: "all" });
      });
    });
  }

  rmdir(path: string, recursive = true): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.rmdir(path, recursive, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
        this.emit("ftp-event", { details: "all" });
      });
    });
  }
}

export function convertFileSize(size: number, decimals = 1): string {
  if (size === 0) return "";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

export default FTP;
