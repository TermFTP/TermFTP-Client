import { Endpoints } from "@lib";
import { AppActionTypes, enableLoading } from "@store/app";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { ListState, ListActionTypes } from "./types";

export type ListsThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, ListState, unknown, Action<string>>
>;

// TODO implement endpoint functions and reducers

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
