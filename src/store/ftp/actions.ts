import { FTPState, FTPActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: FTPState = {
  client: undefined,
};

export const ftpReducer: Reducer<FTPState> = (state = initialState, action) => {
  switch (action.type) {
    case FTPActionTypes.SET_FTP_CLIENT:
      return { ...state, client: action.payload };
    default:
      return state;
  }
};

export default ftpReducer;
