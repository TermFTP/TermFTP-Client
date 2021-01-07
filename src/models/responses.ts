export interface DefaultResponse {
  status: number;
  message: string;
  data: unknown;
}

type Def = DefaultResponse;

export interface LoginTokenData {
  userID: string;
  email: string;
  username: string;
}

export interface RegisterRes extends Def {
  userID: string;
  email: string;
  username: string;
  verified: boolean;
}

export interface LoginRes extends Def {
  token: string;
  validUntil: string;
  pcName: string;
  userID: string;
}

export interface ErrorRes extends Def {
  title: string;
}
