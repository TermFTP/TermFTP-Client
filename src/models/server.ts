export interface Group {
  name: string;
  server: Server[];
}

export interface Server {
  serverID: string;
  ip: string;
  ftpPort: number;
  sshPort: number;
  lastConnection: Date;
  username: string;
  password: string;
  name: string;
  when?: Date;
}

export interface HistoryServer extends Server {
  device: string;
  password: never;
}
