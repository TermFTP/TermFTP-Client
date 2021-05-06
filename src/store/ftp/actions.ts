import { BaseFTP } from "@lib";
import { DefaultReturn } from "@models";
import { FileI } from "@shared";
import { push } from "connected-react-router";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { FTPState, FTPActionTypes } from "./types";

export type FTPThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, FTPState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
  type: FTPActionTypes;
}

export const setFTPClient = (client: BaseFTP): Ret => ({
  type: FTPActionTypes.SET_FTP_CLIENT,
  payload: client,
});

export const goToFTPClient: FTPThunk = (client: BaseFTP) => {
  return async (dispatch) => {
    dispatch(setFTPClient(client));
    return dispatch(push("/file-manager"));
  };
};

export const setFiles = (files: FileI[]): Ret => ({
  type: FTPActionTypes.SET_FILES,
  payload: files
})
