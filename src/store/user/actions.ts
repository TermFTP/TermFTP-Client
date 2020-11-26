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
      break;
    case Type.LOGIN:
      break;
    default:
      return state;
  }
};

export default userReducer;
