import { combineReducers, AnyAction, createStore, applyMiddleware, Action } from "redux";
import { AppActions, appReducer } from "./app";
import thunk, { ThunkDispatch } from "redux-thunk";
import { routerMiddleware } from "connected-react-router";
import { createMemoryHistory, History } from "history";
import { ListActions } from "./lists";
import { FTPActions } from "./ftp";
import { FMActions } from "./filemanager";
import { TabsActions } from "./tabs";
import { createRootReducer } from "./reducer";
import { configureStore } from '@reduxjs/toolkit'
import { inDev } from "@common/helpers";

export const history = createMemoryHistory();

// export const store = createStore(
// 	createRootReducer(history),
// 	applyMiddleware(routerMiddleware(history), thunk)
// );

export const store = configureStore({
	reducer: createRootReducer(history),
	middleware: [routerMiddleware(history), thunk],
	devTools: inDev()
})

export type RootState = ReturnType<typeof store.getState>;

export type RootActions = TabsActions | ListActions | FTPActions | AppActions | FMActions | Action<any> | AnyAction;

export type DefaultDispatch = ThunkDispatch<RootState, any, any>;
