export enum FileType {
  UNKNOWN = "unknown",
  FILE = "file",
  DIR = "dir",
  SYMBOLIC = "symbolic",
}

export interface FileI {
  type: FileType;
  name: string;
  size: number;
  date: Date;
  // path: string;
}