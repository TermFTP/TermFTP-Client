import { combineReducers, AnyAction } from "redux";
import { appReducer } from "./app";
import { ThunkDispatch } from "redux-thunk";
import { connectRouter } from "connected-react-router";
import { History } from "history";

export const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    appReducer: appReducer,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export type DefaultDispatch = ThunkDispatch<any, any, AnyAction>;