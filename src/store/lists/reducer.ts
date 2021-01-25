import { Endpoints } from "@lib";
import { HistoryReq, SaveReq } from "@models";
import {
  AppActionTypes,
  disableLoading,
  enableLoading,
  setPrompt,
} from "@store/app";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { ListState, ListActionTypes } from "./types";

export type ListsThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, ListState, unknown, Action<string>>
>;

// TODO implement endpoint functions and reducers

const basic: ListsThunk = (
  req: any,
  method: string,
  errorTitle: string,
  type: ListActionTypes
) => {
  return async (dispatch) => {
    dispatch(enableLoading());

    try {
      const json = await Endpoints.getInstance()[method](req);
      dispatch(disableLoading());
      console.log(json);

      return dispatch({
        type: type,
        payload: json.data,
      });
    } catch (err) {
      const e = await err;
      return dispatch({
        type: AppActionTypes.PUT_ERROR,
        payload: { title: errorTitle, message: e.message },
      });
    }
  };
};

export const fetchGroups: ListsThunk = () => {
  return async (dispatch) => {
    dispatch(enableLoading());
    try {
      // TODO implement endpoint function
      const json = await Endpoints.getInstance();
    } catch (err) {
      const e = await err;
      return dispatch({
        type: AppActionTypes.PUT_ERROR,
        payload: { title: "Could not register", message: e.message },
      });
    }
  };
};

export const historyItem: ListsThunk = (req: HistoryReq) => {
  return basic(
    req,
    "historyItem",
    "Could not save server!",
    ListActionTypes.ADD_HISTORY
  );
};

export const saveServer: ListsThunk = (req: SaveReq) => {
  return async (dispatch) => {
    dispatch(enableLoading());
    try {
      const json = await Endpoints.getInstance().save(req);
      console.log(json);
      dispatch(disableLoading());
      dispatch(setPrompt(undefined));
      return dispatch({
        type: ListActionTypes.SAVE_SERVER,
        payload: json.data,
      });
    } catch (err) {
      const e = await err;
      return dispatch({
        type: AppActionTypes.PUT_ERROR,
        payload: { title: "Could not save Server", message: e.message },
      });
    }
  };
};
