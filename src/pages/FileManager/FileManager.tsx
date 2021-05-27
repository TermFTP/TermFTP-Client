import { ContextMenu, Terminal } from "@components";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import {
  faCog,
  faPlus,
  faSync,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProgressDir, normalizeURL } from "@lib";
import { BubbleModel, HistoryReq } from "@models";
import { FileI, FTPResponse, FTPResponseType, ProgressFileI } from "@shared";
import { DefaultDispatch, RootState } from "@store";
import { addBubble, setSettings } from "@store/app";
import {
  addProgressFiles,
  ContextMenuProps,
  doSearch,
  SearchProps,
  setContextMenu,
  setFMLoading,
  updateProgressFile,
} from "@store/filemanager";
import { historyItem } from "@store/lists";
//eslint-disable-next-line
import { hostname } from "os";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./FileManager.scss";
import fs from "fs";
import { HotKeys } from "react-hotkeys";
import { SearchBox, ProgressTracker } from "@components";
import { push, replace } from "connected-react-router";
import { Files } from "./Files";
import { clearSelection, setFiles } from "@store/ftp";
import { statSync } from "fs";
import { basename } from "path";

const mapState = ({
  ftpReducer: { client },
  fmReducer: { menu, loading, search },
  router: { location },
}: RootState) => ({
  client,
  menu,
  loading,
  location,
  search,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  historyItem: (req: HistoryReq) => dispatch(historyItem(req)),
  openSettings: () => dispatch(setSettings(true)),
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
  setFMLoading: (loading: boolean) => dispatch(setFMLoading(loading)),
  push: (path: string) => dispatch(push(path)),
  setFiles: (files: FileI[]) => dispatch(setFiles(files)),
  replace: (p: string) => dispatch(replace(p)),
  clearSelection: () => dispatch(clearSelection()),
  doSearch: (search: SearchProps) => dispatch(doSearch(search)),
  updateProgressFile: (file: ProgressFileI) =>
    dispatch(updateProgressFile(file)),
  addProgressFiles: (files: ProgressFileI[]) =>
    dispatch(addProgressFiles(files)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  plusOpen: boolean;
  dragging: boolean;
  pwd: string;
}

export class FileManagerUI extends Component<Props, State> {
  counter = 0;
  keyMap = {};
  handlers = {};
  constructor(props: Props) {
    super(props);
    this.state = {
      plusOpen: false,
      dragging: false,
      pwd: undefined,
    };
    (window as any).refreshFTP = this.onConnected;

    this.keyMap = {
      SEARCH: "ctrl+f",
      RELOAD: "F5",
    };

    this.handlers = {
      SEARCH: () => {
        this.props.doSearch({ searching: true });
      },
      RELOAD: () => {
        this.props.setFMLoading(true);
        this.props.client.list();
      },
    };
  }
  componentDidMount(): void {
    if (this.props.client) {
      this.props.client.connect(this.onChange);
      // .catch((e: Error) => {
      //   this.props.addBubble("connect-error", {
      //     title: `failed to connect to ${
      //       this.props.client.config.host || ""
      //     }`,
      //     type: "ERROR",
      //     message: e.message,
      //   });
      //   this.props.push("/main");
      // });
    }
  }

  async componentDidUpdate(): Promise<void> {
    if (this.state.plusOpen != this.props.menu.isOpen) {
      this.setState({ plusOpen: this.props.menu.isOpen });
    }
    const url = normalizeURL(
      window.location.pathname.replace("/file-manager", "")
    );
    if (
      this.state.pwd !== undefined &&
      this.state.pwd != url &&
      url != "/main" &&
      !this.props.loading
    ) {
      this.props.setFMLoading(true);
      await this.props.client.cd(url);
    }
  }

  componentWillUnmount(): void {
    this.props.client?.disconnect();
    // this.props.client?.removeAllListeners();
    this.props.setFiles([]);
    this.props.doSearch({ searching: false });
  }

  // eslint-disable-next-line
  onChange = async (res: FTPResponse): Promise<void> => {
    // const list = await this.props.client.list(undefined);
    switch (res.type) {
      case FTPResponseType.INIT: {
        const pwd = normalizeURL(res.data);
        this.props.replace(`/file-manager${pwd}`);
        this.setState({ pwd: "" });
        break;
      }
      case FTPResponseType.LIST: {
        const pwd =
          normalizeURL(res.data.pwd) ||
          normalizeURL(await this.props.client.pwd());
        // this.props.push(`/file-manager${pwd}`);
        this.setState({ pwd });
        this.props.setFiles(res.data.files);
        this.props.setFMLoading(false);
        break;
      }
      case FTPResponseType.ERROR: {
        this.props.addBubble("ftp-error", {
          title: "Error occured",
          type: "ERROR",
          message: res.data,
        });
        if (!this.state.pwd) this.props.replace("/main");
        else this.props.replace(`/file-manager${this.state.pwd}`);
        this.props.setFMLoading(false);
        break;
      }
      case FTPResponseType.TRANSFER_UPDATE: {
        this.props.updateProgressFile(res.data);
        break;
      }
    }
  };

  onConnected = (): void => {
    // this.forceUpdate();
    // this.props.historyItem({
    //   ...this.props.client.config,
    //   device: hostname(),
    //   ip: this.props.client.config.host,
    // }); // TODO FIX history
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
    const actual = document.elementFromPoint(e.pageX, e.pageY);
    const closest = actual.closest(".file-wrapper");
    if (
      e.dataTransfer.types.includes("app/file-transfer") ||
      (closest && closest.getAttribute("data-dir") === "true")
    ) {
      this.setState({ dragging: false });
      this.counter = 1;
      return;
    }
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    this.counter++;
    this.setState({ dragging: true });
  };

  onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    const actual = document.elementFromPoint(e.pageX, e.pageY);
    const closest = actual.closest(".file-wrapper");
    if (
      e.dataTransfer.types.includes("app/file-transfer") ||
      (closest && closest.getAttribute("data-dir") === "true")
    ) {
      this.counter = 1;
      this.setState({ dragging: false });
      return;
    }
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    this.counter--;
    if (this.counter <= 0) {
      this.setState({ dragging: false });
      this.counter = 0;
    }
  };

  onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    const actual = document.elementFromPoint(e.pageX, e.pageY);
    if (
      e.dataTransfer.types.includes("app/file-transfer") ||
      actual.closest(".file-wrapper")
    ) {
      this.setState({ dragging: false });
      return;
    }
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    this.counter = 0;
    this.setState({ dragging: false });
    const files = [];
    const folders = [];
    for (const file of e.dataTransfer.files) {
      const p = file.path;

      if (fs.statSync(p).isDirectory()) {
        folders.push(p);
      } else if (statSync(p).isFile()) {
        files.push(p);
      }
    }
    const cwd = await this.props.client.pwd();
    const progressFiles: ProgressFileI[] = [];
    for (const path of folders) {
      progressFiles.push(...getProgressDir(cwd, path));
    }
    for (const path of files) {
      const stats = statSync(path);
      progressFiles.push({
        cwd,
        name: basename(path),
        progress: 0,
        progressType: "upload",
        total: stats.size,
      });
    }
    this.props.addProgressFiles(progressFiles);
    this.props.client.putFolders(folders);
    this.props.client.putFiles(files);
  };

  onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value;

    // put matches in store
    // if no matches, show nothing
    // on search-box close: show all again
    this.props.doSearch({ searching: true, query });
  };

  onFilesClick = (ev: React.MouseEvent<HTMLDivElement>): void => {
    if (!this.props.menu.isOpen) {
      ev.stopPropagation();
      ev.preventDefault();
      this.props.clearSelection();
    }
  };

  render(): JSX.Element {
    const connected = Boolean(this.props.client?.connected);

    return (
      <div id="file-manager">
        <SearchBox
          onSearch={this.onSearch}
          searching={this.props.search.searching}
          setSearching={(s) => this.props.doSearch({ searching: s })}
        />
        <div id="file-manager-top">
          <button
            className="file-manager-btn file-manager-reload"
            onClick={() => this.props.client.list()}
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
            // id="file-manager"
          >
            {connected && (
              <>
                <div
                  id="file-manager-files"
                  onContextMenu={this.onContextMenu}
                  onClick={this.onFilesClick}
                >
                  <Files></Files>

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
                <ProgressTracker></ProgressTracker>
              </>
            )}
          </HotKeys>
        </div>
        <Terminal></Terminal>
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
