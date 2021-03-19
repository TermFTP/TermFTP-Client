import { DefaultDispatch, RootState } from "@store";
import React, { MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { List } from "./List/List";
import "./Lists.scss";
import { ConnectDetails } from "./ServerItem/ServerItem";

const mapState = ({ listReducer }: RootState) => ({
  ...listReducer,
});

// eslint-disable-next-line
const mapDispatch = (dispatch: DefaultDispatch) => ({});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState & {
  connect: (e: MouseEvent<any>, details: ConnectDetails) => void;
};

function ListsUI({ groups, history, saved, favourites, connect }: Props) {
  return (
    <div
      id="connect-lists"
      className={`${
        favourites?.server?.length > 0 ||
        saved?.server?.length > 0 ||
        history?.length > 0
          ? ""
          : "connect-lists-hidden"
      }`}
    >
      <List
        connect={connect}
        group={{
          groupID: "aaaa",
          serverGroups: [],
          server: [],
          ...favourites,
          name: "Favourites",
        }}
      ></List>
      <List
        connect={connect}
        group={{
          groupID: "b",
          server: [],
          ...saved,
          name: "Saved",
          serverGroups: groups,
        }}
        newGroups={true}
      ></List>
      <List
        connect={connect}
        group={{
          groupID: "history",
          name: "History",
          server: history,
          serverGroups: [],
        }}
      ></List>
    </div>
  );
}

export const Lists = connector(ListsUI);

export default Lists;
