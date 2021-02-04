import { PromptProps } from "@components";
import { BubbleModel } from "@models";

export enum AppActionTypes {
  SET_LOADING = "app/set-loading",
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
  settingsOpen: boolean;
  prompt: PromptProps;
}
