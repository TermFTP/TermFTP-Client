import { DefaultDispatch, RootState } from "@store";
import { setOkbar } from "@store/app";
import React, { createRef } from "react";
import { connect, ConnectedProps } from "react-redux";
import { goToFTPClient } from "@store/ftp";
import { BaseFTP, FTP, SFTP, parseCommand, matchCommand } from "@lib";
import { ConnectDetails } from "../Connect/Lists/ServerItem/ServerItem";
import { FTPConnectTypes } from "@shared";
import "./Okbar.scss";
import { Command, CommandAction } from "@models";
import Match from "./Match";

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
  matches: CommandAction[];
  selectionIndex: number;
  autofill: CommandAction;
  autofillIndex: number;
  autofillHighlight: boolean;
}

class OkbarUI extends React.Component<Props, State> {
  input = createRef<HTMLInputElement>();
  constructor(props: Props) {
    super(props);
    this.state = {
      value: "",
      cmdHistory: [],
      cmdHistoryIndex: 0,
      matches: [],
      selectionIndex: 0,
      autofill: null,
      autofillIndex: 0,
      autofillHighlight: true,
    };
  }

  componentDidMount() {
    document.removeEventListener("keyup", this.keyUp);
    document.addEventListener("keyup", this.keyUp);
    document.removeEventListener("keydown", this.keyDown);
    document.addEventListener("keydown", this.keyDown);
    return () => {
      document.removeEventListener("keyup", this.keyUp);
      document.removeEventListener("keydown", this.keyDown);
    };
  }

  keyUp = (e: KeyboardEvent): void => {
    if(e.ctrlKey && e.key === "k") {
      e?.preventDefault();
      e?.stopPropagation();
      this.props.setOkbar({shown: true});
      this.setState({matches: [], selectionIndex: 0, autofill: null, autofillIndex: 0, autofillHighlight: true})
    }
  }

  keyDown = (e: KeyboardEvent): void => {
    if(e.key === "Tab") {
      if(this.state.autofill) {
        e.preventDefault(); 
        e.stopPropagation();
        this.setState({autofillIndex: this.state.autofillIndex+1, autofillHighlight: true, value: this.state.value+" "})
      }
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
      e.stopPropagation();

      if(this.state.matches) {
        const selectId = this.state.selectionIndex > 1 ? this.state.selectionIndex-1 : 0;
        this.setState({selectionIndex: selectId});
        return;
      }
      
      const itemId = this.state.cmdHistoryIndex + 1;
      if(this.state.cmdHistory[this.state.cmdHistory.length - itemId]) {
        (document.getElementById("krasse-cli") as HTMLInputElement).value = this.state.cmdHistory[this.state.cmdHistory.length - itemId];
        this.setState({cmdHistoryIndex: itemId});
      }

    } else if(e.key === "ArrowDown") {
      e.preventDefault();

      if(this.state.matches) {
        const selectId = this.state.selectionIndex < this.state.matches.length ? this.state.selectionIndex+1 : this.state.matches.length;
        this.setState({selectionIndex: selectId});
        return;
      }

      const itemId = this.state.cmdHistoryIndex - 1;
      if(this.state.cmdHistory[this.state.cmdHistory.length - itemId]) {
        (document.getElementById("krasse-cli") as HTMLInputElement).value = this.state.cmdHistory[this.state.cmdHistory.length - itemId];
        this.setState({cmdHistoryIndex: itemId});
      }

    } else if(e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      if(this.state.selectionIndex !== 0) {

        this.setState({value: this.state.matches[this.state.selectionIndex-1].description[0] + " ", 
                      autofill: {...this.state.matches[this.state.selectionIndex-1]}, selectionIndex: 0});

        return;
      }

      this.props.setOkbar(undefined);
      const cmd = elem.value.split(" ")[0];
      const args = elem.value.split(" ").slice(1);

      try {
        const result = parseCommand(cmd, args);

        this.setState({ cmdHistory: [...this.state.cmdHistory, elem.value] });
        switch (result.command) {
          case Command.CONNECT:
            this.doConnect(result.data);
            break;
          case Command.DISCONNECT:
            //TODO
            break;
          //TODO
        }
        
      } catch(e) {/**/}
    } else {

      if(this.state.autofill) {
        if(e.key === " ")
          this.setState({autofillIndex: this.state.autofillIndex+1, autofillHighlight: true})
        else if(e.key !== "Tab")
          this.setState({autofillHighlight: false})
        
        return;
      }

      const cmd = elem.value.split(" ")[0];
      
      const matches = matchCommand(cmd);
      this.setState({ matches });
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
            autoComplete="off"
            type="text"
            placeholder="Enter Command"
            ref={this.input}
            onChange={this.onChange}
            value={value}
            onKeyUp={this.onKeyUp}
            onFocus={ () => this.input.current.select()}
          />
          {this.state.autofill && 
            <div className="input-overlay" style={{ position: 'absolute'}}>
              {this.state.autofill.description.slice(this.state.autofillIndex+1+(this.state.autofillHighlight?0:1)).map(arg => (
                <span key={this.state.autofill.type + arg} className={`match-arg ${(this.state.autofillIndex+1) == this.state.autofill.description.findIndex(a => a === arg) ? "match-arg-selected" : ""}`}>{arg}</span>
              ))}
            </div>}
          {this.state.matches.length>0 && 
            <div className="matches">
              {this.state.matches.map((match) => (<Match key={match.type} match={match} selected={this.state.matches.findIndex(m => m.type == match.type) == (this.state.selectionIndex-1)} />))}
            </div>
          }
        </div>
      </div>
    );
  }
}

export const Okbar = connector(OkbarUI);
export default Okbar;
