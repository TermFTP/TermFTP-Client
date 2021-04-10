import { EditReq, GroupReq, GroupRes, GroupsRes, HistoryItemRes, HistoryReq, RemoveFromGroupReq, RemoveGroupReq, RemoveServerReq, SaveReq, SaveRes } from "@models";
import { IRawParams } from "@shared/models";

export class LocalEndpoints implements IRawParams {
  [k: string]: any;
  
  private static _instance: LocalEndpoints;

  /**
   * gets the singleton instance for the Endpoints class
   */
  static getInstance(): LocalEndpoints {
    if (!this._instance) this._instance = new LocalEndpoints();

    return this._instance;
  }

  historyItem = (req: HistoryReq): HistoryItemRes => {
    return null;
  };

  saveServer = (req: SaveReq): SaveRes => {
    return null;
  };

  editServer = (req: EditReq): SaveRes => {
    return null;
  };

  fetchGroups = (): GroupsRes => {
    return null;
  };

  group = (req: GroupReq): GroupRes => {
    return null;
  };

  removeServerFromGroup(req: RemoveFromGroupReq): void {
    return null;
  }

  removeGroup(req: RemoveGroupReq): Promise<void> {
    return null;
  }

  removeServer(req: RemoveServerReq): Promise<void> {
    return null;
  }
}