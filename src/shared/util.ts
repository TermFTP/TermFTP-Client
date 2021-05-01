import * as eIsDev from "electron-is-dev";

export function isDev(): boolean {
  return eIsDev;
}