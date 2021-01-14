export interface Group {
  name: string;
  server: Server;
}

export interface Server {
  ip: string;
  ftpPort: number;
  sshPort: number;
  lastConnection: Date;
}

export interface HistoryServer extends Server {
  when: Date;
  device: string;
}
