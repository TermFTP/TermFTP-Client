import isDev from "electron-is-dev";
import {
  LoginRes,
  LoginReq,
  AuthHeaders,
  RegisterReq,
  DefaultResponse,
} from "@models";

/**
 * the class for communication with the backend API
 */
export class Endpoints {
  baseURL = isDev ? "http://localhost:8080/api/v1" : "TO BE DETERMINED";
  headers: AuthHeaders;
  private static _instance: Endpoints;

  /**
   * gets the singleton instance for the Endpoints class
   */
  static getInstance(): Endpoints {
    if (!this._instance) this._instance = new Endpoints();

    return this._instance;
  }

  static getBase(): string {
    return this.getInstance().baseURL;
  }

  private constructor() {
    console.log("Created Endpoints object");
    if (window.process.env.NODE_ENV === "development")
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
    method: "GET" | "POST" | "PUT" = "GET",
    body = {}
  ): Promise<any> => {
    let options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
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
          }
          resolve(json);
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

  register = async (req: RegisterReq): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.fetchFromAPI(`${this.baseURL}/register`, "POST", req)
        .then((data) => {
          if (data && !data.error) {
            // console.log(data);
            resolve(data);
          } else {
            reject(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  /**
   * logs you in with a specific id token
   * @param idToken the id token to be used for logging in
   */
  login = async (req: LoginReq): Promise<LoginRes> => {
    return new Promise((resolve, reject) => {
      this.fetchFromAPI(`${this.baseURL}/login`, "POST", req)
        .then((data) => {
          if (data && !data.error) {
            resolve(data);
          } else {
            reject(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
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
      `response was bad for ${url.replace(Endpoints.getBase(), "")}`
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
