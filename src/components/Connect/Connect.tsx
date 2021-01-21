import React, { Component, MouseEvent } from "react";
import { DefaultDispatch } from "@store";
import { connect, ConnectedProps } from "react-redux";
import "./Connect.scss";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lists } from "@components";
import { openSettings } from "@store/app";
import { FTP, validateIP } from "@lib";
import { save } from "@store/lists";
import { SaveReq } from "@models";
import { ConnectDetails } from "./Lists/ServerItem/ServerItem";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  openSettings: () => dispatch(openSettings()),
  save: (req: SaveReq) => dispatch(save(req)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  mode: boolean;
  ip: string;
  port: number;
  username: string;
  password: string;
  canConnect: boolean;
  ftp: FTP;
}

enum Change {
  IP,
  PORT,
  USERNAME,
  PASSWORD,
}

export class ConnectUI extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: false,
      ip: "",
      port: 21,
      password: "",
      username: "",
      canConnect: false,
      ftp: undefined,
    };
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
      case Change.PORT:
        upd = { ...upd, port: Number(event.target.value) };
        break;
      default:
        break;
    }

    upd = { ...upd, canConnect: validateIP(upd.ip) };

    this.setState(upd);
  };

  changeMode = (): void => {
    this.setState({ mode: !this.state.mode });
  };

  onConnect = (
    e: MouseEvent<HTMLInputElement>,
    details: ConnectDetails = undefined
  ): void => {
    const { username, ip, password, port } = details || this.state;
    this.setState({
      ftp: new FTP({
        user: username,
        password: password,
        debug: console.log,
        host: ip,
        port: port || 21,
      }),
    });
  };

  onSave = (): void => {
    this.props.save({
      IP: "asdhjashjkd",
      serverID: "asdas",
      name: "asdhjkashjk",
    } as SaveReq);
    console.log("ashjdkhjas");
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
      state: { ip: IP, canConnect, password, mode, port, username },
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
            <input
              type="text"
              placeholder="IP"
              className="connect-ip"
              value={IP}
              onChange={(e) => handleChange(e, Change.IP)}
            />
            <input
              type="number"
              placeholder="Port"
              className="connect-port"
              value={port}
              onChange={(e) => handleChange(e, Change.PORT)}
            />
            <input
              type="text"
              placeholder="anonymous"
              className="connect-user"
              value={username}
              onChange={(e) => handleChange(e, Change.USERNAME)}
            />
            <input
              type="text"
              placeholder="anonymous"
              className="connect-pw"
              value={password}
              onChange={(e) => handleChange(e, Change.PASSWORD)}
            />
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
