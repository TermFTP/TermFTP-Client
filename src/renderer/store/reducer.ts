import { connectRouter } from "connected-react-router";
import { History } from "history";
import { combineReducers } from "redux";
import { appReducer } from "./app";
import { userReducer } from "./user";
import { listReducer } from "./lists";
import { ftpReducer } from "./ftp";
import { fmReducer } from "./filemanager";
import { tabsReducer } from "./tabs";

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