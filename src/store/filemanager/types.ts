import Client from "ftp";

export interface ContextMenuProps {
  x?: number;
  y?: number;
  file?: Client.ListingElement;
  isOpen: boolean;
}

export enum FMTypes {
  SET_CONTEXT_MENU = "fm/set-context-menu",
}

export interface FMState {
  menu: ContextMenuProps;
}
