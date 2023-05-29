import { faCog, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch } from "@store";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./Login.scss";
import { push } from "connected-react-router";
import {
  IPCEncryptReply,
  IPCEncryptRequest,
  IPCSaveKeyReply,
  IPCSaveKeyRequest,
} from "@models";

import { ipcRenderer } from "electron";
import { BubbleModel } from "@models";
import { addBubble } from "@store/app";
import { login } from "@store/user";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  register: () => dispatch(push("/register")),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
  login: (username: string, pw: string) => dispatch(login(username, pw)),
  push: (path: string) => dispatch(push(path)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  username: string;
  password: string;
  autoLogin: boolean;
  canRegister: boolean;
}

enum Change {
  USERNAME,
  PASSWORD,
  AUTOLOGIN,
}

class LoginUI extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      canRegister: false,
      autoLogin: true,
      username: "",
      password: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>, type: Change): void {
    let upd: State = { ...this.state };
    switch (type) {
      case Change.USERNAME:
        upd = { ...upd, username: event.target.value };
        break;
      case Change.PASSWORD:
        upd = { ...upd, password: event.target.value };
        break;
      case Change.AUTOLOGIN:
        upd = { ...upd, autoLogin: event.target.checked };
        break;
      default:
        break;
    }

    if (upd.username && upd.password.length >= 8) {
      upd = { ...upd, canRegister: true };
    } else {
      upd = { ...upd, canRegister: false };
    }

    this.setState(upd);
  }

  async handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.state.canRegister) return;

    const {
      state: { username, password, autoLogin },
      props: { login, addBubble },
    } = this;
    const res: IPCEncryptReply = await ipcRenderer.invoke("encrypt", {
      caller: "login",
      password,
      username,
      autoLogin,
    } as IPCEncryptRequest);
    const [master, , user] = res;
    const autoSave: IPCSaveKeyReply = await ipcRenderer.invoke("save-key", {
      caller: "login",
      key: "auto-login",
      value: `${autoLogin}`,
    } as IPCSaveKeyRequest);
    if (!autoSave.result) {
      addBubble("autoLogin-error", {
        title: "Could not save auto-login information",
        type: "ERROR",
        message: autoSave.err.message,
      });
      return;
    }

    if (autoLogin) {
      const res = await ipcRenderer.invoke("save-key", {
        caller: "login",
        key: "username:masterpw",
        value: `${username}:${master}`,
      } as IPCSaveKeyRequest);
      if (!res.result) {
        addBubble("login-save-error", {
          title: "Could not save auto-login data",
          type: "ERROR",
          message: res.err.message,
        });
        return;
      }
    }
    login(user, master);
  }

  render() {
    const { canRegister, password, username, autoLogin } = this.state;
    return (
      <div id='login-wrapper'>
        <h1>Login</h1>
        <div id='login-box'>
          <form onSubmit={this.handleSubmit}>
            <label>
              Username/Email:
              <input
                type='text'
                name='username'
                placeholder='bob'
                value={username}
                onChange={(e) => this.handleChange(e, Change.USERNAME)}
                autoFocus
              />
            </label>
            <label htmlFor='password'>
              Password:
              <input
                type='password'
                name='password'
                value={password}
                placeholder='********'
                onChange={(e) => this.handleChange(e, Change.PASSWORD)}
              />
            </label>
            <label htmlFor='auto-login' id='auto-login-label'>
              <input
                type='checkbox'
                name='auto-login'
                id='auto-login'
                onChange={(e) => this.handleChange(e, Change.AUTOLOGIN)}
                checked={autoLogin}
              />
              Enable auto-login
            </label>
            <input type='submit' value='Login' disabled={!canRegister} />
          </form>
        </div>
        <div id='register-hint'>
          Don&apos;t have an account?{" "}
          <button onClick={this.props.register}>Register</button>
        </div>
        <button id='login-browser'>
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          Login in Browser
        </button>
        <button
          className='global-settings-btn'
          onClick={() => this.props.push("/settings")}
        >
          <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
        </button>
      </div>
    );
  }
}

export const Login = connector(LoginUI);

export default Login;
