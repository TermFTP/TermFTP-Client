import { BaseFTP } from "@lib";
import { FileI } from "@shared";

export enum FTPActionTypes {
  SET_FTP_CLIENT = "ftp/set-ftp-client",
  SET_FILES = "ftp/set-files",
}

export interface FTPState {
  client: BaseFTP;
  files: FileI[];
}
