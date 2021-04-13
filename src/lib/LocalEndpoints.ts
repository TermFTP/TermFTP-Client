import { EditReq, GroupReq, GroupRes, GroupsRes, HistoryItemRes, HistoryReq, RemoveFromGroupReq, RemoveGroupReq, RemoveServerReq, SaveReq, SaveRes } from "@models";
import { IRawParams } from "@shared/models";
import * as idb from 'idb';

export class LocalEndpoints implements IRawParams {
  [k: string]: any;
  
  private static _instance: LocalEndpoints;

  private db: idb.IDBPDatabase;

  private async getDatabase() {
    this.db = await idb.openDB("termftp", 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        db.createObjectStore('server', {keyPath: 'id', autoIncrement: true});
      }
    })
  }

  /**
   * gets the singleton instance for the Endpoints class
   */
  static getInstance(): LocalEndpoints {
    if (!this._instance) this._instance = new LocalEndpoints();

    return this._instance;
  }

  storeToIndexedDB = async (
    store: string,
    object = {}
  ):Promise<string> => {

    await this.getDatabase();

    const tx = this.db.transaction(store, "readwrite");

    const key: IDBValidKey = await tx.store.add(object);
    await tx.done;

    
    console.log(key.toString())
    return key.toString()
  }

  historyItem = (req: HistoryReq): HistoryItemRes => {
    return null;
  };

  saveServer = async (req: SaveReq): Promise<SaveRes> => {

    return new Promise((resolve, reject) => {

      this.storeToIndexedDB("server", req).then(id => {
        resolve({
          status: 200,
          message: "Stored succesfully",
          data: {
            serverID: id,
            ip: req.ip,
            ftpPort: req.ftpPort,
            lastConnection: req.lastConnection,
            name: req.name,
            password: req.password,
            sshPort: req.sshPort,
            username: req.username
          }
        });
      });

    });
  };

  editServer = (req: EditReq): SaveRes => {
    return null;
  };

  fetchGroups = async(): Promise<GroupsRes> => {
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