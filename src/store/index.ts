import { combineReducers, AnyAction } from "redux";
import { appReducer } from "./app";
import { ThunkDispatch } from "redux-thunk";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import { userReducer } from "./user";
import { listReducer } from "./lists";

export const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    appReducer: appReducer,
    userReducer: userReducer,
    listReducer: listReducer,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export type DefaultDispatch = ThunkDispatch<any, any, AnyAction>;
