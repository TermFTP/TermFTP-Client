import { Endpoints } from "@lib";
import { GroupsRes, HistoryReq, SaveReq } from "@models";
import { addBubble, setLoading, setPrompt } from "@store/app";
import { Action, ActionCreator } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { ListState, ListActionTypes } from "./types";

export type ListsThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, ListState, unknown, Action<string>>
>;

type TDispatch = ThunkDispatch<ListState, unknown, Action<string>>;

/**
 *
 * @param req the request data
 * @param method the method name in the Endpoints class
 * @param errorTitle what should be the title of the error if there is one
 * @param type the type that should be the final dispatch
 * @param success the message if the request was a success (undefined if there should be notification)
 * @param extra extra actions to take after the request was sucessful
 */
const basic: ListsThunk = (
  req: any,
  method: string,
  errorTitle: string,
  type: ListActionTypes,
  success: string = undefined,
  extra: (dispatch: TDispatch, json: any) => any = undefined
) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const json = await Endpoints.getInstance()[method](req);
      dispatch(setLoading(false));
      if (success) {
        dispatch(
          addBubble(`${method}-success`, {
            title: `${success} was successful`,
            type: "SUCCESS",
          })
        );
      }
      let more;
      if (extra) {
        more = extra(dispatch, json);
      }

      if (more) {
        return dispatch({
          type,
          payload: more,
        });
      } else {
        return dispatch({
          type,
          payload: json.data,
        });
      }
    } catch (err) {
      const e = await err;
      dispatch(setLoading(false));
      return dispatch(
        addBubble(`${method}-${errorTitle}`, {
          title: errorTitle,
          message: e.message,
          type: "ERROR",
        })
      );
    }
  };
};

export const fetchGroups: ListsThunk = () => {
  return basic(
    undefined,
    "fetchGroups",
    "Could not fetch groups/favourites",
    ListActionTypes.FETCH_GROUPS,
    undefined,
    (dispatch: TDispatch, json: GroupsRes) => {
      console.log("fired", json.data);
      const favI = json.data.findIndex((g) => {
          return g.name === "favourites"; // get the list of favourites
        }),
        defI = json.data.findIndex((g) => {
          return g.name === "default"; // get the non grouped servers
        });

      const fav = favI !== -1 ? json.data.splice(favI, 1)[0] : undefined;
      const def = defI !== -1 ? json.data.splice(defI, 1)[0] : undefined;
      let payload = { groups: json.data } as Record<string, unknown>;
      if (fav) payload = { ...payload, favourites: fav };
      if (def) payload = { ...payload, saved: def.server };

      return payload;
    }
  );
};

export const historyItem: ListsThunk = (req: HistoryReq) => {
  return basic(
    req,
    "historyItem",
    "Could not add item to history",
    ListActionTypes.ADD_HISTORY
  );
};

export const saveServer: ListsThunk = (req: SaveReq) => {
  return basic(
    req,
    "saveServer",
    "Could not save server",
    ListActionTypes.SAVE_SERVER,
    "Saving a Server was successful",
    (dispatch: TDispatch) => {
      dispatch(setPrompt(undefined));
      return;
    }
  );
};
