import React, { useState } from "react";
import "./Settings.scss";

import { RootState, DefaultDispatch } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { setSettings } from "@store/app";
import { logout } from "@store/user";
import { ipcRenderer } from "electron";
import { IPCDeleteKeyRequest } from "@shared";
import { goBack, push } from "connected-react-router";
import { faArrowLeft, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Endpoints } from "@lib";

const mapState = ({ appReducer: { settingsOpen } }: RootState) => ({
  settingsOpen,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  close: () => dispatch(setSettings(false)),
  logout: () => dispatch(logout()),
  push: (route: string) => dispatch(push(route)),
  goBack: () => dispatch(goBack()),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function SettingsUI({ push, logout, goBack }: Props): JSX.Element {
  const [base, setBase] = useState(Endpoints.base);
  const [apiURL, setApiURL] = useState(Endpoints.apiURL);

  return (
    <div className={`settings-wrapper`}>
      <div className="settings-header">
        <button className="settings-btn settings-back" onClick={() => goBack()}>
          <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
        </button>
        <h1>Settings</h1>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <h3>Logout of your account</h3>
          <div className="settings-section-content">
            {/* Log out here: */}
            <button
              onClick={() => {
                logout();
                ipcRenderer.invoke("logout", {
                  caller: "login",
                  key: "auto-login",
                } as IPCDeleteKeyRequest);
                push("/");
              }}
              className="navBtn"
            >
              <FontAwesomeIcon icon={faSignOutAlt}></FontAwesomeIcon>
              Logout
            </button>
          </div>
        </div>
        <div className="settings-section">
          <h3>Endpoints base</h3>
          <div className="settings-section-content">
            Change your Endpoints base (example: http://localhost:8000)
            <input
              type="text"
              value={base}
              placeholder="http://localhost:8000"
              onChange={(e) => setBase(e.target.value)}
            />
            <button
              onClick={() => {
                Endpoints.base = base;
                setBase(Endpoints.base);
              }}
              className="navBtn"
            >
              Change
            </button>
          </div>
        </div>
        <div className="settings-section">
          <h3>Endpoints api URL</h3>
          <div className="settings-section-content">
            Change your Endpoints api URL (example: /api/v1)
            <input
              type="text"
              value={apiURL}
              placeholder="http://localhost:8000"
              onChange={(e) => setApiURL(e.target.value)}
            />
            <button
              onClick={() => {
                Endpoints.apiURL = apiURL;
                setApiURL(Endpoints.apiURL);
              }}
              className="navBtn"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Settings = connector(SettingsUI);
export default Settings;
