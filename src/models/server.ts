import { FTPConnectTypes } from "@shared";

export interface Group {
  groupID: string;
  name: string;
  server: Server[];
  serverGroups: Group[];
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
  ftpType: FTPConnectTypes
}

export interface HistoryServer extends Server {
  device: string;
  password: never;
}
