import { Endpoints } from "@lib";
import { HistoryReq, SaveReq } from "@models";
import { addBubble, AppActionTypes, setLoading, setPrompt } from "@store/app";
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
  type: ListActionTypes,
  success: string
) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const json = await Endpoints.getInstance()[method](req);
      dispatch(setLoading(false));
      dispatch(
        addBubble(`${method}-success`, {
          title: `${success} was successful`,
          type: "SUCCESS",
        })
      );

      return dispatch({
        type: type,
        payload: json.data,
      });
    } catch (err) {
      const e = await err;
      return dispatch(
        addBubble(`${method}-${errorTitle}`, {
          title: errorTitle,
          message: e.message,
          type: "ERROR",
        })
      );
    }
  };
};

export const fetchGroups: ListsThunk = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // TODO implement endpoint function
      const json = await Endpoints.getInstance();
      dispatch(setLoading(false));
      dispatch(
        addBubble(`fetchGroups-success`, {
          title: `Fetching Groups was successful`,
          type: "SUCCESS",
        })
      );
    } catch (err) {
      const e = await err;
      return dispatch(
        addBubble(`fetchGroups-error`, {
          title: "Fetching Groups failed",
          message: e.message,
          type: "ERROR",
        })
      );
    }
  };
};

export const historyItem: ListsThunk = (req: HistoryReq) => {
  return basic(
    req,
    "historyItem",
    "Could not save server!",
    ListActionTypes.ADD_HISTORY,
    "Registering"
  );
};

export const saveServer: ListsThunk = (req: SaveReq) => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const json = await Endpoints.getInstance().save(req);
      dispatch(setLoading(false));
      dispatch(
        addBubble(`saveServer-success`, {
          title: `Saving a server was successful`,
          type: "SUCCESS",
        })
      );
      dispatch(setPrompt(undefined));
      return dispatch({
        type: ListActionTypes.SAVE_SERVER,
        payload: json.data,
      });
    } catch (err) {
      const e = await err;
      return dispatch(
        addBubble(`saveServer-error`, {
          title: "Saving a server failed",
          message: e.message,
          type: "ERROR",
        })
      );
    }
  };
};
