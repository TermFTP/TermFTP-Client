import { ContextMenu, Terminal, SearchBox, ProgressTracker } from "@components";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowLeft,
  faCog,
  faPlus,
  faSync,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProgressDir, normalizeURL } from "@lib";
import { BubbleModel, HistoryReq } from "@models";
import { FileI, FTPResponse, FTPResponseType, ProgressFileI } from "@models";
import { DefaultDispatch, RootState } from "@store";
import { addBubble, setSettings } from "@store/app";
import {
  addProgressFiles,
  changePathBox,
  clearProgressFiles,
  ContextMenuProps,
  doSearch,
  FMState,
  PathBoxData,
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
import { goBack, replace } from "connected-react-router";
import { Files } from "./Files";
import { clearSelection, FTPState, setFiles } from "@store/ftp";
import { statSync } from "fs";
import { basename } from "path";
import PathBox from "./PathBox";
import { PasteBufferTracker } from "@components/PasteBufferTracker/PasteBufferTracker";
import { switchAndAddTab } from "@store/tabs";

const mapState = ({
  ftpReducer: { client },
  fmReducer: { menu, loading, terminalOpen, terminalHeight, pathBox },
  router: {
    location: { pathname },
  },
  fmReducer,
  ftpReducer,
}: RootState) => ({
  client,
  menu,
  loading,
  pathname,
  terminalOpen,
  terminalHeight,
  pathBox,
  ftpReducer,
  fmReducer,
});

const mapDispatch = (d: DefaultDispatch) => ({
  historyItem: (req: HistoryReq) => d(historyItem(req)),
  openSettings: () => d(setSettings(true)),
  setContextMenu: (contextMenu: ContextMenuProps) =>
    d(setContextMenu(contextMenu)),
  addBubble: (key: string, bubble: BubbleModel) => d(addBubble(key, bubble)),
  setFMLoading: (loading: boolean) => d(setFMLoading(loading)),
  setFiles: (files: FileI[]) => d(setFiles(files)),
  replace: (p: string) => d(replace(p)),
  clearSelection: () => d(clearSelection()),
  doSearch: (search: SearchProps) => d(doSearch(search)),
  updateProgressFile: (file: ProgressFileI) => d(updateProgressFile(file)),
  addProgressFiles: (files: ProgressFileI[]) => d(addProgressFiles(files)),
  goBack: () => d(goBack()),
  clearProgressFiles: () => d(clearProgressFiles()),
  changePathBox: (pathBox: PathBoxData) => d(changePathBox(pathBox)),
  switchAndAddTab: (fm: FMState, ftp: FTPState, path: string) =>
    d(switchAndAddTab(fm, ftp, path)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  dragging: boolean;
}

export class FileManagerUI extends Component<Props, State> {
  counter = 0;
  keyMap = {};
  handlers = {};
  constructor(props: Props) {
    super(props);
    this.state = {
      dragging: false,
    };
    (window as any).refreshFTP = this.onConnected;

    this.keyMap = {
      SEARCH: "ctrl+f",
      RELOAD: "F5",
      PATH: "ctrl+l",
      NEWTAB: "ctrl+t",
    };

    this.handlers = {
      SEARCH: () => {
        this.props.doSearch({ searching: true });
      },
      RELOAD: () => {
        this.props.setFMLoading(true);
        this.props.client.list();
      },
      PATH: () => this.props.changePathBox({ focused: true }),
      NEWTAB: () => {
        // TODO check if this needs to be updated when pathname changes
        this.props.switchAndAddTab(
          this.props.fmReducer,
          this.props.ftpReducer,
          this.props.pathname,
        );
      },
    };
  }
  componentDidMount(): void {
    if (this.props.client) {
      this.props.client.connect(this.onChange);
    }
  }

  async componentDidUpdate(): Promise<void> {
    const url = normalizeURL(this.props.pathname.replace("/file-manager", ""));
    if (!this.props.client) {
      this.props.replace("/main");
      return;
    }
    if (
      this.props.pathBox.pwd !== undefined &&
      this.props.pathBox.pwd != url &&
      url != "/main" &&
      !this.props.loading
    ) {
      this.props.setFMLoading(true);
      await this.props.client.cd(url);
    }
  }

  componentWillUnmount(): void {
    // this.props.client?.disconnect();
    // this.props.client?.removeAllListeners();
    // this.props.setFiles([]);
    this.props.doSearch({ searching: false });
    // this.props.clearProgressFiles();
  }

  // eslint-disable-next-line
  onChange = async (res: FTPResponse): Promise<void> => {
    // const list = await this.props.client.list(undefined);
    switch (res.type) {
      case FTPResponseType.INIT: {
        const pwd = normalizeURL(res.data);
        this.props.replace(`/file-manager${pwd}`);
        this.props.changePathBox({ pwd: "" });
        break;
      }
      case FTPResponseType.LIST: {
        const pwd =
          normalizeURL(res.data.pwd) ||
          normalizeURL(await this.props.client.pwd());
        // this.props.push(`/file-manager${pwd}`);
        this.props.changePathBox({ pwd });
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
        if (!this.props.pathBox.pwd) this.props.replace("/main");
        else this.props.replace(`/file-manager${this.props.pathBox.pwd}`);
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
    if (this.props.menu.isOpen) {
      this.props.setContextMenu({
        isOpen: false,
      });
    } else {
      this.props.setContextMenu({
        x: undefined,
        y: undefined,
        isOpen: true,
      });
    }
  };

  onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    if (!this.props.client?.connected) return;
    e.preventDefault();
    e.stopPropagation();
    this.props.setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
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
    const closest = actual.closest(".file-wrapper");
    if (
      e.dataTransfer.types.includes("app/file-transfer") ||
      (closest && closest.getAttribute("data-dir") === "true")
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

  onFilesClick = (ev: React.MouseEvent<HTMLDivElement>): void => {
    if (!this.props.menu.isOpen) {
      ev.stopPropagation();
      ev.preventDefault();
      this.props.clearSelection();
    }
  };

  render(): JSX.Element {
    const connected = Boolean(this.props.client?.connected);
    const uiStyle: React.CSSProperties = {
      "--terminal": this.props.terminalOpen
        ? `${this.props.terminalHeight}px`
        : undefined,
    } as React.CSSProperties;
    const { isOpen: plusOpen, x, y } = this.props.menu;

    return (
      <div id='file-manager'>
        <SearchBox />
        <div id='file-manager-top'>
          <button
            className='file-manager-btn file-manager-back'
            onClick={() => this.props.goBack()}
          >
            <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
          </button>
          <button
            className='file-manager-btn file-manager-reload'
            onClick={() => this.props.client.list()}
          >
            <FontAwesomeIcon icon={faSync}></FontAwesomeIcon>
          </button>
          <PathBox></PathBox>
          {/* <div id="file-manager-pwd">{this.props.pathBox.pwd}</div> */}
          <button
            className='file-manager-btn'
            onClick={this.props.openSettings}
          >
            <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
          </button>
        </div>
        <div
          id='dragtext'
          className={`${this.state.dragging ? "dragtext-shown" : ""}`}
        >
          <div className='dragtext-icon'>
            <FontAwesomeIcon icon={faUpload}></FontAwesomeIcon>
          </div>
          <div className='dragtext-text'>Drag and drop your files</div>
        </div>
        <div
          id='file-manager-ui'
          onDrop={this.onDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          style={uiStyle}
          onContextMenu={this.onContextMenu}
        >
          <div
            id='file-manager-plus'
            className={`${plusOpen ? "file-manager-plus-opened" : ""} ${
              plusOpen && x && y ? "file-manager-plus-floating" : ""
            }`}
          >
            <button id='file-manager-plus-btn' onClick={this.onPlus}>
              <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
            </button>
            <ContextMenu></ContextMenu>
          </div>
          <HotKeys
            keyMap={this.keyMap}
            handlers={this.handlers}
            // id="file-manager"
          >
            {connected && (
              <>
                <div
                  id='file-manager-files'
                  onClick={this.onFilesClick}
                  tabIndex={0}
                >
                  <Files></Files>

                  {this.props.loading && (
                    <div id='file-manager-loading'>
                      <div>
                        <div className='first'></div>
                        <div className='second'></div>
                        <div className='third'></div>
                        <div className='fourth'></div>
                      </div>
                    </div>
                  )}
                </div>
                <ProgressTracker></ProgressTracker>
                <PasteBufferTracker></PasteBufferTracker>
              </>
            )}
          </HotKeys>
        </div>
        <Terminal></Terminal>
        <div id='file-manager-bottom'>
          <div
            id='file-manager-status'
            className={`file-manager-${
              connected ? "connected" : "disconnected"
            }`}
          >
            <div className='file-manager-connect-icon'>
              <FontAwesomeIcon icon={faCircle}></FontAwesomeIcon>
            </div>
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>
    );
  }
}

export const getFileManagerFilesElement = (): HTMLDivElement | undefined =>
  document.getElementById("file-manager-files") as HTMLDivElement;

export const focusFilesElement = (): void =>
  getFileManagerFilesElement()?.focus();

export const FileManager = connector(FileManagerUI);

export default FileManager;
