import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { AppState, AppActionTypes } from "./types";
import { BubbleModel, DefaultReturn, OwnError } from "@models";
import { PromptProps } from "@components";

export type AppThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, AppState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
  type: AppActionTypes;
}

export const putError = (error: OwnError): Ret => {
  return {
    type: AppActionTypes.PUT_ERROR,
    payload: error,
  };
};

export const setLoading = (loading: boolean): Ret => {
  return {
    type: AppActionTypes.SET_LOADING,
    payload: loading,
  };
};

export const resetError = (): Ret => {
  return {
    type: AppActionTypes.RESET_ERROR,
  };
};

export const setSettings = (open: boolean): Ret => {
  return {
    type: AppActionTypes.SET_SETTINGS,
    payload: open,
  };
};

export const setPrompt = (prompt: PromptProps): Ret => {
  return {
    type: AppActionTypes.SET_PROMPT,
    payload: prompt,
  };
};

export const addBubble = (key: string, bubble: BubbleModel): Ret => {
  bubble.when = new Date();
  return {
    type: AppActionTypes.ADD_BUBBLE,
    payload: {
      key,
      bubble,
    },
  };
};

export const removeBubble = (key: string): Ret => {
  return {
    type: AppActionTypes.REMOVE_BUBBLE,
    payload: {
      key,
    },
  };
};
