import { BaseFTP } from "@lib";
import { FileI, FTPConnectTypes } from "@shared";
import { RootActions } from "@store";
import { ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";

export type FTPThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, FTPState, unknown, RootActions>
>;

export enum FTPActionTypes {
	SET_FTP_CLIENT = "ftp/set-ftp-client",
	SET_FILES = "ftp/set-files",
	SELECT_FILE = "ftp/select-file",
	ADD_SELECTION = "ftp/add-selection",
	REMOVE_SELECTION = "ftp/remove-selection",
	SHIFT_SELECTION = "ftp/shift-selection",
	CLEAR_SELECTION = "ftp/clear-selection",
	SET_FTP_TYPE = "ftp/set-ftp-type",
	UPDATE_FTP_REDUCER = "ftp/update-ftp-reducer"
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

const A = FTPActionTypes;

export interface FTPSetClient {
	type: typeof A.SET_FTP_CLIENT;
	payload: BaseFTP;
}

export interface FTPSetFiles {
	type: typeof A.SET_FILES;
	payload: FileI[];
}

export interface FTPSelectFile {
	type: typeof A.SELECT_FILE;
	payload: FileI;
}

export interface FTPAddSelection {
	type: typeof A.ADD_SELECTION;
	payload: FileI;
}

export interface FTPRemoveSelection {
	type: typeof A.REMOVE_SELECTION;
	payload: FileI;
}

export interface FTPShiftSelection {
	type: typeof A.SHIFT_SELECTION;
	payload: FileI;
}

export interface FTPClearSelection {
	type: typeof A.CLEAR_SELECTION;
}

export interface FTPSetType {
	type: typeof A.SET_FTP_TYPE;
	payload: FTPConnectTypes;
}

export interface FTPUpdateReducer {
	type: typeof A.UPDATE_FTP_REDUCER;
	payload: FTPState;
}

export type FTPActions =
	FTPSetClient | FTPSetFiles | FTPSelectFile | FTPAddSelection | FTPRemoveSelection | FTPShiftSelection | FTPClearSelection | FTPSetType | FTPUpdateReducer
