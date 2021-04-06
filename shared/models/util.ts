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
  email?: string;
}

/**
 * the first element is the master key and the second element is the actual key
 */
export type IPCEncryptReply = [string, string, string] | [string, string, string, string];

export interface IPCGetKeyRequest {
  caller: string;
  key: string;
}

/**
 * the first element is true if the request was successful
 * the second element is the value (if it does not exist, it is undefined)
 */
export type IPCGetKeyReply = [boolean, string]

export interface IPCSaveKeyRequest {
  caller: string;
  key: string;
  value: string;
}

/**
 * if the request was successful
 */
export type IPCSaveKeyReply = boolean;
