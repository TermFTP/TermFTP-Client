import { Group, GroupReq } from "@models";
import React, { MouseEvent } from "react";
import "./List.scss";
import { faChevronDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ServerItem, { ConnectDetails } from "../ServerItem/ServerItem";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { ReactSortable } from "react-sortablejs";
import { addGroup } from "@store/lists";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt } from "@store/app";

const mapState = ({ listReducer }: RootState) => ({
  ...listReducer,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  addGroup: (group: GroupReq) => dispatch(addGroup(group)),
  setPrompt: (prompt: PromptProps) => dispatch(setPrompt(prompt)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;

type Props = PropsFromState & {
  group: Group;
  connect: (e: MouseEvent<any>, details: ConnectDetails) => void;
  newGroups?: boolean;
  showOnNoItems?: boolean;
  level?: number;
};

function ToggleBtn({
  title,
  add,
}: {
  title: string;
  add?: (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
}): JSX.Element {
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
      <div className="connect-icon">
        <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>
      </div>
      <div className="text">{title}</div>
      {add && (
        <button className="connect-icon" onClick={add}>
          <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
        </button>
      )}
    </div>
  );
}

const ListUI = ({
  group,
  connect,
  newGroups,
  addGroup,
  setPrompt,
  showOnNoItems,
  level,
}: Props) => {
  // this is how it transitions between heights
  const items = (amount: number, groups: number) =>
    ({ "--items": amount, "--groups": groups } as React.CSSProperties);

  function newGroup(
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) {
    e.preventDefault();
    e.stopPropagation();
    setPrompt({
      fieldName: "Group name",
      callback: (val: string) => {
        addGroup({
          name: val,
        });
      },
    });
  }

  return (
    <div
      className={`connect-list ${
        group && (group?.server?.length > 0 || showOnNoItems)
          ? "connect-list-shown"
          : ""
      } ${level ? "connect-list-indented" : ""}`}
      id="connect-groups"
      style={
        {
          ...items(
            group?.server?.length == 0 ? 1 : group?.server?.length,
            group?.serverGroups?.length
          ),
          "--level": level,
        } as React.CSSProperties
      }
    >
      <ToggleBtn
        title={group?.name}
        add={newGroups ? newGroup : undefined}
      ></ToggleBtn>

      <ReactSortable
        list={[
          ...(group?.server?.map((item) => ({ ...item, id: item.serverID })) ||
            []),
          ...(group?.serverGroups?.map((g) => ({ ...g, id: g.groupID })) || []),
        ]}
        setList={(newState, sortable, store) => {
          console.groupCollapsed(`group-${group.groupID}`);
          console.log(newState);
          console.log(sortable);
          console.log(store);
          console.groupEnd();
        }}
        className="list-sortable"
        group={{ name: "connect-lists", pull: true, put: true }}
      >
        {group?.server?.map((s) => (
          <ServerItem
            connect={connect}
            key={s.serverID}
            server={s}
          ></ServerItem>
        ))}
      </ReactSortable>

      {group?.serverGroups?.map((g) => (
        <List
          connect={connect}
          key={g.groupID}
          group={g}
          newGroups={newGroups}
          showOnNoItems={true}
          level={(level || 0) + 1}
        ></List>
      ))}
      {/* {newGroups && (
        <button className="connect-newGroup" onClick={newGroup}>
          <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
          New Group
        </button>
      )} */}
    </div>
  );
};

// eslint-disable-next-line
function getNumOfItems(group: Group): number {
  let sum = 0;
  for (let g of group.serverGroups) {
    // eslint-disable-next-line
    sum += getNumOfItems(g);
  }
  return sum;
}

export const List = connector(ListUI);
export default List;
