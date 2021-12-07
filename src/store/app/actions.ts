import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { AppState, AppActionTypes } from "./types";
import { BubbleModel, DefaultReturn } from "@models";
import { PromptProps } from "@components";
import { OkbarProps } from "@components/Okbar/Okbar";

export type AppThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, AppState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
  type: AppActionTypes;
}

export const setLoading = (loading: boolean): Ret => {
  return {
    type: AppActionTypes.SET_LOADING,
    payload: loading,
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

export const setOkbar = (okbar: OkbarProps): Ret => {
  return {
    type: AppActionTypes.SET_OKBAR,
    payload: okbar,
  }
}

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

export const setAutoLoggedIn = (autoLoggedIn: boolean): Ret => {
  return {
    type: AppActionTypes.SET_AUTO_LOGGED_IN,
    payload: autoLoggedIn
  }
}
