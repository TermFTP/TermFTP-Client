export enum SFTPResponseType {
  LIST = "list",
  ERROR = "error",
  TRANSFER_UPDATE = "transferupdate",
}

export enum SFTPRequestType {
  LIST = "list",
  GET = "get",
  PUT = "put",
  CD = "cd",
  RENAME = "rename",
  DELETE = "delete",
  MKDIR = "mkdir",
  RMDIR = "rmdir",
}

const Req = SFTPRequestType;

export interface SReqList {
  type: typeof Req.LIST;
  data: {
    dir: string;
  }
}

export interface SReqGet {
  type: typeof Req.GET;
  data: {
    remotePath: string;
    localPath: string;
  }
}

export interface SReqPUt {
  type: typeof Req.PUT;
  data: {
    localPath: string;
    remotePath: string;
  }
}

export interface SReqRename {
  type: typeof Req.RENAME;
  data: {
    srcPath: string;
    destPath: string;
  }
}

export interface SReqDelete {
  type: typeof Req.DELETE;
  data: {
    file: string;
  }
}

export interface SReqMkdir {
  type: typeof Req.MKDIR;
  data: {
    dir: string;
  }
}

export interface SRegRmdir {
  type: typeof Req.RMDIR;
  data: {
    dir: string;
  }
}

export type SFTPRequest = SReqList | SReqGet | SReqPUt | SReqRename | SReqDelete | SReqMkdir | SRegRmdir;

export interface SFTPResponse {
  type: SFTPResponseType,
  data: any,
}

// export interface SFTPRequest {
//   type: SFTPRequestType,
//   data: any,
// }