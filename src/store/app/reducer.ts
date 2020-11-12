import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { AppState, AppActionTypes } from "./types";
import { OwnError } from "@models";

export type AppThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, AppState, unknown, Action<string>>
>;

export const putError = (error: OwnError) => {
  return {
    type: AppActionTypes.PUT_ERROR,
    payload: error,
  };
};

export const enableLoading = () => {
  return {
    type: AppActionTypes.ENABLE_LOADING,
  };
};

export const disableLoading = () => {
  return {
    type: AppActionTypes.DISABLE_LOADING,
  };
};

export const toggleLoading = () => {
  return {
    type: AppActionTypes.TOGGLE_LOADING,
  };
};

export const resetError = () => {
  return {
    type: AppActionTypes.RESET_ERROR,
  };
};
