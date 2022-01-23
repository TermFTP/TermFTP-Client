import { combineReducers, AnyAction, createStore, applyMiddleware, Action } from "redux";
import { appReducer } from "./app";
import thunk, { ThunkDispatch } from "redux-thunk";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory, History } from "history";
import { userReducer } from "./user";
import { listReducer } from "./lists";
import { ftpReducer } from "./ftp";
import { fmReducer } from "./filemanager";
import { TabsActions, tabsReducer } from "./tabs";

// eslint-disable-next-line
export const createRootReducer = (history: History) =>
	combineReducers({
		router: connectRouter(history),
		appReducer,
		userReducer,
		listReducer,
		ftpReducer,
		fmReducer,
		tabsReducer
	});

export const history = createBrowserHistory();

export const store = createStore(
	createRootReducer(history),
	applyMiddleware(routerMiddleware(history), thunk)
);

export type RootState = ReturnType<typeof store.getState>;

export type RootActions = TabsActions | Action<any> | AnyAction;

export type DefaultDispatch = ThunkDispatch<any, any, RootActions | AnyAction>;
