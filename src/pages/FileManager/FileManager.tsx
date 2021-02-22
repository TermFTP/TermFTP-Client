import { Settings } from "@components";
import { HistoryReq } from "@models";
import { DefaultDispatch, RootState } from "@store";
import { historyItem } from "@store/lists";
import { push } from "connected-react-router";
import { hostname } from "os";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./FileManager.scss";

const mapState = ({ ftpReducer: { client } }: RootState) => ({ client });
const mapDispatch = (dispatch: DefaultDispatch) => ({
  historyItem: (req: HistoryReq) => dispatch(historyItem(req)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export class FileManagerUI extends Component<Props> {
  componentDidMount(): void {
    console.log(this.props);
    if (!this.props.client?.connected) {
      this.props.client.connect().then(
        (() => {
          console.log(this.props.client);
          this.forceUpdate();
          this.props.historyItem({
            ...this.props.client.config,
            device: hostname(),
            ip: this.props.client.config.host,
          });
        }).bind(this)
      );
    }
  }

  render(): JSX.Element {
    return (
      <div id="file-manager-wrapper">
        <Settings></Settings>
        {this.props.client?.connected && (
          <div id="file-manager-files">We are connected!</div>
        )}
      </div>
    );
  }
}

export const FileManager = connector(FileManagerUI);

export default FileManager;
