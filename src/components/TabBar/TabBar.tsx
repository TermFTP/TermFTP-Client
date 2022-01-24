import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch, RootState } from "@store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab } from "./Tab/Tab";
import "./TabBar.scss";
import { TabData, switchToTab, switchAndAddTab } from "@store/tabs";
import { initialState as fmInitState } from "@store/filemanager";
import { initialState as ftpInitState } from "@store/ftp";

export const homeTab: TabData = {
  id: undefined,
  fmReducer: fmInitState,
  ftpReducer: ftpInitState,
  path: "",
};

export const TabBar = (): JSX.Element => {
  const dispatch = useDispatch<DefaultDispatch>();
  const { tabs, fmReducer, ftpReducer } = useSelector(
    ({ tabsReducer: { tabs }, fmReducer, ftpReducer }: RootState) => ({
      tabs,
      fmReducer,
      ftpReducer,
    })
  );

  const onTabClicked = (tab: TabData) => {
    if (tab.id) dispatch(switchToTab(tab, fmReducer, ftpReducer));
    else dispatch(switchToTab(homeTab, fmReducer, ftpReducer, ""));
  };

  return (
    <div className="tab-bar">
      <Tab tab={homeTab} onClicked={onTabClicked}></Tab>
      {tabs.map((t) => (
        <Tab tab={t} key={t.id} onClicked={onTabClicked}></Tab>
      ))}
      <button
        className="tab-new"
        onClick={() => dispatch(switchAndAddTab(fmReducer, ftpReducer))}
      >
        <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
      </button>
    </div>
  );
};

export default TabBar;
