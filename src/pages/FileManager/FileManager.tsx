import File from "@components/File/File";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCog, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FTPEventDetails } from "@lib";
import { HistoryReq } from "@models";
import { DefaultDispatch, RootState } from "@store";
import { setSettings } from "@store/app";
import { historyItem } from "@store/lists";
import Client from "ftp";
import { hostname } from "os";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./FileManager.scss";

const mapState = ({ ftpReducer: { client } }: RootState) => ({ client });
const mapDispatch = (dispatch: DefaultDispatch) => ({
  historyItem: (req: HistoryReq) => dispatch(historyItem(req)),
  openSettings: () => dispatch(setSettings(true)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  pwd: string;
  list: Client.ListingElement[];
  plusOpen: boolean;
}

export class FileManagerUI extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pwd: "",
      list: [],
      plusOpen: false,
    };
    (window as any).refreshFTP = this.onConnected;
  }
  componentDidMount(): void {
    if (!this.props.client?.connected) {
      this.props.client.connect().then(this.onConnected);
      this.props.client.on("ftp-event", this.onChange);
    }
  }

  componentWillUnmount(): void {
    this.props.client?.disconnect();
  }

  onChange = (args: FTPEventDetails): void => {
    this.props.client.pwd().then((pwd) => {
      this.setState({ pwd });
    });
    this.props.client.list(undefined).then((list) => {
      list = list.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        if (a.type === "d") {
          return -1;
        }
        return 1;
      });
      this.setState({ list });
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
    } else {
      // document.addEventListener("click", this.handleOuterPlusClick);
      this.setState({ plusOpen: true });
    }
  };

  handleOuterPlusClick = (t: Document, ev: MouseEvent): any => {
    console.log("handling");
  };

  render(): JSX.Element {
    const connected = Boolean(this.props.client?.connected);
    console.log("list", this.state.list);
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
        <div id="file-manager-ui">
          {connected && (
            <>
              <div id="file-manager-pwd">{this.state.pwd}</div>
              <div id="file-manager-files">
                <div className="file">
                  <div className="file-type">Type</div>
                  <div className="file-name">Name</div>
                  <div className="file-size">Size</div>
                  <div className="file-last">Last Modified</div>
                </div>
				{this.state.pwd !== "/" && <File ftp={this.props.client} file={{size: 0, name: "..", type: "d", date: new Date()}}></File>}
                {this.state.list.map((file) => (
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
                <div id="file-manager-context-menu">
                  <button>Create folder</button>
                  <button>Upload files</button>
                  <button>Upload folder(s)</button>
                </div>
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
