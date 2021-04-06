import { ContextMenu } from "@components";
import File from "@components/File/File";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import {
  faCog,
  faPlus,
  faSync,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FTPEventDetails } from "@lib";
import { BubbleModel, FileI, FileType, HistoryReq } from "@models";
import { DefaultDispatch, RootState } from "@store";
import { addBubble, setSettings } from "@store/app";
import {
  ContextMenuProps,
  setContextMenu,
  setFMLoading,
} from "@store/filemanager";
import { historyItem } from "@store/lists";
import { hostname } from "os";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./FileManager.scss";
import fs from "fs";
import { HotKeys } from "react-hotkeys";
import { SearchBox } from "@components";
import { push } from "connected-react-router";

const mapState = ({
  ftpReducer: { client },
  fmReducer: { menu, loading },
}: RootState) => ({ client, menu, loading });

const mapDispatch = (dispatch: DefaultDispatch) => ({
  historyItem: (req: HistoryReq) => dispatch(historyItem(req)),
  openSettings: () => dispatch(setSettings(true)),
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
  setFMLoading: (loading: boolean) => dispatch(setFMLoading(loading)),
  push: (path: string) => dispatch(push(path)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  pwd: string;
  list: FileI[];
  plusOpen: boolean;
  dragging: boolean;
  searching: boolean;
}

export class FileManagerUI extends Component<Props, State> {
  counter = 0;
  keyMap = {};
  handlers = {};
  constructor(props: Props) {
    super(props);
    this.state = {
      pwd: "",
      list: [],
      plusOpen: false,
      dragging: false,
      searching: false,
    };
    (window as any).refreshFTP = this.onConnected;

    this.keyMap = {
      SEARCH: "ctrl+f",
      RELOAD: "F5",
    };

    this.handlers = {
      SEARCH: () => {
        this.setState({
          searching: true,
        });
      },
      RELOAD: () => {
        this.onChange();
      },
    };
  }
  componentDidMount(): void {
    if (this.props.client) {
      this.props.client
        .connect()
        .then(this.onConnected)
        .catch((e: Error) => {
          this.props.addBubble("connect-error", {
            title: `failed to connect to ${
              this.props.client.config.host || ""
            }`,
            type: "ERROR",
            message: e.message,
          });
          this.props.push("/main");
        });
      this.props.client.on("ftp-event", this.onChange);
    }
  }

  componentDidUpdate(): void {
    if (this.state.plusOpen != this.props.menu.isOpen) {
      this.setState({ plusOpen: this.props.menu.isOpen });
    }
  }

  componentWillUnmount(): void {
    this.props.client?.disconnect();
  }

  // eslint-disable-next-line
  onChange = async (args?: FTPEventDetails): Promise<void> => {
    // const searchBox = document.getElementById("search-box");
    // if (searchBox) searchBox.getElementsByTagName("input")[0].value = "";
    const pwd = await this.props.client.pwd();
    const list = await this.props.client.list(undefined);
    this.setState({ list, pwd });
    this.props.setFMLoading(false);
  };

  onConnected = (): void => {
    // this.forceUpdate();
    this.props.historyItem({
      ...this.props.client.config,
      device: hostname(),
      ip: this.props.client.config.host,
    });
    this.onChange(undefined);
  };

  onPlus = (): void => {
    if (this.state.plusOpen) {
      this.setState({ plusOpen: false });
      this.props.setContextMenu({
        isOpen: false,
      });
    } else {
      this.setState({ plusOpen: true });
      this.props.setContextMenu({
        file: undefined,
        x: undefined,
        y: undefined,
        isOpen: true,
      });
    }
  };

  onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      file: undefined,
    });
  };

  onDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    this.counter++;
    this.setState({ dragging: true });
  };

  onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    this.counter--;
    if (this.counter <= 0) {
      this.setState({ dragging: false });
      this.counter = 0;
    }
  };

  onDrop = async (event: React.DragEvent<HTMLDivElement>): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
    this.counter = 0;
    this.setState({ dragging: false });
    const files = [];
    const folders = [];
    for (const file of event.dataTransfer.files) {
      const p = file.path;

      if (fs.statSync(p).isDirectory()) {
        folders.push(p);
      } else if (fs.statSync(p).isFile()) {
        files.push(p);
      }
    }
    this.props.client.putFolders(folders);
    this.props.client.putFiles(files);
  };

  onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    //search item and scroll to it and hightlight it?
    const query = event.target.value;

    const highlighted = document.getElementsByClassName("file-highlight");

    const results = document.querySelectorAll(
      `[data-name*="${query.toLowerCase()}"]`
    ) as NodeListOf<HTMLElement>;

    [...highlighted].forEach((hs) => {
      if (
        !hs.getAttribute("data-name").includes(query.toLowerCase()) ||
        query.length == 0
      ) {
        hs.classList.remove("file-highlight");
      }
    });

    if (results.length == 0) return;

    results[0].scrollIntoView(true);
    results.forEach((e) => e.classList.add("file-highlight"));
  };

  render(): JSX.Element {
    const connected = Boolean(this.props.client?.connected);
    const dotdotExists =
      this.state.list.filter((f) => f.name == "..").length > 0;
    const { searching, pwd } = this.state;

    const filtered = this.state.list.filter(
      (f) => !(f.name == ".." || f.name == ".")
    );

    return (
      <div id="file-manager">
        <div id="file-manager-top">
          <button
            className="file-manager-btn file-manager-reload"
            onClick={() => this.onChange()}
          >
            <FontAwesomeIcon icon={faSync}></FontAwesomeIcon>
          </button>
          <div id="file-manager-pwd">{this.state.pwd}</div>
          <button
            className="file-manager-btn"
            onClick={this.props.openSettings}
          >
            <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
          </button>
        </div>
        <div
          id="dragtext"
          className={`${this.state.dragging ? "dragtext-shown" : ""}`}
        >
          <div className="dragtext-icon">
            <FontAwesomeIcon icon={faUpload}></FontAwesomeIcon>
          </div>
          <div className="dragtext-text">Drag and drop your files</div>
        </div>
        <div
          id="file-manager-ui"
          onDrop={this.onDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          <HotKeys
            keyMap={this.keyMap}
            handlers={this.handlers}
            id="file-manager"
          >
            <SearchBox
              onSearch={this.onSearch}
              searching={searching}
              setSearching={(s) => this.setState({ searching: s })}
            />
            {connected && (
              <>
                <div id="file-manager-files" onContextMenu={this.onContextMenu}>
                  <div className="file-wrapper">
                    <div className="file">
                      <div className="file-type"></div>
                      <div className="file-name">Name</div>
                      <div className="file-size">Size</div>
                      <div className="file-last">Last Modified</div>
                    </div>
                  </div>

                  {pwd !== "/" && !dotdotExists && (
                    <File
                      ftp={this.props.client}
                      file={{
                        size: 0,
                        name: "..",
                        type: FileType.DIR,
                        date: undefined,
                      }}
                    ></File>
                  )}

                  {filtered.map((file) => (
                    <File
                      ftp={this.props.client}
                      file={file}
                      key={`${file.type}-${file.name}`}
                    ></File>
                  ))}

                  {this.props.loading && (
                    <div id="file-manager-loading">
                      <div>
                        <div className="first"></div>
                        <div className="second"></div>
                        <div className="third"></div>
                        <div className="fourth"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  id="file-manager-plus"
                  className={`${
                    this.state.plusOpen ? "file-manager-plus-opened" : ""
                  }`}
                >
                  <button id="file-manager-plus-btn" onClick={this.onPlus}>
                    <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                  </button>
                  <ContextMenu></ContextMenu>
                </div>
              </>
            )}
          </HotKeys>
        </div>
        <div id="file-manager-bottom">
          <div
            id="file-manager-status"
            className={`file-manager-${
              connected ? "connected" : "disconnected"
            }`}
          >
            <div className="file-manager-connect-icon">
              <FontAwesomeIcon icon={faCircle}></FontAwesomeIcon>
            </div>
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>
    );
  }
}

export const FileManager = connector(FileManagerUI);

export default FileManager;
