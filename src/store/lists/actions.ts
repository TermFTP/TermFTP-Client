import { Endpoints } from "@lib";
import {
	GroupsRes,
	HistoryReq,
	SaveReq,
	EditReq,
	Server,
	GroupReq,
	RemoveFromGroupReq,
	RemoveGroupReq,
	RemoveServerReq,
	DefaultResponse,
} from "@models";
import { DefaultDispatch } from "@store";
import { addBubble, setLoading, setPrompt } from "@store/app";
import { ListStartEdit, ListsThunk } from ".";
import { ListActionTypes } from "./types";

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
	extra: (dispatch: DefaultDispatch, json: any) => any = undefined
) => {
	return async (dispatch) => {
		dispatch(setLoading(true));

		try {
			let json: DefaultResponse;

			if (!Endpoints.getInstance().headers["Access-Token"]) {
				//nothing
				json = {
					status: 200,
					data: [],
					message: "This is the guest mode!"
				};
			}
			else
				json = await Endpoints.getInstance()[method](req);

			dispatch(setLoading(false));
			if (success) {
				dispatch(
					addBubble(`${method}-success`, {
						title: `${success} was successful`,
						type: "SUCCESS",
					})
				);
			}

			if (!type) return;

			let more;
			if (extra) {
				more = extra(dispatch as unknown as DefaultDispatch, json);
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
		} catch (err: any) {
			const e = await err;
			dispatch(setLoading(false));
			console.error(method, err);
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
		(_: DefaultDispatch, json: GroupsRes) => {
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
			if (def) payload = { ...payload, saved: def };

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
		"Saved server successfully",
		(dispatch: DefaultDispatch) => {
			dispatch(setPrompt(undefined));
			return;
		}
	);
};

export const changeEditServer = (server: Server): ListStartEdit => {
	return {
		type: ListActionTypes.START_EDIT_SERVER,
		payload: server,
	};
};

export const editServer: ListsThunk = (req: EditReq) => {
	return basic(
		req,
		"editServer",
		"Could not update server",
		ListActionTypes.EDIT_SERVER,
		"Updated server successfully"
	);
};

export const addGroup: ListsThunk = (req: GroupReq) => {
	req.groupID = null;
	return basic(
		req,
		"group",
		"Could not create group",
		ListActionTypes.ADD_GROUP,
		"Created group successfully",
		(dispatch: DefaultDispatch) => {
			dispatch(fetchGroups());
			dispatch(setPrompt(undefined));
		}
	);
};

export const changeGroup: ListsThunk = (req: GroupReq) => {
	if (req.name) {
		return basic(
			req,
			"group",
			"Could not change name of group",
			undefined
		);
	}
	return basic(
		req,
		"group",
		"Could not add server to group",
		undefined,
		undefined,
		(dispatch: DefaultDispatch) => {
			dispatch(fetchGroups());
		}
		// "Added servers to group"
	);
};

export const removeServerFromGroup: ListsThunk = (req: RemoveFromGroupReq) => {
	return basic(
		req,
		"removeServerFromGroup",
		"Could not remove server from group",
		undefined,
		undefined,
		(dispatch: DefaultDispatch) => {
			dispatch(fetchGroups());
		}
	);
};

export const removeGroup: ListsThunk = (req: RemoveGroupReq) => {
	return basic(
		req,
		"removeGroup",
		"Could not remove group",
		undefined,
		"Removed group",
		(dispatch: DefaultDispatch) => {
			dispatch(fetchGroups());
		}
	);
};

export const removeServer: ListsThunk = (req: RemoveServerReq) => {
	return basic(
		req,
		"removeServer",
		"Could not remove server",
		undefined,
		"Removed Server",
		(dispatch: DefaultDispatch) => {
			dispatch(fetchGroups());
		}
	);
};
