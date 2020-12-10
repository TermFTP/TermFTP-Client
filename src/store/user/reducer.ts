import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { UserState, UserActionTypes } from "./types";
import { AppActionTypes, disableLoading, enableLoading } from "@store/app";
import { Endpoints } from "@lib";
import { push } from "connected-react-router";
import { hostname } from "os";

export type UserThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, UserState, unknown, Action<string>>
>;

export const register: UserThunk = (
  email: string,
  username: string,
  password: string
) => {
  return async (dispatch) => {
    dispatch(enableLoading());

    try {
      const json = await Endpoints.getInstance().register({
        email,
        username,
        password,
      });
      dispatch(push("/login"));
      dispatch(disableLoading());

      return dispatch({
        type: UserActionTypes.REGISTER,
        payload: json,
      });
    } catch (err) {
      const e = await err;
      return dispatch({
        type: AppActionTypes.PUT_ERROR,
        payload: { title: "Could not register", msg: e.msg },
      });
    }
  };
};

export const login: UserThunk = (username: string, password: string) => {
  return async (dispatch) => {
    dispatch(enableLoading());

    try {
      const json = await Endpoints.getInstance().login({
        username,
        password,
        pcName: hostname(),
      });
      dispatch(push("/main"));
      dispatch(disableLoading());

      return dispatch({
        type: UserActionTypes.LOGIN,
        payload: json,
      });
    } catch (err) {
      const e = await err;
      return dispatch({
        type: AppActionTypes.PUT_ERROR,
        payload: { title: "Could not login", msg: e.msg },
      });
    }
  };
};
