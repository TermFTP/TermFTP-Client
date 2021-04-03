import React from "react";

import "./Register.scss";
import { DefaultDispatch } from "@store";
import { ConnectedProps, connect } from "react-redux";

import { validateEmail } from "@lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { push } from "connected-react-router";
import { IPCEncryptRequest } from "@shared/models";

import { ipcRenderer } from "electron";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  login: () => dispatch(push("login")),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  tos: boolean;
  canRegister: boolean;
}

enum Change {
  EMAIL,
  USERNAME,
  PASSWORD,
  CONFIRMPASS,
  TOS,
}

class RegisterUI extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      tos: false,
      canRegister: false,
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
      case Change.EMAIL:
        upd = { ...upd, email: event.target.value };
        break;
      case Change.PASSWORD:
        upd = { ...upd, password: event.target.value };
        break;
      case Change.CONFIRMPASS:
        upd = { ...upd, confirmPassword: event.target.value };
        break;
      case Change.TOS:
        upd = { ...upd, tos: event.target.checked };
        break;
      default:
        break;
    }

    if (
      upd.username &&
      validateEmail(upd.email) &&
      upd.password.length >= 8 &&
      upd.confirmPassword.length >= 8 &&
      upd.password.normalize() === upd.confirmPassword.normalize() && // this is for graphemes like ê (but im not sure if we will include them in our password (probably not))
      upd.tos
    ) {
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
      state: { email, username, password },
    } = this;
    ipcRenderer.send("encrypt", {
      caller: "register",
      password,
      username,
      email,
    } as IPCEncryptRequest);
  }

  openInBrowser() {
    // TODO implement this
    return;
  }

  render() {
    const {
      email,
      username,
      password,
      confirmPassword,
      tos,
      canRegister,
    } = this.state;

    const { handleChange, handleSubmit } = this;

    return (
      <div id="register-wrapper">
        <h1>Register</h1>
        <div id="register-box">
          <form onSubmit={handleSubmit}>
            <label>
              E-Mail:
              <input
                type="email"
                placeholder="bob@example.com"
                onChange={(e) => handleChange(e, Change.EMAIL)}
                value={email}
              />
            </label>
            <label>
              Username:
              <input
                type="text"
                placeholder="bob"
                onChange={(e) => handleChange(e, Change.USERNAME)}
                value={username}
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                onChange={(e) => handleChange(e, Change.PASSWORD)}
                value={password}
              />
            </label>
            <label>
              Confirm Password:
              <input
                type="password"
                onChange={(e) => handleChange(e, Change.CONFIRMPASS)}
                value={confirmPassword}
              />
            </label>
            <label id="register-ticks">
              <input
                id="register-terms-tick"
                type="checkbox"
                checked={tos}
                onChange={(e) => handleChange(e, Change.TOS)}
              />
              <p>
                {/* TODO make terms of service */}I have read and agree to the{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                >
                  Terms of Service
                </a>{" "}
                agreement.
              </p>
            </label>
            <input type="submit" value="Register" disabled={!canRegister} />
          </form>
        </div>
        <div id="login-hint">
          Already have an account?{" "}
          <button onClick={this.props.login}>Login</button>
        </div>
        <button id="register-browser">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          Open in Browser
        </button>
      </div>
    );
  }
}

export const Register = connector(RegisterUI);

export default Register;
