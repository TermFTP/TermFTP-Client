import Client from "ftp";

export interface FTPConfig extends Client.Options {
  sshPort: number;
}

export class FTP {
  config: FTPConfig;
  client: Client;
  connected = false;

  constructor(config: FTPConfig) {
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
      throw new Error("no client");
    }
    if (this.connected) {
      this.client.end();
      this.connected = false;
      this.client = undefined;
      console.groupEnd();
    }
  }
}

export function convertFileSize(size: number, decimals = 1): string {
  if (size === 0) return "0B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

export default FTP;
