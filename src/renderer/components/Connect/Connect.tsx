import React, { Component } from "react";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import "./Connect.scss";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lists } from "@components";
import { setPrompt, setSettings } from "@store/app";
import { BaseFTP, FTP, SFTP } from "@lib";
import {
  editServer,
  fetchGroups,
  saveServer,
  changeEditServer,
} from "@store/lists";
import { EditReq, SaveReq, Server } from "@models";
import { ConnectDetails } from "./Lists/ServerItem/ServerItem";
import { PromptProps } from "@components/Prompt/Prompt";
import { FTPState, goToFTPClient, setFTPType } from "@store/ftp";
import { FTPConnectTypes } from "@models";
import { push } from "connected-react-router";
import { switchAndAddTab } from "@store/tabs";
import { FMState } from "@store/filemanager";
import { dialog } from "electron";
import { existsSync, lstatSync, readFileSync } from "fs";
import { homedir } from "os";
import { basename, join } from "path";

type CKey = keyof typeof FTPConnectTypes;

const mapState = ({
  listReducer: { currentlyEdited },
  ftpReducer,
  fmReducer,
  tabsReducer: { currentTab },
}: RootState) => ({
  currentlyEdited,
  currentTab,
  ftpReducer,
  fmReducer,
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
  switchAndAddTab: (fmReducer: FMState, ftpReducer: FTPState) =>
    dispatch(switchAndAddTab(fmReducer, ftpReducer)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  ip: string;
  ftpPort: number;
  sshPort: number;
  username: string;
  password: string;
  canConnect: boolean;
  serverID: string;
  usingKey: boolean;
  key: string;
}

enum Change {
  IP,
  FTPPORT,
  USERNAME,
  PASSWORD,
  SSHPORT,
  KEY,
}

export class ConnectUI extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ip: "",
      ftpPort: 21,
      password: "",
      username: "",
      canConnect: false,
      sshPort: 22,
      serverID: undefined,
      usingKey: false,
      key: "",
    };
  }
  componentDidMount(): void {
    this.props.fetchGroups();
  }

  handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: Change,
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
      case Change.KEY:
        upd = { ...upd, key: event.target.value };
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

  onConnect = (
    e: React.MouseEvent<HTMLInputElement>,
    details: ConnectDetails = undefined,
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    this.doConnect(details);
  };

  doConnect = (details: ConnectDetails = undefined): void => {
    const { username, ip, password, ftpPort, sshPort, key } =
      details || this.state;
    const { ftpType } = details || this.props.ftpReducer;
    const { fmReducer, ftpReducer } = this.props;

    if (!this.props.currentTab)
      this.props.switchAndAddTab(fmReducer, ftpReducer);

    if (ftpType === FTPConnectTypes.FTP) {
      this.props.goToFTP(
        new FTP({
          user: username,
          password,
          host: ip,
          port: ftpPort || 21,
          sshPort: sshPort || 22,
        }),
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
        }),
      );
    } else {
      this.props.goToFTP(
        new SFTP({
          username,
          password,
          host: ip,
          port: sshPort || 22,
          privateKey: key ? readFileSync(key) : undefined,
        }),
      );
    }
  };

  onSave = (): void => {
    const { ip, username, ftpPort, password, sshPort } = this.state;
    const {
      ftpReducer: { ftpType },
    } = this.props;
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
          ftpType, // TODO handle saving a server with private key file
        });
      },
    });
  };

  onFavourite = (): void => {
    const { ip, username, ftpPort, password, sshPort } = this.state;
    const {
      ftpReducer: { ftpType },
    } = this.props;
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

  changeKeyFile = async (): Promise<void> => {
    const home = join(homedir(), ".ssh");
    let res;
    if (existsSync(home) && lstatSync(home).isDirectory()) {
      res = dialog.showOpenDialogSync({
        defaultPath: home,
        properties: ["openFile", "showHiddenFiles"],
      });
    } else {
      res = dialog.showOpenDialogSync({
        defaultPath: undefined,
        properties: ["openFile", "showHiddenFiles"],
      });
    }

    if (!res || res.length == 0) return;
    this.setState({ key: res[0] });
  };

  render(): JSX.Element {
    const {
      handleChange,
      onConnect,
      onSave,
      onFavourite,
      props: {
        currentlyEdited,
        ftpReducer: { ftpType },
      },
      state: {
        ip,
        canConnect,
        password,
        ftpPort,
        sshPort,
        username,
        usingKey,
        key,
      },
    } = this;
    const isEdited = Boolean(currentlyEdited);
    return (
      <div id='connect'>
        {/* SETTINGS */}

        <div className='connect-settings'>
          <button
            className='connect-settings-btn'
            onClick={() => this.props.push("/settings")}
          >
            <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
          </button>
        </div>

        <div className='connect-gui'>
          <div className='connect-list-wrapper'>
            <Lists connect={onConnect}></Lists>
          </div>
          <form
            className={`connect-form ${
              ftpType === FTPConnectTypes.SFTP ? "connect-form-sftp" : ""
            }`}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className='connect-type' data-info='type'>
              {Object.keys(FTPConnectTypes).map((k) => {
                const key = k as CKey;
                return (
                  <label
                    key={key}
                    htmlFor={`t${key}`}
                    data-txt={key}
                    className={
                      key == (ftpType as unknown as CKey)
                        ? "connect-type-chosen"
                        : ""
                    }
                    onClick={() => this.changeFTPType(FTPConnectTypes[key])}
                  >
                    <input type='radio' name='ftptype' id={`t${k}`} />
                    {key}
                  </label>
                );
              })}
            </div>
            <span className='connect-ip' data-info='ip/domain'>
              <input
                type='text'
                placeholder='IP'
                value={ip}
                onChange={(e) => handleChange(e, Change.IP)}
                autoFocus
              />
            </span>
            <div className='connect-ftp-port' data-info='FTP Port'>
              <input
                type='number'
                placeholder='FTP Port'
                value={ftpPort}
                onChange={(e) => handleChange(e, Change.FTPPORT)}
                disabled={ftpType === FTPConnectTypes.SFTP}
              />
            </div>
            <div className='connect-ssh-port' data-info='SSH Port'>
              <input
                type='number'
                value={sshPort}
                onChange={(e) => handleChange(e, Change.SSHPORT)}
                placeholder='SSH Port'
              />
            </div>
            <div className='connect-user' data-info='Username'>
              <input
                type='text'
                placeholder='anonymous'
                value={username}
                onChange={(e) => handleChange(e, Change.USERNAME)}
              />
            </div>
            <div className='connect-pw' data-info='Password'>
              <input
                type='password'
                placeholder={
                  usingKey ? "password for the private key" : "anonymous"
                }
                value={password}
                onChange={(e) => handleChange(e, Change.PASSWORD)}
              />
            </div>
            {ftpType === FTPConnectTypes.SFTP && (
              <div className='connect-key' data-info='Key (optional)'>
                <label>
                  <input
                    type='checkbox'
                    checked={usingKey}
                    onChange={(e) =>
                      this.setState({ usingKey: e.target.checked })
                    }
                  />{" "}
                  Use a private key
                </label>
                {usingKey && (
                  <div className='connect-file-picker'>
                    <button onClick={this.changeKeyFile}>Choose key</button>
                    <span>{basename(key)}</span>
                  </div>
                )}
              </div>
            )}
            <div className='connect-form-btn'>
              {!isEdited && (
                <>
                  <input
                    type='submit'
                    value='Connect'
                    onClick={onConnect}
                    disabled={!canConnect}
                  />
                  <input
                    type='submit'
                    value='Save'
                    onClick={onSave}
                    disabled={!canConnect}
                  />
                  <input
                    type='submit'
                    value='Favourite'
                    onClick={onFavourite}
                    disabled={!canConnect}
                  />
                </>
              )}
              {isEdited && (
                <>
                  <input
                    type='submit'
                    value='Edit'
                    onClick={this.onEdit}
                    disabled={!canConnect}
                  />
                  <input
                    type='submit'
                    value='Cancel'
                    onClick={this.onCancelEdit}
                  />
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export const Connect = connector(ConnectUI);

export default Connect;
