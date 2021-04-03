import { FileI } from "@models";

export interface ContextMenuProps {
  x?: number;
  y?: number;
  file?: FileI;
  isOpen: boolean;
}

export enum FMTypes {
  SET_CONTEXT_MENU = "fm/set-context-menu",
}

export interface FMState {
  menu: ContextMenuProps;
}
