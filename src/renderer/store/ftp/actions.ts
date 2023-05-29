import { BaseFTP } from "@lib";
import { FileI, FTPConnectTypes } from "@models";
import { push } from "connected-react-router";
import { FTPAddSelection, FTPClearSelection, FTPRemoveSelection, FTPSelectFile, FTPSetClient, FTPSetFiles, FTPSetType, FTPShiftSelection, FTPUpdateReducer } from ".";
import { FTPState, FTPActionTypes, FTPThunk } from "./types";

const A = FTPActionTypes;

export const setFTPClient = (client: BaseFTP): FTPSetClient => ({
	type: A.SET_FTP_CLIENT,
	payload: client,
});

export const goToFTPClient: FTPThunk = (client: BaseFTP) => {
	return async (dispatch) => {
		dispatch(setFTPClient(client));
		return dispatch(push("/file-manager"));
	};
};

export const setFiles = (files: FileI[]): FTPSetFiles => ({
	type: A.SET_FILES,
	payload: files
})

export const addSelection = (file: FileI): FTPAddSelection => ({
	type: A.ADD_SELECTION,
	payload: file
})

export const selectFile = (file: FileI): FTPSelectFile => ({
	type: A.SELECT_FILE,
	payload: file
})

export const shiftSelection = (file: FileI): FTPShiftSelection => ({
	type: A.SHIFT_SELECTION,
	payload: file
})

export const clearSelection = (): FTPClearSelection => ({
	type: A.CLEAR_SELECTION,
})

export const removeSelection = (file: FileI): FTPRemoveSelection => ({
	type: A.REMOVE_SELECTION,
	payload: file
})

export const setFTPType = (ftpType: FTPConnectTypes): FTPSetType => ({
	type: A.SET_FTP_TYPE,
	payload: ftpType
})

export const updateFTPReducer = (ftp: FTPState): FTPUpdateReducer => ({
	type: A.UPDATE_FTP_REDUCER,
	payload: ftp
})