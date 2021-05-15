import { FileI } from "@shared";

export type TerminalActions = "OPEN" | "CLOSE" | "TOGGLE";

export interface ContextMenuProps {
  x?: number;
  y?: number;
  file?: FileI;
  isOpen: boolean;
}

export enum FMActions {
  SET_CONTEXT_MENU = "fm/set-context-menu",
  SET_FM_LOADING = "fm/set-fm-loading",
  SET_TERMINAL = "fm/set-terminal",
  SET_TERMINAL_HEIGHT = "fm/set-terminal-height",
}

export interface FMState {
  menu: ContextMenuProps;
  loading: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
}
