import { FTPState, FTPActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: FTPState = {
  client: undefined,
  files: []
};

export const ftpReducer: Reducer<FTPState> = (state = initialState, action) => {
  switch (action.type) {
    case FTPActionTypes.SET_FTP_CLIENT:
      return { ...state, client: action.payload };
    case FTPActionTypes.SET_FILES:
      return { ...state, files: action.payload };
    default:
      return state;
  }
};

export default ftpReducer;
