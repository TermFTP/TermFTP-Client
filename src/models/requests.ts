export interface RegisterReq {
  username: string;
  email: string;
  password: string;
}

export interface LoginReq {
  username: string;
  password: string;
  pcName: string;
}

export interface HistoryReq {
  device: string;
  ip: string;
  deleted?: string;
  username?: string;
  sshPort?: number;
  ftpPort?: number;
}

export interface SaveReq {
  ip: string;
  name?: string;
  sshPort?: number;
  ftpPort?: number;
  username?: string;
  password?: string;
  lastConnection?: string;
}

export interface AuthHeaders {
  "Access-Token"?: string;
  // "PC-Name"?: string;
}
