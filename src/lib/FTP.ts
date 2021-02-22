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
    console.log("before");
    return new Promise((resolve, reject) => {
      console.log("inner");
      c.on(
        "ready",
        (() => {
          this.connected = true;
          console.log("hhuh", this);
          resolve("connected");
          c.list(function (err, list) {
            if (err) {
              reject(err);
              console.groupEnd();
              return;
            }
            console.log("list", list);
            // c.end();
            console.groupEnd();
          });
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

  disconnect(): void {
    if (!this.client) {
      throw new Error("no client");
    }
    this.client.end();
    this.connected = false;
    this.client = undefined;
  }
}

export default FTP;
