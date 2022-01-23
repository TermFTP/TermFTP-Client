import React from "react";
import "./Tab.scss";
import { TabData } from "@store/tabs";
import { DefaultDispatch, RootState } from "@store";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faTimes } from "@fortawesome/free-solid-svg-icons";
import { normalizeURL } from "@lib";
import { removeTab } from "@store/tabs";

interface Props {
  tab: TabData;
  onClicked: (tab: TabData) => void;
}

export const Tab = ({ tab, onClicked }: Props): JSX.Element => {
  const dispatch = useDispatch<DefaultDispatch>();
  const { currentTab, pathname, client } = useSelector(
    ({
      tabsReducer: { currentTab },
      router: {
        location: { pathname },
      },
      ftpReducer: { client },
    }: RootState) => ({ currentTab, pathname, client })
  );
  const { id, ftpReducer, path } = tab;
  const active = (id && currentTab == id) || (!id && !currentTab);
  const config = active ? client?.config : ftpReducer?.client?.config;
  let content: JSX.Element = <></>;
  console.log(currentTab, path, "conf", config);
  if (id) {
    if (
      active &&
      pathname.startsWith("/file-manager") &&
      normalizeURL(pathname).replace("/file-manager", "") &&
      config
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
    e.preventDefault();
    e.stopPropagation();
    console.log(e);
    if (e.button === 0 && !active) {
      // left-click
      onClicked(tab);
    } else if (e.button === 1) {
      // middle-click
      dispatch(removeTab(tab.id));
    }
  };
  return (
    <div
      className={`tab ${active ? "tab-active" : ""}`}
      id={id}
      onMouseDown={onMouseDown}
    >
      <span className="tab-content">{content}</span>
      {id && (
        <button className="tab-close">
          <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
        </button>
      )}
    </div>
  );
};
