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
  };
}

export interface ErrorRes extends Def {
  title: string;
}
