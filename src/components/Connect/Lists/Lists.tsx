import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch, RootState } from "@store";
import React, { MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./Lists.scss";
import ServerItem, { ConnectDetails } from "./ServerItem/ServerItem";

const mapState = ({ listReducer }: RootState) => ({
  ...listReducer,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState & {
  connect: (e: MouseEvent<any>, details: ConnectDetails) => void;
};

function ToggleBtn({ title }: { title: string }): JSX.Element {
  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    const parent = event.currentTarget.parentElement;
    if (parent.classList.contains("toggled")) {
      parent.classList.remove("toggled");
    } else {
      parent.classList.add("toggled");
    }
  }

  return (
    <div className="connect-list-toggle" onClick={onClick}>
      <div>
        <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>
      </div>
      {title}
    </div>
  );
}

function ListsUI({ groups, history, saved, favourites, connect }: Props) {
  // this is how it transitions between heights
  const items = (amount: number) =>
    ({ "--items": amount } as React.CSSProperties);
  return (
    <div
      id="connect-lists"
      className={`${
        favourites?.server?.length > 0 ||
        saved?.length > 0 ||
        history?.length > length
          ? ""
          : "connect-lists-hidden"
      }`}
    >
      <div
        className={`connect-list ${
          favourites && favourites?.server?.length > 0
            ? "connect-list-shown"
            : ""
        }`}
        id="connect-fav"
        style={items(favourites?.server?.length)}
      >
        <ToggleBtn title="Favourites"></ToggleBtn>
        {favourites?.server.map((s) => (
          <ServerItem
            connect={connect}
            key={s.serverID}
            server={s}
          ></ServerItem>
        ))}
      </div>
      <div
        className={`connect-list ${
          saved && saved?.length > 0 ? "connect-list-shown" : ""
        }`}
        id="connect-groups"
        style={items(saved?.length)}
      >
        <ToggleBtn title="Saved"></ToggleBtn>
        {saved?.map((s) => (
          <ServerItem
            connect={connect}
            key={s.serverID}
            server={s}
          ></ServerItem>
        ))}
      </div>
      <div
        className={`connect-list ${
          history && history?.length > 0 ? "connect-list-shown" : ""
        }`}
        id="connect-history"
        style={items(history?.length)}
      >
        <ToggleBtn title="History"></ToggleBtn>
        {history?.map((s) => (
          <ServerItem
            connect={connect}
            key={s.serverID}
            server={s}
          ></ServerItem>
        ))}
      </div>
    </div>
  );
}

export const Lists = connector(ListsUI);

export default Lists;
