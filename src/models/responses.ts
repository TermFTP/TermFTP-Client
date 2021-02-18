import { Group } from "./server";

export interface DefaultResponse {
  status: number;
  message: string;
  data: unknown;
}

type Def = DefaultResponse;

export interface LoginTokenData {
  data: {
    userID: string;
    email: string;
    username: string;
  };
}

export interface RegisterRes extends Def {
  data: {
    userID: string;
    email: string;
    username: string;
    verified: boolean;
  };
}

export interface LoginRes extends Def {
  data: {
    token: string;
    validUntil: string;
    pcName: string;
    userID: string;
    accessTokenID: {
      token: string;
      userID: string;
    };
  };
}

export interface ErrorRes extends Def {
  title: string;
}

export interface HistoryItemRes extends Def {
  data: {
    ip: string;
    deleted: boolean;
    device: string;
    historyItemID: {
      userID: string;
      when: string;
    };
    sshPort: number;
    ftpPort: number;
    username: string;
  };
}

export interface SaveRes extends Def {
  data: {
    ip: string;
    ftpPort: number;
    lastConnection?: string;
    name: string;
    password: string;
    serverID: string;
    sshPort: number;
    username: string;
  };
}

export interface GroupsRes extends Def {
  data: Group[];
}
