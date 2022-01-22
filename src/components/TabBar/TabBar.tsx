import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch, RootState } from "@store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab } from "./Tab/Tab";
import "./TabBar.scss";

export const TabBar = (): JSX.Element => {
  const dispatch = useDispatch<DefaultDispatch>();
  const { tabs } = useSelector(({ tabsReducer: { tabs } }: RootState) => ({
    tabs,
  }));

  return (
    <div className="tab-bar">
      <Tab tab={{ client: null, id: undefined }}></Tab>
      {tabs.map((t) => (
        <Tab tab={t} key={t.id}></Tab>
      ))}
      <button className="tab-new">
        <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
      </button>
    </div>
  );
};

export default TabBar;
