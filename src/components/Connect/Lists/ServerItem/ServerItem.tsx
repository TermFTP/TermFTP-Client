import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Server } from "@models";
import { FTPConnectTypes } from "@shared";
import { DefaultDispatch } from "@store";
import { changeEditServer } from "@store/lists";
import React, { MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./ServerItem.scss";

const mapState = () => ({});
const mapDispatch = (dispatch: DefaultDispatch) => ({
  changeEditServer: (server: Server) => dispatch(changeEditServer(server)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState & {
  server: Server;
  connect: (e: MouseEvent<any>, details: ConnectDetails) => void;
};

export interface ConnectDetails {
  username: string;
  ip: string;
  ftpPort: number;
  password: string;
  sshPort: number;
  ftpType: FTPConnectTypes;
  key?: string;
}

export function ServerItemUI({
  server,
  connect,
  changeEditServer,
}: Props): JSX.Element {
  function onEdit(
    event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ): void {
    event.preventDefault();
    event.stopPropagation();
    changeEditServer(server);
  }
  return (
    <div className="connect-server">
      <div className="connect-hover" onClick={(e) => connect(e, server)}>
        {server.name || server.ip}
        <button className="connect-server-edit" onClick={onEdit}>
          <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
        </button>
      </div>
      <div className="connect-server-details">
        <div className="ip">{server.ip}</div>
        <div className="ftp-port">{server.ftpPort}</div>
        <div className="ssh-port">{server.sshPort}</div>
        <div className="username">{server.username}</div>
        <div className="last-connection">
          {server.lastConnection?.toDateString() || server.when?.toDateString()}
        </div>
        <div className="ftp-type">{server.ftpType}</div>
      </div>
    </div>
  );
}

export const ServerItem = connector(ServerItemUI);
export default ServerItem;
