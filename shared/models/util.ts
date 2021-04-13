export interface IRawParams {
  [key: string]: any;
}

export enum EncryptionType {
  MASTER = 1, // the encryption type for the master password (additionally)
  KEY = 100_000, // the encryption type for the encryption key for the server passwords
}

export interface IPCLoginReq {
  caller: "login";
  username: string;
  password: string;
  autoLogin: boolean;
}

export interface IPCRegisterReq {
  caller: "register";
  username: string;
  password: string;
  email: string;
}

export type IPCEncryptRequest = IPCLoginReq | IPCRegisterReq;

/**
 * the first element is the master key and the second element is the actual key
 */
export type IPCEncryptReply = [string, string, string, boolean] | [string, string, string, string];

export type IPCGetKeys = "auto-login" | "username:masterpw";

export interface IPCGetKeyRequest {
  caller: string;
  key: IPCGetKeys;
}

/**
 * the first element is true if the request was successful
 * the second element is the value (if it does not exist, it is undefined)
 */
export type IPCGetKeyReply = { result: boolean, val: string, err?: Error }

export interface IPCSaveKeyRequest {
  caller: string;
  key: string;
  value: string;
}

/**
 * if the request was successful
 */
export type IPCSaveKeyReply = { result: boolean, err?: Error };
