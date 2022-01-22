import React from "react";
import "./Tab.scss";
import { switchToTab, TabData } from "@store/tabs";
import { DefaultDispatch, RootState } from "@store";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

interface Props {
  tab: TabData;
}

export const Tab = ({ tab }: Props): JSX.Element => {
  const { currentTab } = useSelector(
    ({ tabsReducer: { currentTab } }: RootState) => ({ currentTab })
  );
  const { id, client } = tab;
  const config = client?.config;
  const active = (id && currentTab == id) || (!id && !currentTab);
  const dispatch = useDispatch<DefaultDispatch>();
  return (
    <div
      className={`tab ${active ? "tab-active" : ""}`}
      id={id}
      onClick={() => dispatch(switchToTab(id))}
    >
      {!id ? (
        <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
      ) : (
        <>
          {config.user ? `${config.user}@` : ""}
          {config.host}
        </>
      )}
    </div>
  );
};
