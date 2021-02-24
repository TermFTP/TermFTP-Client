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
  username: string;
}

/**
 * the first element is the master key and the second element is the actual key
 */
export type IPCEncryptReply = [string, string];
