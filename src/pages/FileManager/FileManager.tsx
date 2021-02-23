import File from "@components/File/File";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
}

export class FileManagerUI extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pwd: "",
      list: [],
    };
    (window as any).refreshFTP = this.onConnected;
  }
  componentDidMount(): void {
    if (!this.props.client?.connected) {
      this.props.client.connect().then(this.onConnected);
    }
  }

  componentWillUnmount(): void {
    this.props.client?.disconnect();
  }

  onConnected = (): void => {
    this.forceUpdate();
    this.props.historyItem({
      ...this.props.client.config,
      device: hostname(),
      ip: this.props.client.config.host,
    });
    this.props.client.pwd().then((pwd) => {
      this.setState({ pwd });
    });
    this.props.client.list(undefined).then((list) => {
      console.log("before", list);
      list = list.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        if (a.type === "d") {
          return -1;
        }
        return 1;
      });
      console.log("after", list);
      this.setState({ list });
    });
  };

  render(): JSX.Element {
    const connected = Boolean(this.props.client?.connected);
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
                {this.state.list.map((file) => (
                  <File file={file} key={`${file.type}-${file.name}`}></File>
                ))}
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
