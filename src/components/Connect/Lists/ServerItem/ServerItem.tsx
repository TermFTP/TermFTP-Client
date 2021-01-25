import Connect from "@components/Connect/Connect";
import { Server } from "@models";
import React, { MouseEvent } from "react";
import "./ServerItem.scss";

export interface ConnectDetails {
  username: string;
  ip: string;
  ftpPort: number;
  password: string;
  sshPort: number;
}

interface Props {
  server: Server;
  connect: (e: MouseEvent<any>, details: ConnectDetails) => void;
}

export function ServerItem({ server, connect }: Props) {
  return (
    <div className="connect-server">
      <div
        className="connect-hover"
        onClick={(e) =>
          connect(e, { ...server, ftpPort: server.ftpPort } as ConnectDetails)
        }
      >
        {server.name || server.ip}
      </div>
      <div className="connect-server-details">
        <div className="ip">{server.ip}</div>
        <div className="ftp-port">{server.ftpPort}</div>
        <div className="ssh-port">{server.sshPort}</div>
        <div className="username">{server.username}</div>
        <div className="last-connection">
          {server.lastConnection?.toDateString() || server.when?.toDateString()}
        </div>
      </div>
    </div>
  );
}

export default ServerItem;
