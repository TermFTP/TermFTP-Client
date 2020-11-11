import React from "react";
import "./Header.scss";
import { remote } from "electron";
import {
  faArrowLeft,
  faHome,
  faTimes,
  faWindowMinimize,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowMaximize } from "@fortawesome/free-regular-svg-icons";
import isDev from "electron-is-dev";

export function Header() {
  const id = process.platform === "darwin" ? "darwin" : "";

  return (
    <div id="headerBar">
      <div id="headerResizableTop" className="headerDragPadder"></div>
      <div id="headerMain">
        <div className="headerResizableVert headerDragPadder"></div>

        <div className="headerContent" id={id}>
          <div id="headerTitle">
            {id === "" && <span id="headerTitleText">TermFTP</span>}
            {/* {(isDev || user) && (
              <button
                onClick={() => {
                  back();
                }}
                className="navBtn"
              >
                <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
              </button>
            )} */}
            {/* {(isDev || user) && (
              <>
              <button
                onClick={() => {
                  push("/");
                }}
                className="navBtn"
              >
                <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
              </button>
              <button
                onClick={() =>{
                  push("/downloads");
                }}
                className="navBtn"
              >
                <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
              </button>
              </>
            )} */}
          </div>
          <div className="headerDock">
            <GetWindowControls id={id}></GetWindowControls>
          </div>
        </div>

        <div className="headerResizableVert headerDragPadder"></div>
      </div>
    </div>
  );
}

const GetWindowControls = ({ id }: { id: "darwin" | "" }) => {
  function closeWindow() {
    const window = remote.getCurrentWindow();
    window.close();
  }

  function resizeWindow() {
    const window = remote.getCurrentWindow();
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }

  function minimizeWindow() {
    const window = remote.getCurrentWindow();
    window.minimize();
  }
  if (id === "darwin") {
    return (
      <>
        <button
          className="headerButton"
          id="close"
          tabIndex={-1}
          onClick={closeWindow}
        ></button>
        <button
          className="headerButton"
          id="minimize"
          tabIndex={-1}
          onClick={minimizeWindow}
        ></button>
        <button
          className="headerButton"
          id="resize"
          tabIndex={-1}
          onClick={resizeWindow}
        ></button>
      </>
    );
  }

  return (
    <>
      <button
        className="headerButton btM"
        id="fb_minimize"
        tabIndex={-1}
        onClick={minimizeWindow}
      >
        <FontAwesomeIcon icon={faWindowMinimize} />
      </button>
      <button
        className="headerButton btR"
        id="fb_resize"
        tabIndex={-1}
        onClick={resizeWindow}
      >
        <FontAwesomeIcon icon={faWindowMaximize} />
      </button>
      <button
        className="headerButton btC"
        id="fb_close"
        tabIndex={-1}
        onClick={closeWindow}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </>
  );
};

// export const Header = connector(HeaderUI);

export default Header;
