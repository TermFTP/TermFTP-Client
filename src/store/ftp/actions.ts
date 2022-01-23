import { BaseFTP } from "@lib";
import { DefaultReturn } from "@models";
import { FileI, FTPConnectTypes } from "@shared";
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

export const addSelection = (file: FileI): Ret => ({
	type: FTPActionTypes.ADD_SELECTION,
	payload: file
})

export const selectFile = (file: FileI): Ret => ({
	type: FTPActionTypes.SELECT_FILE,
	payload: file
})

export const shiftSelection = (file: FileI): Ret => ({
	type: FTPActionTypes.SHIFT_SELECTION,
	payload: file
})

export const clearSelection = (): Ret => ({
	type: FTPActionTypes.CLEAR_SELECTION,
})

export const removeSelection = (file: FileI): Ret => ({
	type: FTPActionTypes.REMOVE_SELECTION,
	payload: file
})

export const setFTPType = (ftpType: FTPConnectTypes): Ret => ({
	type: FTPActionTypes.SET_FTP_TYPE,
	payload: ftpType
})

export const updateFTPReducer = (ftp: FTPState): Ret => ({
	type: FTPActionTypes.UPDATE_FTP_REDUCER,
	payload: ftp
})