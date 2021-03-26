import { BaseFTP } from "@lib";

export enum FTPActionTypes {
  SET_FTP_CLIENT = "ftp/set-ftp-client",
}

export interface FTPState {
  client: BaseFTP;
}
