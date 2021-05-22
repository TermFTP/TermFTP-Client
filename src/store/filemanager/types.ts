import { FileI } from "@shared";

export type TerminalActions = "OPEN" | "CLOSE" | "TOGGLE";

export interface ContextMenuProps {
  x?: number;
  y?: number;
  file?: FileI;
  isOpen: boolean;
}

export interface SearchProps {
  searching: boolean;
  query?: string;
}

export enum FMActions {
  SET_CONTEXT_MENU = "fm/set-context-menu",
  SET_FM_LOADING = "fm/set-fm-loading",
  SET_TERMINAL = "fm/set-terminal",
  SET_TERMINAL_HEIGHT = "fm/set-terminal-height",
  SEARCH = "fm/search",
}

export interface FMState {
  menu: ContextMenuProps;
  loading: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
  search: SearchProps;
}
