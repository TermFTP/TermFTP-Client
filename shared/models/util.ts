export interface IRawParams {
  [key: string]: any;
}

export enum EncryptionType {
  MASTER = 1, // the encryption type for the master password (additionally)
  KEY = 100_000, // the encryption type for the encryption key for the server passwords
}

export interface IPCEncryptRequest {
  caller: string;
  password: string;
}

export interface IPCEncryptReply {
  master: string;
  key: string;
}
