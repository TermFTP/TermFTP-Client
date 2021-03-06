import { combineReducers, AnyAction } from "redux";
import { appReducer } from "./app";
import { ThunkDispatch } from "redux-thunk";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import { userReducer } from "./user";
import { listReducer } from "./lists";
import { ftpReducer } from "./ftp";
import { fmReducer } from "./filemanager";

// eslint-disable-next-line
export const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    appReducer,
    userReducer,
    listReducer,
    ftpReducer,
    fmReducer,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export type DefaultDispatch = ThunkDispatch<any, any, AnyAction>;
