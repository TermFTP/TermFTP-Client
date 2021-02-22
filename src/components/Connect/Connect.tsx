import React, { Component, MouseEvent } from "react";
import { DefaultDispatch } from "@store";
import { connect, ConnectedProps } from "react-redux";
import "./Connect.scss";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lists } from "@components";
import { setPrompt, setSettings } from "@store/app";
import { FTP, validateIP } from "@lib";
import { fetchGroups, saveServer } from "@store/lists";
import { SaveReq } from "@models";
import { ConnectDetails } from "./Lists/ServerItem/ServerItem";
import { PromptProps } from "@components/Prompt/Prompt";
import { goToFTPClient } from "@store/ftp";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  openSettings: () => dispatch(setSettings(true)),
  setPrompt: (prompt: PromptProps) => dispatch(setPrompt(prompt)),
  save: (req: SaveReq) => dispatch(saveServer(req)),
  fetchGroups: () => dispatch(fetchGroups()),
  goToFTP: (client: FTP) => dispatch(goToFTPClient(client)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  mode: boolean;
  ip: string;
  ftpPort: number;
  sshPort: number;
  username: string;
  password: string;
  canConnect: boolean;
  ftp: FTP;
}

enum Change {
  IP,
  FTPPORT,
  USERNAME,
  PASSWORD,
  SSHPORT,
}

export class ConnectUI extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: false,
      ip: "",
      ftpPort: 21,
      password: "",
      username: "",
      canConnect: false,
      ftp: undefined,
      sshPort: 22,
    };
  }
  componentDidMount(): void {
    this.props.fetchGroups();
  }

  handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: Change
  ): void => {
    let upd: State = { ...this.state };
    switch (type) {
      case Change.USERNAME:
        upd = { ...upd, username: event.target.value };
        break;
      case Change.PASSWORD:
        upd = { ...upd, password: event.target.value };
        break;
      case Change.IP:
        upd = { ...upd, ip: event.target.value };
        break;
      case Change.FTPPORT:
        upd = { ...upd, ftpPort: Number(event.target.value) };
        break;
      case Change.SSHPORT:
        upd = { ...upd, sshPort: Number(event.target.value) };
        break;
      default:
        break;
    }

    upd = {
      ...upd,
      canConnect: validateIP(upd.ip) && upd.ftpPort != upd.sshPort,
    };

    this.setState(upd);
  };

  changeMode = (): void => {
    this.setState({ mode: !this.state.mode });
  };

  onConnect = (
    e: MouseEvent<HTMLInputElement>,
    details: ConnectDetails = undefined
  ): void => {
    const { username, ip, password, ftpPort, sshPort } = details || this.state;
    this.props.goToFTP(
      new FTP({
        user: username,
        password,
        debug: console.log,
        host: ip,
        port: ftpPort || 21,
        sshPort: sshPort || 22,
      })
    );
  };

  onSave = (): void => {
    const { ip, username, ftpPort, password, sshPort } = this.state;
    this.props.setPrompt({
      fieldName: "Server Name",
      callback: (value: string) => {
        this.props.setPrompt(undefined);
        this.props.save({
          ip,
          username,
          password,
          ftpPort,
          sshPort,
          name: value,
        });
      },
    });
  };

  onFavourite = (): void => {
    console.log("favourite");
  };

  render(): JSX.Element {
    const {
      changeMode,
      handleChange,
      onConnect,
      onSave,
      onFavourite,
      props: { openSettings },
      state: { ip, canConnect, password, mode, ftpPort, sshPort, username },
    } = this;
    return (
      <div id="connect">
        <div className="connect-settings">
          <button
            className={`connect-switch ${mode ? "switched" : ""}`}
            onClick={changeMode}
          >
            <span>GUI</span>
            <span>CLI</span>
          </button>
          <button className="connect-settings-btn" onClick={openSettings}>
            <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
          </button>
        </div>
        <div className="connect-gui">
          <div className="connect-list-wrapper">
            <Lists connect={onConnect}></Lists>
          </div>
          <form className="connect-form" onSubmit={(e) => e.preventDefault()}>
            <span className="connect-ip" data-info="ip">
              <input
                type="text"
                placeholder="IP"
                value={ip}
                onChange={(e) => handleChange(e, Change.IP)}
              />
            </span>
            <div className="connect-ftp-port" data-info="FTP Port">
              <input
                type="number"
                placeholder="FTP Port"
                value={ftpPort}
                onChange={(e) => handleChange(e, Change.FTPPORT)}
              />
            </div>
            <div className="connect-ssh-port" data-info="SSH Port">
              <input
                type="number"
                value={sshPort}
                onChange={(e) => handleChange(e, Change.SSHPORT)}
                placeholder="SSH Port"
              />
            </div>
            <div className="connect-user" data-info="Username">
              <input
                type="text"
                placeholder="anonymous"
                value={username}
                onChange={(e) => handleChange(e, Change.USERNAME)}
              />
            </div>
            <div className="connect-pw" data-info="Password">
              <input
                type="text"
                placeholder="anonymous"
                value={password}
                onChange={(e) => handleChange(e, Change.PASSWORD)}
              />
            </div>
            <div className="connect-form-btn">
              <input
                type="submit"
                value="Connect"
                onClick={onConnect}
                disabled={!canConnect}
              />
              <input
                type="submit"
                value="Save"
                onClick={onSave}
                disabled={!canConnect}
              />
              <input
                type="submit"
                value="Favourite"
                onClick={onFavourite}
                disabled={!canConnect}
              />
            </div>
          </form>
        </div>
        <div className="connect-cli"></div>
      </div>
    );
  }
}

export const Connect = connector(ConnectUI);

export default Connect;
