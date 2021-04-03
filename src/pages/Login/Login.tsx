import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch } from "@store";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./Login.scss";
import { push } from "connected-react-router";
import { IPCEncryptRequest } from "@shared/models";

import { ipcRenderer } from "electron";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  register: () => dispatch(push("/register")),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  username: string;
  password: string;
  canRegister: boolean;
}

enum Change {
  USERNAME,
  PASSWORD,
}

class LoginUI extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      canRegister: false,
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

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.state.canRegister) return;

    const {
      state: { username, password },
    } = this;
    ipcRenderer.send("encrypt", {
      caller: "login",
      password,
      username,
    } as IPCEncryptRequest);
  }

  render() {
    const { canRegister, password, username } = this.state;
    return (
      <div id="login-wrapper">
        <h1>Login</h1>
        <div id="login-box">
          <form onSubmit={this.handleSubmit}>
            <label>
              Username/Email:
              <input
                type="text"
                name="username"
                placeholder="bob"
                value={username}
                onChange={(e) => this.handleChange(e, Change.USERNAME)}
              />
            </label>
            <label htmlFor="password">
              Password:
              <input
                type="password"
                name="password"
                value={password}
                placeholder="********"
                onChange={(e) => this.handleChange(e, Change.PASSWORD)}
              />
            </label>
            <input type="submit" value="Login" disabled={!canRegister} />
          </form>
        </div>
        <div id="register-hint">
          Don&apos;t have an account?{" "}
          <button onClick={this.props.register}>Register</button>
        </div>
        <button id="login-browser">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          Open in Browser
        </button>
      </div>
    );
  }
}

export const Login = connector(LoginUI);

export default Login;
