import { BaseFTP } from "@lib";
import { FileI, FTPConnectTypes } from "@shared";

export enum FTPActionTypes {
  SET_FTP_CLIENT = "ftp/set-ftp-client",
  SET_FILES = "ftp/set-files",
  SELECT_FILE = "ftp/select-file",
  ADD_SELECTION = "ftp/add-selection",
  REMOVE_SELECTION = "ftp/remove-selection",
  SHIFT_SELECTION = "ftp/shift-selection",
  CLEAR_SELECTION = "ftp/clear-selection",
  SET_FTP_TYPE = "ftp/set-ftp-type"
}

export interface FTPState {
  client: BaseFTP;
  files: FileI[];
  selection: {
    lastSelection?: FileI;
    selected: Set<FileI>;
  };
  ftpType: FTPConnectTypes;
}
