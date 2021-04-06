import { FileI } from "@models";

export interface ContextMenuProps {
  x?: number;
  y?: number;
  file?: FileI;
  isOpen: boolean;
}

export enum FMTypes {
  SET_CONTEXT_MENU = "fm/set-context-menu",
  SET_FM_LOADING = "fm/set-fm-loading"
}

export interface FMState {
  menu: ContextMenuProps;
  loading: boolean;
}
