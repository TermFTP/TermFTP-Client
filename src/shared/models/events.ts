import { Server } from "socket.io";
import { ConnectConfig } from "ssh2";
import { SFTPRequest, SFTPResponse } from "./sftp";
import { ResizeData } from "./ssh";

interface Error {
  error: string;
}

interface Success<T> {
  data: T;
}

export type Response<T> = Error | Success<T>;

export interface ServerEvents {
  "ssh:init": () => void;
  "ssh:data": (data: string) => void;
  "ssh:disconnect": () => void;
  "sftp:data": (res: SFTPResponse) => void;
}

export interface ClientEvents {
  "ssh": (config: ConnectConfig) => void;
  "ssh:data": (data: string) => void;
  "ssh:resize": (data: ResizeData) => void;
  "ssh:disconnect": () => void;

  "sftp": (config: ConnectConfig) => void;
  "sftp:data": (req: SFTPRequest) => void;
}

export type ServerType = Server<ClientEvents, ServerEvents>