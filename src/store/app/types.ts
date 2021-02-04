import { PromptProps } from "@components";
import { BubbleModel, OwnError } from "@models";

export enum AppActionTypes {
  SET_LOADING = "app/set-loading",
  PUT_ERROR = "app/put-error",
  RESET_ERROR = "app/reset-error",
  SET_PROMPT = "app/set-prompt",
  SET_SETTINGS = "app/set-settings",
  ADD_BUBBLE = "app/add-bubble",
  REMOVE_BUBBLE = "app/remove-bubble",
}

export interface AppState {
  data: {
    isLoading?: boolean;
    bubbles?: Map<string, BubbleModel>;
  };
  error?: OwnError;
  settingsOpen: boolean;
  prompt: PromptProps;
}
