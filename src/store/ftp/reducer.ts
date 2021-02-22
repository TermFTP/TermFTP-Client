import { Endpoints, FTP } from "@lib";
import { addBubble, setLoading, setPrompt } from "@store/app";
import { push } from "connected-react-router";
import Client from "ftp";
import { Action, ActionCreator } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { FTPState, FTPActionTypes } from "./types";

export type FTPThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, FTPState, unknown, Action<string>>
>;

export const setFTPClient = (client: FTP) => ({
  type: FTPActionTypes.SET_FTP_CLIENT,
  payload: client,
});

export const goToFTPClient: FTPThunk = (client: FTP) => {
  return async (dispatch) => {
    dispatch(setFTPClient(client));
    return dispatch(push("/file-manager"));
  };
};
