import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { UserState, UserActionTypes } from "./types";
import { addBubble, setLoading } from "@store/app";
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
    dispatch(setLoading(true));

    try {
      const json = await Endpoints.getInstance().register({
        email,
        username,
        password,
      });
      dispatch(push("/login"));
      dispatch(setLoading(false));
      dispatch(
        addBubble(`register-success`, {
          title: `Registered successfully`,
          type: "SUCCESS",
        })
      );

      return dispatch({
        type: UserActionTypes.REGISTER,
        payload: json.data,
      });
    } catch (err) {
      const e = await err;
      dispatch(setLoading(false));
      return dispatch(
        addBubble(`register-error`, {
          title: "Registering failed",
          message: e.message,
          type: "ERROR",
        })
      );
    }
  };
};

export const login: UserThunk = (username: string, password: string) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const json = await Endpoints.getInstance().login({
        username,
        password,
        pcName: hostname(),
      });
      Endpoints.getInstance().setAuthHeaders({
        "Access-Token": json.data.accessTokenID.token,
      });

      dispatch(push("/main"));
      dispatch(setLoading(false));
      dispatch(
        addBubble(`login-success`, {
          title: `Logged in successfully`,
          type: "SUCCESS",
        })
      );

      return dispatch({
        type: UserActionTypes.LOGIN,
        payload: json.data,
      });
    } catch (err) {
      const e = await err;
      dispatch(setLoading(false));
      return dispatch(
        addBubble(`login-error`, {
          title: "Login failed",
          message: e.message,
          type: "ERROR",
        })
      );
    }
  };
};
