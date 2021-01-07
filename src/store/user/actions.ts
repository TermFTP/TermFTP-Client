import { UserState, UserActionTypes as Type } from "./types";
import { Reducer } from "redux";

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
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("pcName", action.payload.pcName);
      localStorage.setItem("validUntil", action.payload.validUntil);
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export default userReducer;
