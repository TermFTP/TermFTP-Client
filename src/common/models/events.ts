import { FTPConfig } from "@common/lib";
import { ProgressInfo } from "basic-ftp/dist/ProgressTracker";
import { Server } from "socket.io";
import { ConnectConfig } from "ssh2";
import { FTPRequest, FTPResponse } from "./ftp";
import { ResizeData } from "./ssh";

export interface ServerEvents {
	"ftp:data": (res: FTPResponse) => void;
	"ftp:track": (info: ProgressInfo) => void;
	"ftp:pwd": (data: string) => void;
	"ftp:cd": () => void;

	"ssh:init": () => void;
	"ssh:data": (data: string) => void;
	"ssh:disconnect": () => void;
	"sftp:data": (res: FTPResponse) => void;
	"sftp:pwd": (pwd: string) => void;
}

export interface ClientEvents {
	"ftp": (config: FTPConfig) => void;
	"ftp:data": (req: FTPRequest) => void;

	"ssh": (config: ConnectConfig) => void;
	"ssh:data": (data: string) => void;
	"ssh:resize": (data: ResizeData) => void;
	"ssh:disconnect": () => void;

	"sftp": (config: ConnectConfig) => void;
	"sftp:data": (req: FTPRequest) => void;
}

export type ServerType = Server<ClientEvents, ServerEvents>