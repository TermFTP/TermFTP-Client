import { PromptProps } from "@components";
import { OwnError } from "@models";

export enum AppActionTypes {
  ENABLE_LOADING = "app/enable-loading",
  DISABLE_LOADING = "app/disable-loading",
  TOGGLE_LOADING = "app/toggle-loading",
  PUT_ERROR = "app/put-error",
  RESET_ERROR = "app/reset-error",
  OPEN_SETTINGS = "app/open-settings",
  CLOSE_SETTINGS = "app/close-settings",
  SET_PROMPT = "app/set-prompt",
}

export interface AppState {
  data: {
    isLoading: boolean;
  };
  error?: OwnError;
  settingsOpen: boolean;
  prompt: PromptProps;
}
