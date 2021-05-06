export enum FileType {
  UNKNOWN = 0,
  FILE = 1,
  DIR = 2,
  SYMBOLIC = 3,
}

export interface FileI {
  type: FileType;
  name: string;
  size: number;
  date: Date;
  // path: string;
}