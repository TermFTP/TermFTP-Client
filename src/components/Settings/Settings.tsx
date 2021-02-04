import React from "react";
import "./Settings.scss";

import { RootState, DefaultDispatch } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { setSettings } from "@store/app";

const mapState = ({ appReducer: { settingsOpen } }: RootState) => ({
  settingsOpen,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  close: () => dispatch(setSettings(false)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function SettingsUI({ settingsOpen, close }: Props): JSX.Element {
  return (
    <div className={`settings-wrapper ${settingsOpen ? "shown" : ""}`}>
      HI Settings
      <button onClick={close}>Close</button>
    </div>
  );
}

export const Settings = connector(SettingsUI);
export default Settings;
