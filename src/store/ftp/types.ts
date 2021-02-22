import { FTP } from "@lib";
import { Group, HistoryServer, Server } from "@models";
import Client from "ftp";

export enum FTPActionTypes {
  SET_FTP_CLIENT = "ftp/set-ftp-client",
}

export interface FTPState {
  client: FTP;
}
