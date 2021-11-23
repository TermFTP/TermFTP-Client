import { DefaultDispatch, RootState } from "@store";
import { setOkbar } from "@store/app";
import React, { createRef } from "react";
import { connect, ConnectedProps } from "react-redux";
import { goToFTPClient } from "@store/ftp";
import { BaseFTP, FTP, SFTP, parseCommand } from "@lib";
import { ConnectDetails } from "../Connect/Lists/ServerItem/ServerItem";
import { FTPConnectTypes } from "@shared";
import "./Okbar.scss";

const mapState = ({ appReducer: { okbar } }: RootState) => ({ okbar });

const mapDispatch = (dispatch: DefaultDispatch) => ({
  setOkbar: (okbar: OkbarProps) => dispatch(setOkbar(okbar)),
  goToFTP: (client: BaseFTP) => dispatch(goToFTPClient(client)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export interface OkbarProps {
  shown: boolean;
}

interface State {
  value: string;
  cmdHistory: string[];
  cmdHistoryIndex: number;
}

class OkbarUI extends React.Component<Props, State> {
  input = createRef<HTMLInputElement>();
  constructor(props: Props) {
    super(props);
    this.state = {
      value: "",
      cmdHistory: [],
      cmdHistoryIndex: 0,
    };
  }

  componentDidMount() {
    document.removeEventListener("keyup", this.keyUp);
    document.addEventListener("keyup", this.keyUp);
    return () => document.removeEventListener("keyup", this.keyUp);
  }

  keyUp = (e: KeyboardEvent): void => {
    if(e.ctrlKey && e.key === "k") {
      e?.preventDefault();
      e?.stopPropagation();
      this.props.setOkbar({shown: true});
    }
  }

  componentDidUpdate() {
    const { okbar } = this.props;
    okbar && this.input.current?.focus();
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      value: event.target.value,
    });
  };

  onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      this.props.setOkbar(undefined);
    }

    const elem = e.target as HTMLInputElement;

    if(e.key === "ArrowUp") {
      e.preventDefault();
      
      const itemId = this.state.cmdHistoryIndex + 1;
      if(this.state.cmdHistory[this.state.cmdHistory.length - itemId]) {
        (document.getElementById("krasse-cli") as HTMLInputElement).value = this.state.cmdHistory[this.state.cmdHistory.length - itemId];
        this.setState({cmdHistoryIndex: itemId});
      }

    } else if(e.key === "ArrowDown") {
      e.preventDefault();

      const itemId = this.state.cmdHistoryIndex - 1;
      if(this.state.cmdHistory[this.state.cmdHistory.length - itemId]) {
        (document.getElementById("krasse-cli") as HTMLInputElement).value = this.state.cmdHistory[this.state.cmdHistory.length - itemId];
        this.setState({cmdHistoryIndex: itemId});
      }

    } else if(e.key === "Enter") {
      this.props.setOkbar(undefined);
      const cmd = elem.value.split(" ")[0];
      const args = elem.value.split(" ").slice(1);
      console.log(cmd, args)

      try {
        const result = parseCommand(cmd, args);

        this.setState({ cmdHistory: [...this.state.cmdHistory, elem.value] });
        console.log("works")
        this.doConnect(result.data);
        
      } catch(e) {/**/}
    }
  };

  doConnect = (details: ConnectDetails = undefined) => {
    const { username, ip, password, ftpPort, sshPort } = details;
    const { ftpType } = details;
    if (ftpType === FTPConnectTypes.FTP) {
      this.props.goToFTP(
        new FTP({
          user: username,
          password,
          host: ip,
          port: ftpPort || 21,
          sshPort: sshPort || 22,
        })
      );
    } else if (ftpType === FTPConnectTypes.FTPS) {
      this.props.goToFTP(
        new FTP({
          user: username,
          password,
          host: ip,
          port: ftpPort || 21,
          sshPort: sshPort || 22,
          secure: true,
        })
      );
    } else {
      this.props.goToFTP(
        new SFTP({
          username,
          password,
          host: ip,
          port: sshPort || 22,
        })
      );
    }
  };

  render() {
    const {
      state: { value },
      props: { okbar, setOkbar },
    } = this;

    return (
      <div className={`okbar-wrapper ${okbar ? "shown" : ""}`}>
        <div
          className="okbar-background"
          onClick={() => setOkbar(undefined)}
        ></div>
        <div className="okbar">
          <input
            type="text"
            placeholder="Enter Command"
            ref={this.input}
            onChange={this.onChange}
            value={value}
            onKeyUp={this.onKeyUp}
          />
        </div>
      </div>
    );
  }
}

export const Okbar = connector(OkbarUI);
export default Okbar;
