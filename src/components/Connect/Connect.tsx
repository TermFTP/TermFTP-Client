import React, { Component } from "react";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import "./Connect.scss";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lists } from "@components";
import { setPrompt, setSettings } from "@store/app";
import { BaseFTP, FTP, SFTP, parseCommand } from "@lib";
import {
  editServer,
  fetchGroups,
  saveServer,
  changeEditServer,
} from "@store/lists";
import { EditReq, SaveReq, Server } from "@models";
import { ConnectDetails } from "./Lists/ServerItem/ServerItem";
import { PromptProps } from "@components/Prompt/Prompt";
import { goToFTPClient, setFTPType } from "@store/ftp";
import { FTPConnectTypes } from "@shared";
import { push } from "connected-react-router";
import internal from "stream";

type CKey = keyof typeof FTPConnectTypes;

const mapState = ({
  listReducer: { currentlyEdited },
  ftpReducer: { ftpType },
}: RootState) => ({
  currentlyEdited,
  ftpType,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  openSettings: () => dispatch(setSettings(true)),
  setPrompt: (prompt: PromptProps) => dispatch(setPrompt(prompt)),
  save: (req: SaveReq) => dispatch(saveServer(req)),
  fetchGroups: () => dispatch(fetchGroups()),
  goToFTP: (client: BaseFTP) => dispatch(goToFTPClient(client)),
  edit: (server: EditReq) => dispatch(editServer(server)),
  changeEditServer: (server: Server) => dispatch(changeEditServer(server)),
  setFTPType: (type: FTPConnectTypes) => dispatch(setFTPType(type)),
  push: (route: string) => dispatch(push(route)),
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
  serverID: string;
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
      sshPort: 22,
      serverID: undefined,
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
      canConnect: upd.ftpPort != upd.sshPort && upd.ip.length > 0,
    };

    this.setState(upd);
  };

  changeMode = (): void => {
    this.setState({ mode: !this.state.mode });
  };

  onConnect = (
    e: React.MouseEvent<HTMLInputElement>,
    details: ConnectDetails = undefined
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    this.doConnect(details);
  };

  doConnect = (details: ConnectDetails = undefined): void => {
    const { username, ip, password, ftpPort, sshPort } = details || this.state;
    const { ftpType } = details || this.props;
    if (ftpType === FTPConnectTypes.FTP) {
      this.props.goToFTP(
        new FTP({
          user: username,
          password,
          host: ip,
          port: ftpPort || 21,
          sshPort: sshPort || 22,
        })
      );
    } else if (ftpType === FTPConnectTypes.FTPS) {
      this.props.goToFTP(
        new FTP({
          user: username,
          password,
          host: ip,
          port: ftpPort || 21,
          sshPort: sshPort || 22,
          secure: true,
        })
      );
    } else {
      this.props.goToFTP(
        new SFTP({
          username,
          password,
          host: ip,
          port: sshPort || 22,
        })
      );
    }
  }

  onSave = (): void => {
    const { ip, username, ftpPort, password, sshPort } = this.state;
    const { ftpType } = this.props;
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
          ftpType,
        });
      },
    });
  };

  onFavourite = (): void => {
    const { ip, username, ftpPort, password, sshPort } = this.state;
    const { ftpType } = this.props;
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
          ftpType,
        });
      },
    });
  };

  onEdit = (): void => {
    this.props.setPrompt({
      fieldName: "Server Name",
      initial: this.props.currentlyEdited.name,
      callback: (value: string) => {
        this.props.setPrompt(undefined);

        this.props.edit({
          ...this.state,
          name: value,
        });
      },
    });
  };

  onCancelEdit = (): void => {
    this.props.changeEditServer(undefined);
    this.setState({
      ip: "",
      ftpPort: 21,
      password: "",
      username: "",
      canConnect: false,
      sshPort: 22,
      serverID: undefined,
    });
  };

  componentDidUpdate(): void {
    const { currentlyEdited } = this.props;
    if (currentlyEdited && currentlyEdited.serverID !== this.state.serverID) {
      const { ftpPort, ip, password, sshPort, username, serverID } =
        currentlyEdited;
      this.setState({
        canConnect: true,
        ftpPort,
        ip,
        password,
        sshPort,
        username,
        serverID,
      });
    } else if (!currentlyEdited && this.state.serverID) {
      this.setState({ serverID: undefined });
    }
  }

  changeFTPType = (type: FTPConnectTypes): void => {
    this.props.setFTPType(type);
  };

  render(): JSX.Element {
    const {
      changeMode,
      handleChange,
      onConnect,
      onSave,
      onFavourite,
      props: { currentlyEdited },
      state: { ip, canConnect, password, mode, ftpPort, sshPort, username },
    } = this;
    const isEdited = Boolean(currentlyEdited);
    return (
      <div id="connect">
        {/* SETTINGS */}

        <div className="connect-settings">
          <button
            className={`connect-switch ${mode ? "switched" : ""}`}
            onClick={changeMode}
          >
            <span>GUI</span>
            <span>CLI</span>
          </button>
          <button
            className="connect-settings-btn"
            onClick={() => this.props.push("/settings")}
          >
            <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
          </button>
        </div>

        {/* GUI */}

        {!this.state.mode && (
          <div className="connect-gui">
            <div className="connect-list-wrapper">
              <Lists connect={onConnect}></Lists>
            </div>
            <form
              className={`connect-form ${
                this.props.ftpType === FTPConnectTypes.SFTP
                  ? "connect-form-sftp"
                  : ""
              }`}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="connect-type" data-info="type">
                {Object.keys(FTPConnectTypes).map((k) => {
                  const key = k as CKey;
                  return (
                    <label
                      key={key}
                      htmlFor={`t${key}`}
                      data-txt={key}
                      className={
                        key == (this.props.ftpType as unknown as CKey)
                          ? "connect-type-chosen"
                          : ""
                      }
                      onClick={() => this.changeFTPType(FTPConnectTypes[key])}
                    >
                      <input type="radio" name="ftptype" id={`t${k}`} />
                      {key}
                    </label>
                  );
                })}
              </div>
              <span className="connect-ip" data-info="ip/domain">
                <input
                  type="text"
                  placeholder="IP"
                  value={ip}
                  onChange={(e) => handleChange(e, Change.IP)}
                  autoFocus
                />
              </span>
              <div className="connect-ftp-port" data-info="FTP Port">
                <input
                  type="number"
                  placeholder="FTP Port"
                  value={ftpPort}
                  onChange={(e) => handleChange(e, Change.FTPPORT)}
                  disabled={this.props.ftpType === FTPConnectTypes.SFTP}
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
                  type="password"
                  placeholder="anonymous"
                  value={password}
                  onChange={(e) => handleChange(e, Change.PASSWORD)}
                />
              </div>
              <div className="connect-form-btn">
                {!isEdited && (
                  <>
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
                  </>
                )}
                {isEdited && (
                  <>
                    <input
                      type="submit"
                      value="Edit"
                      onClick={this.onEdit}
                      disabled={!canConnect}
                    />
                    <input
                      type="submit"
                      value="Cancel"
                      onClick={this.onCancelEdit}
                    />
                  </>
                )}
              </div>
            </form>
          </div>
        )}

        {/* CLI */}
        {this.state.mode && (
          <div className="connect-cli">
            <input id="krasse-cli" className="krasse-cli" onKeyUp={this.executeCommand}/>
          </div>
        )}
      </div>
    );
  }
}

export const Connect = connector(ConnectUI);

export default Connect;
