import { Endpoints } from "@lib";
import { SaveReq } from "@models";
import { AppActionTypes, disableLoading, enableLoading } from "@store/app";
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

export const save: ListsThunk = (req: SaveReq) => {
  return basic(
    req,
    "save",
    "Could not save server!",
    ListActionTypes.SAVE_SERVER
  );
  // return async (dispatch) => {
  //   dispatch(enableLoading());

  //   try {
  //     const json = await Endpoints.getInstance().save(req);
  //     dispatch(disableLoading());

  //     return dispatch({
  //       type: ListActionTypes.SAVE_SERVER,
  //       payload: req,
  //     });
  //   } catch (err) {
  //     const e = await err;
  //     return dispatch({
  //       type: AppActionTypes.PUT_ERROR,
  //       payload: { title: "Could not save server!", message: e.message },
  //     });
  //   }
  // };
};

// export const addFavourite = (req: SaveReq) => {};
