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
}

export interface HistoryServer extends Server {
  when: Date;
  device: string;
  password: never;
}
