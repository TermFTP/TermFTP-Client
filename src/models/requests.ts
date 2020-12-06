export interface RegisterReq {
  username: string;
  email: string;
  password: string;
}

export interface LoginReq {
  username: string;
  password: string;
  pc_name: string;
}

export interface AuthHeaders {
  "User-ID"?: string;
  "Session-Token"?: string;
}
