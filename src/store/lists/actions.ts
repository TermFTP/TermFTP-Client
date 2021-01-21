import { ListState, ListActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: ListState = {
  groups: null,
  saved: [],
  history: [],
  favourites: {
    name: "Favourites",
    server: [
      {
        ftpPort: 21,
        ip: "localhost",
        lastConnection: new Date(),
        name: "first",
        password: "admin",
        serverID: "ha1",
        sshPort: 22,
        username: "admin",
      },
      {
        ftpPort: 21,
        ip: "localhost",
        lastConnection: new Date(),
        name: "first",
        password: "admin",
        serverID: "ashdhjksa",
        sshPort: 22,
        username: "admin",
      },
      {
        ftpPort: 21,
        ip: "localhost",
        lastConnection: new Date(),
        name: "first",
        password: "admin",
        serverID: "asdkj",
        sshPort: 22,
        username: "admin",
      },
    ],
  },
};

// TODO implement all cases

export const listReducer: Reducer<ListState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case ListActionTypes.SAVE_SERVER:
      return { ...state, saved: [...state.saved, action.payload] };
    case ListActionTypes.ADD_FAV:
      return {
        ...state,
        favourites: {
          ...state.favourites,
          server: [...state.favourites.server, action.payload],
        },
      };
    default:
      return state;
  }
};

export default listReducer;
