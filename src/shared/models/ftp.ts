import { FileI } from "./file";
import { FileEntry } from "ssh2-streams"

export enum FTPResponseType {
  LIST = "list",
  ERROR = "error",
  TRANSFER_UPDATE = "transferupdate",
}

export enum FTPRequestType {
  LIST = "list",
  GET = "get",
  PUT = "put",
  CD = "cd",
  RENAME = "rename",
  DELETE = "delete",
  MKDIR = "mkdir",
  RMDIR = "rmdir",
  GET_FOLDER = "get-folder",
  PUT_FOLDER = "put-folder",
  PUT_FOLDERS = "put-folders",
  PUT_FILES = "put-files"
}

const Req = FTPRequestType;

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

export interface FTPReqGet {
  type: typeof Req.GET;
  data: {
    remotePath: string;
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

export interface FTPReqDelete {
  type: typeof Req.DELETE;
  data: {
    file: string;
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
  type: typeof Req.GET_FOLDER,
  data: {
    remotePath: FileI;
    localPath: string;
  }
}

export interface FTPReqPutFolder {
  type: typeof Req.PUT_FOLDER,
  data: {
    localPath: string;
    remotePath: string;
  }
}

export interface FTPReqPutFolders {
  type: typeof Req.PUT_FOLDERS,
  data: {
    folders: string[];
  }
}

export interface FTPReqPutFiles {
  type: typeof Req.PUT_FILES;
  data: {
    files: string[];
  }
}

export interface FTPError {
  type: "error";
  data: string;
}

export type FTPRequest = FTPReqCD
  | FTPReqList
  | FTPReqGet
  | FTPReqPut
  | FTPReqRename
  | FTPReqDelete
  | FTPReqMkdir
  | FTPReqRmDIR
  | FTPError
  | FTPReqGetFolder
  | FTPReqPutFolder
  | FTPReqPutFolders
  | FTPReqPutFiles;

export interface FTPResTransfer {
  type: typeof FTPResponseType.TRANSFER_UPDATE,
  data: {
    name: string;
    transferred: number;
    chunk: number;
    total: number;
  }
}

export interface FTPResError {
  type: typeof FTPResponseType.ERROR,
  data: string;
}

export interface FTPResList {
  type: typeof FTPResponseType.LIST,
  data: {
    files: FileI[] | FileEntry[]
    pwd?: string;
  },
}

export type FTPResponse = FTPResTransfer | FTPResError | FTPResList;