import { Connect } from "@components";
import React from "react";
import "./Main.scss";

function MainUI(): JSX.Element {
  return (
    <div id='main'>
      {/* <div id="main-tabs">TabsTODO hidden if empty etc.</div> */}
      <div id='main-content'>
        <Connect></Connect>
        {/* Settings */}
      </div>
    </div>
  );
}

export const Main = MainUI;

export default Main;
