import Connect from "@components/Connect/Connect";
import { Server } from "@models";
import React, { MouseEvent } from "react";
import "./ServerItem.scss";

export interface ConnectDetails {
  username: string;
  ip: string;
  port: number;
  password: string;
}

interface Props {
  server: Server;
  connect: (e: MouseEvent<any>, details: ConnectDetails) => void;
}

export function ServerItem({ server, connect }: Props) {
  return (
    <div
      className="connect-server"
      onClick={(e) =>
        connect(e, { ...server, port: server.ftpPort } as ConnectDetails)
      }
    >
      {server.ip} {server.name}
      <div className="connect-server-hover"></div>
    </div>
  );
}

export default ServerItem;
