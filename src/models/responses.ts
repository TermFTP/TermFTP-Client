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

export interface LoginRes extends Def {
  data: LoginTokenData;
}

export interface ErrorRes extends Def {
  title: string;
}
