import { ContextMenu } from "@components";
import File from "@components/File/File";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCog, faPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FTPEventDetails, uploadFile } from "@lib";
import { BubbleModel, FileI, FileType, HistoryReq } from "@models";
import { DefaultDispatch, RootState } from "@store";
import { addBubble, setSettings } from "@store/app";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { historyItem } from "@store/lists";
import { hostname } from "os";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./FileManager.scss";
import { uploadFolder } from "@lib";
import fs from "fs";

const mapState = ({
  ftpReducer: { client },
  fmReducer: { menu },
}: RootState) => ({ client, menu });
const mapDispatch = (dispatch: DefaultDispatch) => ({
  historyItem: (req: HistoryReq) => dispatch(historyItem(req)),
  openSettings: () => dispatch(setSettings(true)),
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  pwd: string;
  list: FileI[];
  plusOpen: boolean;
  dragging: boolean;
}

export class FileManagerUI extends Component<Props, State> {
  counter = 0;
  constructor(props: Props) {
    super(props);
    this.state = {
      pwd: "",
      list: [],
      plusOpen: false,
      dragging: false,
    };
    (window as any).refreshFTP = this.onConnected;
  }
  componentDidMount(): void {
    if (this.props.client && !this.props.client?.connected) {
      this.props.client.connect().then(this.onConnected);
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
  onChange = (args: FTPEventDetails): void => {
    this.props.client.pwd().then((pwd) => {
      this.setState({ pwd });
      this.props.client.list().then((list) => {
        list = list.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          if (a.type === FileType.DIR) {
            return -1;
          }
          return 1;
        });
        this.setState({ list });
      });
    });
  };

  onConnected = (): void => {
    this.forceUpdate();
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
        file: undefined,
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
    console.log(JSON.stringify(e.dataTransfer));
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

  onDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    this.counter = 0;
    this.setState({ dragging: false });
    for (const file of event.dataTransfer.files) {
      const p = file.path;

      if (fs.statSync(p).isDirectory()) {
        uploadFolder(this.props.client, [p], this.props.addBubble);
      } else if (fs.statSync(p).isFile()) {
        uploadFile(this.props.client, [p], this.props.addBubble);
      }
    }
  };

  render(): JSX.Element {
    const connected = Boolean(this.props.client?.connected);
    const dotdotExists =
      this.state.list.filter((f) => f.name == "..").length > 0;

    const filtered = this.state.list.filter(
      (f) => !(f.name == ".." || f.name == ".")
    );

    return (
      <div id="file-manager">
        <div id="file-manager-settings">
          <button
            className="connect-settings-btn"
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
          {connected && (
            <>
              <div id="file-manager-pwd">{this.state.pwd}</div>
              <div id="file-manager-files" onContextMenu={this.onContextMenu}>
                <div className="file-wrapper">
                  <div className="file">
                    <div className="file-type"></div>
                    <div className="file-name">Name</div>
                    <div className="file-size">Size</div>
                    <div className="file-last">Last Modified</div>
                  </div>
                </div>
                {this.state.pwd !== "/" && !dotdotExists && (
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
