import { UserState, UserActionTypes as Type } from "./types";
import { Reducer } from "redux";
import { Endpoints } from "@lib";

export const initialState: UserState = {
	data: {
		user: null,
	},
};

export const userReducer: Reducer<UserState> = (
	state = initialState,
	action
) => {
	switch (action.type) {
		case Type.REGISTER:
			return { ...state, user: action.payload };
		case Type.LOGIN:
			localStorage.setItem("token", action.payload.accessTokenID.token);
			localStorage.setItem("pcName", action.payload.pcName);
			localStorage.setItem("validUntil", action.payload.validUntil);
			return { ...state, user: action.payload };
		case Type.LOGOUT:
			Endpoints.getInstance().setAuthHeaders({});
			localStorage.removeItem("token");
			localStorage.removeItem("pcName");
			localStorage.removeItem("validUntil");
			return {
				...state,
				data: { user: null }
			}
		default:
			return state;
	}
};

export default userReducer;
