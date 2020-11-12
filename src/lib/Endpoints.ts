import isDev from "electron-is-dev";
import { LoginRes, LoginReq, AuthHeaders } from "@models";

/**
 * the class for communication with the backend API
 */
export class Endpoints {
  baseURL = isDev ? "http://localhost:1337/api" : "TO BE DETERMINED";
  headers: AuthHeaders;
  private static _instance: Endpoints;

  /**
   * gets the singleton instance for the Endpoints class
   */
  static getInstance() {
    if (!this._instance) this._instance = new Endpoints();

    return this._instance;
  }

  private constructor() {
    const userID = sessionStorage.getItem("User-ID");
    const sessionToken = sessionStorage.getItem("Session-Token");
    if (userID && sessionToken) {
      this.headers = {
        "Session-Token": sessionToken,
        "User-ID": userID,
      };
    }
    window.addEventListener("storage", () => {
      const userID = sessionStorage.getItem("User-ID");
      const sessionToken = sessionStorage.getItem("Session-Token");
      if (userID && sessionToken) {
        this.headers = {
          "Session-Token": sessionToken,
          "User-ID": userID,
        };
      }
    });
  }

  /**
   * logs you in with a specific id token
   * @param idToken the id token to be used for logging in
   */
  login = async (idToken: string): Promise<LoginRes> => {
    return new Promise((resolve, reject) => {
      fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        } as LoginReq),
      })
        .then((res) => {
          if (!res.ok) {
            reject(this.evaluateRes(res));
            return;
          }
          resolve(res.json());
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
