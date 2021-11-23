import { FileI } from "./file";

export type ProgressType = "upload" | "download";

export interface ProgressFileI {
	name: string;
	total?: number;
	progress: number;
	progressType: ProgressType;
	cwd: string;
}

export enum FTPResponseType {
	LIST = "list",
	ERROR = "error",
	TRANSFER_UPDATE = "transferupdate",
	PWD = "pwd",
	INIT = "init",
}

export enum FTPRequestType {
	PWD = "pwd",
	LIST = "list",
	GET_FILES = "get-files",
	PUT = "put",
	CD = "cd",
	RENAME = "rename",
	DELETEFILES = "delete",
	MKDIR = "mkdir",
	RMDIR = "rmdir",
	GET_FOLDERS = "get-folders",
	PUT_FOLDERS = "put-folders",
	PUT_FILES = "put-files",
	COPY_FOLDERS = "copy-folders",
	COPY_FILES = "copy-files"
}

export interface FromTo {
	from: string;
	to: string;
}

const Req = FTPRequestType;

export interface FTPReqPWD {
	type: typeof Req.PWD,
}

export interface FTPReqCD {
	type: typeof Req.CD;
	data: {
		dir: string;
	}
}

export interface FTPReqList {
	type: typeof Req.LIST;
	data: {
		dir: string;
	}
}

export interface FTPReqGetFiles {
	type: typeof Req.GET_FILES;
	data: {
		files: string[];
		localPath: string;
	}
}

export interface FTPReqPut {
	type: typeof Req.PUT;
	data: {
		localPath: string;
		remotePath: string;
	}
}

export interface FTPReqRename {
	type: typeof Req.RENAME;
	data: {
		srcPath: string;
		destPath: string;
	}
}

export interface FTPReqDeleteFiles {
	type: typeof Req.DELETEFILES;
	data: {
		files: string[];
	}
}

export interface FTPReqMkdir {
	type: typeof Req.MKDIR;
	data: {
		path: string;
	}
}

export interface FTPReqRmDIR {
	type: typeof Req.RMDIR;
	data: {
		path: string;
	}
}

export interface FTPReqGetFolder {
	type: typeof Req.GET_FOLDERS,
	data: {
		remoteFolders: FileI[];
		localPath: string;
	}
}

export interface FTPReqPutFolders {
	type: typeof Req.PUT_FOLDERS,
	data: {
		folders: string[];
		basePath?: string;
	}
}

export interface FTPReqPutFiles {
	type: typeof Req.PUT_FILES;
	data: {
		files: string[];
		basePath?: string;
	}
}

export interface FTPReqCopyFolders {
	type: typeof Req.COPY_FOLDERS,
	data: {
		folders: FromTo[]
	}
}

export interface FTPReqCopyFiles {
	type: typeof Req.COPY_FILES,
	data: {
		files: FromTo[]
	}
}

export interface FTPError {
	type: "error";
	data: string;
}

export type FTPRequest = FTPReqPWD
	| FTPReqCD
	| FTPReqList
	| FTPReqGetFiles
	| FTPReqPut
	| FTPReqRename
	| FTPReqDeleteFiles
	| FTPReqMkdir
	| FTPReqRmDIR
	| FTPError
	| FTPReqGetFolder
	| FTPReqPutFolders
	| FTPReqPutFiles
	| FTPReqCopyFiles
	| FTPReqCopyFolders;

export interface FTPResPWD {
	type: typeof FTPResponseType.PWD,
	data: string;
}

export interface FTPResTransfer {
	type: typeof FTPResponseType.TRANSFER_UPDATE,
	data: ProgressFileI;
}

export interface FTPResError {
	type: typeof FTPResponseType.ERROR,
	data: string;
}

export interface FTPResList {
	type: typeof FTPResponseType.LIST,
	data: {
		files: FileI[]
		pwd?: string;
	},
}

export interface FTPResInit {
	type: typeof FTPResponseType.INIT,
	data: string;
}

export type FTPResponse = FTPResTransfer | FTPResError | FTPResList | FTPResPWD | FTPResInit;

export enum FTPConnectTypes {
	FTP = "FTP",
	FTPS = "FTPS",
	SFTP = "SFTP",
}