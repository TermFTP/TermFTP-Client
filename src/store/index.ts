import { combineReducers, AnyAction, Reducer } from "redux";
import { appReducer } from "./app";
import { ThunkDispatch } from "redux-thunk";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import { userReducer } from "./user";

export const createRootReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    appReducer: appReducer,
    userReducer: userReducer,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export type DefaultDispatch = ThunkDispatch<any, any, AnyAction>;
