import React from "react";
import "./Tab.scss";
import { startToMoveTab, TabData, closeTab } from "@store/tabs";
import { DefaultDispatch, RootState } from "@store";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faTimes } from "@fortawesome/free-solid-svg-icons";

interface Props {
  tab: TabData;
  onClicked: (tab: TabData) => void;
  onTabDropped?: (clientX: number) => void;
}

export const Tab = ({ tab, onClicked, onTabDropped }: Props): JSX.Element => {
  const dispatch = useDispatch<DefaultDispatch>();
  const { currentTab, pathname, client } = useSelector(
    ({
      tabsReducer: { currentTab },
      router: { location },
      ftpReducer: { client },
    }: RootState) => ({
      currentTab,
      pathname: location.pathname || "",
      client,
    }),
  );
  const { id, ftpReducer, path } = tab;
  const active = (id && currentTab == id) || (!id && !currentTab);
  const usedClient = active ? client : ftpReducer?.client;
  const config = usedClient?.config;
  let content: JSX.Element = <></>;
  if (id) {
    if (
      active &&
      pathname.startsWith("/file-manager") &&
      usedClient?.connected
    ) {
      content = (
        <>
          {config.user ? `${config.user}@` : ""}
          {config.host}
        </>
      );
    } else if (path !== "" && config) {
      content = (
        <>
          {config.user ? `${config.user}@` : ""}
          {config.host}
        </>
      );
    } else {
      content = <>Connect</>;
    }
  } else {
    content = <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>;
  }
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      // middle-click
      dispatch(closeTab(tab));
    }
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 && !active) {
      // left-click
      onClicked(tab);
    }
  };

  function onDragStart(e: React.DragEvent<HTMLDivElement>) {
    // e.stopPropagation();
    // e.preventDefault();
    e.dataTransfer.setData("text/html", null);
    if (!id) return;
    dispatch(
      startToMoveTab({
        tab: tab.id,
        x: e.clientX,
      }),
    );
  }

  function onDragEnd(e: React.DragEvent) {
    if (!id) return;
    dispatch(
      startToMoveTab({
        tab: tab.id,
        x: e.clientX,
      }),
    );
    onTabDropped(e.clientX);
  }

  return (
    <div
      className={`tab ${active ? "tab-active" : ""}`}
      id={id}
      onMouseDown={onMouseDown}
      draggable={true}
      onDragStart={onDragStart}
      onDrag={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <span className='tab-content'>{content}</span>
      {id && (
        <button className='tab-close' onClick={() => dispatch(closeTab(tab))}>
          <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
        </button>
      )}
    </div>
  );
};
