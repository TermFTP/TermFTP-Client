import { User } from "@models";

export enum UserActionTypes {
	REGISTER = "user/register",
	LOGIN = "user/login",
	LOGOUT = "user/logout"
}

export interface UserState {
	data: {
		user: User;
	};
}
