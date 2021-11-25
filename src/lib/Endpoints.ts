import {
	LoginRes,
	LoginReq,
	AuthHeaders,
	RegisterReq,
	DefaultResponse,
	RegisterRes,
	HistoryReq,
	SaveRes,
	SaveReq,
	EditReq,
	HistoryItemRes,
	GroupsRes,
	GroupReq,
	GroupRes,
	RemoveFromGroupReq,
	RemoveGroupReq,
	RemoveServerReq,
} from "@models";
import { hostname } from "os";
import { IRawParams } from "@shared/models";
import { normalizeURL } from "./util";
import { isDev } from "@shared";

/**
 * the class for communication with the backend API
 */
export class Endpoints implements IRawParams {
	[k: string]: any;

	// static baseURL = isDev ? "http://localhost:8080/api/v1" : "http://localhost:8080/api/v1"; // TODO get domain and server
	private static _base = isDev ? "http://localhost:8080" : "http://localhost:8080";
	private static _apiURL = "/api/v1";
	headers: AuthHeaders = {};
	private static _instance: Endpoints;

	/**
	 * gets the singleton instance for the Endpoints class
	 */
	static getInstance(): Endpoints {
		if (!this._instance) this._instance = new Endpoints();

		return this._instance;
	}

	static get baseURL(): string {
		return `${this._base}${this._apiURL}`;
	}

	static get base(): string {
		return this._base;
	}
	static set base(b: string) {
		this._base = b;
	}

	static get apiURL(): string {
		return this._apiURL;
	}
	static set apiURL(a: string) {
		this._apiURL = normalizeURL(a);
	}


	get baseURL(): string {
		return Endpoints.baseURL;
	}

	private constructor() {
		console.log("Created Endpoints object");
		if (!isDev) {
			Endpoints.base = localStorage.getItem("base") || Endpoints.base;
			Endpoints.apiURL = localStorage.getItem("apiURL") || Endpoints.apiURL;
			localStorage.setItem("base", Endpoints.base);
			localStorage.setItem("apiURL", Endpoints.apiURL);
		}
		if (isDev)
			// so that you can you can recreate the instance when hot reloading
			(window as any).reCreateEndpoints = this.reCreateInstance;
	}

	reCreateInstance(): void {
		if (window.process.env.NODE_ENV === "development") {
			Endpoints._instance = new Endpoints();
		}
	}

	fetchFromAPI = async (
		url: string,
		method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
		body = {}
	): Promise<any> => {
		let options: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				...this.headers,
				"PC-Name": hostname(),
			},
		};
		if (method !== "GET") {
			options = { ...options, body: JSON.stringify(body) };
		}
		return new Promise((resolve, reject) => {
			fetch(url, options)
				.then((res) => {
					if (!resWasOk(res, url, body)) {
						// console.error(res);
						// console.error(`response was bad for ${url}`);
						// maybe add some other error handling here
					}
					return res.json();
				})
				.then((json) => {
					const ok = isJsonOk(json);
					if (!ok) {
						reject(json);
						return;
					}
					return json;
				})
				.then((data) => {
					if (data && !data.error) {
						// console.log(data);
						resolve(data);
					} else {
						reject(data);
					}
				})
				.catch((e) => {
					console.error("fetch error for: " + url);
					console.error("exception: " + e);
					reject({
						...e,
						title: "Connection fail",
						message: "could not connect to server",
					});
				});
		});
	};

	register = async (req: RegisterReq): Promise<RegisterRes> => {
		return this.fetchFromAPI(`${this.baseURL}/register`, "POST", req);
	};

	/**
	 * logs you in with the request body
	 * @param req the request body
	 */
	login = async (req: LoginReq): Promise<LoginRes> => {
		return this.fetchFromAPI(`${this.baseURL}/login`, "POST", req);
	};

	historyItem = async (req: HistoryReq): Promise<HistoryItemRes> => {
		return this.fetchFromAPI(`${this.baseURL}/connection`, "POST", req);
	};

	saveServer = async (req: SaveReq): Promise<SaveRes> => {
		return this.fetchFromAPI(`${this.baseURL}/createServer`, "POST", req);
	};

	editServer = async (req: EditReq): Promise<SaveRes> => {
		return this.fetchFromAPI(`${this.baseURL}/updateServer`, "PUT", req);
	};

	setAuthHeaders = (headers: AuthHeaders): void => {
		this.headers = headers;
	};

	fetchGroups = (): Promise<GroupsRes> => {
		return this.fetchFromAPI(`${this.baseURL}/serverGroups`);
	};

	group = (req: GroupReq): Promise<GroupRes> => {
		return this.fetchFromAPI(`${this.baseURL}/group`, "POST", req);
	};

	removeServerFromGroup(req: RemoveFromGroupReq): Promise<void> {
		return this.fetchFromAPI(
			`${this.baseURL}/removeServerFromGroup?groupID=${req.groupID}&serverID=${req.serverID}`,
			"DELETE"
		);
	}

	removeGroup(req: RemoveGroupReq): Promise<void> {
		return this.fetchFromAPI(`${this.baseURL}/removeGroup`, "DELETE", req);
	}

	removeServer(req: RemoveServerReq): Promise<void> {
		return this.fetchFromAPI(`${this.baseURL}/removeServer`, "DELETE", req);
	}
}

/**
 * returns true if the response was ok and false if the response was bad
 * @param {Response} res the response to handle
 * @param {string} url the url that was requested
 * @param {string} body the body that was sent with it
 */
export function resWasOk(res: Response, url: string, body = {}): boolean {
	if (!res.ok) {
		console.error(
			`response was bad for ${url.replace(Endpoints.baseURL, "")}`
		);
		console.error("request body", JSON.stringify(body));
	}
	return res.ok;
}

export function isJsonOk(json: DefaultResponse): boolean {
	return !(
		Math.floor(json.status / 100) === 4 || Math.floor(json.status / 100) === 5
	);
}
