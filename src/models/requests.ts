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

export interface AuthHeaders {
  "Access-Token"?: string;
  "PC-Name"?: string;
}
