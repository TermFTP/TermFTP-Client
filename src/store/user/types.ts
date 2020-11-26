import { User } from "@models";

export enum UserActionTypes {
  REGISTER = "user/register",
  LOGIN = "user/login",
}

export interface UserState {
  data: {
    user: User;
  };
}
