import { DefaultDispatch } from "@store";
import { push } from "connected-react-router";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./Welcome.scss";
import logo from "@images/logo.png";
import { ipcRenderer } from "electron";

const mapState = () => ({});
const mapDispatch = (dispatch: DefaultDispatch) => ({
  pushPath: (path: string) => dispatch(push(path)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function WelcomeUI({ pushPath }: Props) {
  return (
    <div className="welcome-wrapper">
      <img id="welcome-logo" src={logo} alt="TermFTP Logo" />
      <div className="welcome-paths">
        <button onClick={() => pushPath("/login")}>Login</button>
        <button onClick={() => pushPath("/register")}>Register</button>
      </div>
      <button className="welcome-guest">
        Continue as Guest
        {/* TODO also make guest mode */}
      </button>
    </div>
  );
}

export const Welcome = connector(WelcomeUI);

export default Welcome;
