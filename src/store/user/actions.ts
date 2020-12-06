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
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export default userReducer;
