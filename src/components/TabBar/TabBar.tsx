import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch, RootState } from "@store";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab } from "./Tab/Tab";
import "./TabBar.scss";
import {
  TabData,
  switchToTab,
  switchAndAddTab,
  changeTabPosition,
} from "@store/tabs";
import { initialState as fmInitState } from "@store/filemanager";
import { initialState as ftpInitState } from "@store/ftp";

export const homeTab: TabData = {
  id: undefined,
  fmReducer: fmInitState,
  ftpReducer: ftpInitState,
  path: "",
};

export const TabBar = (): JSX.Element => {
  const [highlighted, setHightlighted] = useState(-1);
  const hintsRef = useRef<Array<HTMLDivElement | null>>([]);
  const dispatch = useDispatch<DefaultDispatch>();
  const { tabs, fmReducer, ftpReducer, tabToMove } = useSelector(
    ({
      tabsReducer: { tabs, tabToMove },
      fmReducer,
      ftpReducer,
    }: RootState) => ({
      tabs,
      fmReducer,
      ftpReducer,
      tabToMove,
    })
  );

  const onTabClicked = (tab: TabData) => {
    if (tab.id) dispatch(switchToTab(tab, fmReducer, ftpReducer));
    else dispatch(switchToTab(homeTab, fmReducer, ftpReducer, ""));
  };

  useEffect(() => {
    hintsRef.current = hintsRef.current.slice(0, tabs.length);
  }, [tabs.length]);

  const findCurrHighlight = (overrideX?: number): number => {
    let { x } = tabToMove;
    x = overrideX || x;
    let currentMinDistI = -1;
    let currentMinDist = -1;
    hintsRef.current.forEach((e, i) => {
      const { left } = e.getBoundingClientRect();
      const minDist = Math.abs(left - x);
      if (minDist < currentMinDist || currentMinDistI === -1) {
        currentMinDist = minDist;
        currentMinDistI = i;
      }
    });
    setHightlighted(currentMinDistI);
    return currentMinDistI;
  };

  useEffect(() => {
    if (!tabToMove || !(hintsRef.current?.length > 0)) {
      setHightlighted(-1);
      return;
    }
    findCurrHighlight();
  }, [tabToMove, hintsRef.current.length]);

  const onTabDropped = (clientX: number) => {
    if (highlighted == -1) return;
    dispatch(changeTabPosition(tabToMove.tab, findCurrHighlight(clientX)));
    setHightlighted(-1);
  };

  return (
    <div className="tab-bar">
      <Tab tab={homeTab} onClicked={onTabClicked}></Tab>
      {tabs.map((t, i) => (
        <>
          <div
            className={`tab-hint ${i === highlighted ? "tab-hint-active" : ""}`}
            ref={(r) => (hintsRef.current[i] = r)}
            key={`hint-${t.id}`}
          ></div>
          <Tab
            tab={t}
            key={t.id}
            onClicked={onTabClicked}
            onTabDropped={onTabDropped}
          ></Tab>
          {i === tabs.length - 1 && (
            <div
              className={`tab-hint ${
                i + 1 === highlighted ? "tab-hint-active" : ""
              }`}
              ref={(r) => (hintsRef.current[i + 1] = r)}
              key={`hint-${t.id + 1}`}
            ></div>
          )}
        </>
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
