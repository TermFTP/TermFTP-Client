import isDev from "electron-is-dev";
import { LoginRes, LoginReq, AuthHeaders, RegisterReq } from "@models";

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
  }

  fetchFromAPI = async (
    url: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body = {}
  ): Promise<any> => {
    let options: any = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (method !== "GET") {
      options = { ...options, body: JSON.stringify(body) };
    }
    return fetch(url, options)
      .then((res) => {
        if (!resWasOk(res, url, body)) {
          console.error(res);
          console.error(`response was bad for ${url}`);
        }
        return res.json();
      })
      .catch((e) => {
        console.error("fetch error for: " + url);
        console.error("exception:" + e);
      });
  };

  register = async (req: RegisterReq): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.fetchFromAPI(`${this.baseURL}/register`, "POST", req)
        .then((data) => {
          if (data) {
            console.log(data);
            resolve(data);
          } else {
            reject({ msg: data.message });
          }
        })
        .catch((err) => {
          reject({ msg: err.message });
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
            console.log(data);
            resolve(data);
          } else {
            reject({ msg: data.message });
          }
        })
        .catch((err) => {
          reject({ msg: err.message });
        });
    });
  };

  private evaluateRes = (res: Response): Promise<any> => {
    try {
      return res.json();
    } catch (err) {
      return new Promise((resolve) => resolve({ msg: "Unknown Error" }));
    }
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
