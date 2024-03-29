import { DefaultDispatch, RootState } from "@store";
import { addBubble, setOkbar } from "@store/app";
import React, { createRef } from "react";
import { connect, ConnectedProps } from "react-redux";
import { goToFTPClient } from "@store/ftp";
import { BaseFTP, FTP, SFTP, parseCommand, matchCommand } from "@lib";
import { ConnectDetails } from "../Connect/Lists/ServerItem/ServerItem";
import { FTPConnectTypes } from "@models";
import "./Okbar.scss";
import { BubbleModel, Command, CommandAction, SaveReq } from "@models";
import Match from "./Match";
import { push } from "connected-react-router";
import { saveServer } from "@store/lists";

const mapState = ({
  appReducer: { okbar },
  ftpReducer: { client },
  listReducer: { saved, favourites, groups },
}: RootState) => ({
  okbar,
  client,
  savedServers: saved,
  favouriteServers: favourites,
  groupServers: groups,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  setOkbar: (okbar: OkbarProps) => dispatch(setOkbar(okbar)),
  goToFTP: (client: BaseFTP) => dispatch(goToFTPClient(client)),
  push: (route: string) => dispatch(push(route)),
  saveServer: (req: SaveReq) => dispatch(saveServer(req)),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
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
      autofillHighlight: false,
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

  componentWillUnmount() {
    document.removeEventListener("keyup", this.keyUp);
    document.removeEventListener("keydown", this.keyDown);
  }

  keyUp = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.key === "k") {
      e?.preventDefault();
      e?.stopPropagation();
      this.props.setOkbar({ shown: true });
      this.setState({
        matches: [],
        selectionIndex: 0,
        autofill: null,
        autofillIndex: 0,
        autofillHighlight: false,
        cmdHistoryIndex: 0,
      });
    }
  };

  keyDown = (e: KeyboardEvent): void => {
    if (!this.props.okbar) return;

    const { matches, selectionIndex, autofill, autofillIndex, value } =
      this.state;

    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (autofill) {
        if (
          autofillIndex === 0 &&
          value.trim().split(/ +/g).length == autofillIndex + 1
        ) {
          let matchIndex = -1;
          if (!e.shiftKey)
            matchIndex =
              selectionIndex < matches.length - 1
                ? selectionIndex + 1
                : matches.length - 1;
          else matchIndex = selectionIndex > 1 ? selectionIndex - 1 : 0;

          this.setState({
            value:
              matches[matchIndex].description[0] +
              (matches[matchIndex].description.length > 1 ? " " : ""),
            autofill: { ...matches[matchIndex] },
            selectionIndex: 0,
            autofillHighlight: true,
          });
        } else {
          this.setState({
            autofillIndex: value.trim().split(/ +/g).length - 1,
            autofillHighlight: true,
            value: (value + " ").replace(/ +$/, " "),
          });
        }
      } else if (matches.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
          autofill: matches[0],
          autofillHighlight: true,
          value:
            matches[0].description[0] +
            (matches[0].description.length > 1 ? " " : ""),
          autofillIndex: 0,
        });
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  componentDidUpdate() {
    const { okbar } = this.props;
    okbar && this.input.current?.focus();
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value.replace(/ +$/, " ");
    this.setState({
      value: val.trim().length > 0 ? val : "",
    });
  };

  onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      this.props.setOkbar(undefined);
    }

    const elem = e.target as HTMLInputElement;

    const {
      matches,
      selectionIndex,
      cmdHistory,
      cmdHistoryIndex,
      autofill,
      value,
    } = this.state;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();

      if (matches.length > 0) {
        const selectId = selectionIndex > 1 ? selectionIndex - 1 : 0;
        this.setState({ selectionIndex: selectId });
        return;
      }

      const itemId = cmdHistoryIndex + 1;
      if (cmdHistory[cmdHistory.length - itemId]) {
        this.setState({
          cmdHistoryIndex: itemId,
          value: cmdHistory[cmdHistory.length - itemId],
        });
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();

      if (matches.length > 0) {
        const selectId =
          selectionIndex < matches.length ? selectionIndex + 1 : matches.length;
        this.setState({ selectionIndex: selectId });
        return;
      }

      const itemId = cmdHistoryIndex - 1;
      const item = cmdHistory.slice(-itemId)[0];
      if (item) {
        this.setState({
          cmdHistoryIndex: itemId,
          value: item,
        });
      } else {
        this.setState({ value: "", cmdHistoryIndex: 0 });
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      if (selectionIndex !== 0) {
        this.setState({
          value:
            matches[selectionIndex - 1].description[0] +
            (matches[selectionIndex - 1].description.length > 1 ? " " : ""),
          autofill: { ...matches[selectionIndex - 1] },
          selectionIndex: 0,
          autofillHighlight: true,
        });

        return;
      }

      this.props.setOkbar(undefined);
      const cmd = elem.value.split(" ")[0];
      const args = elem.value.split(/ +/g).slice(1);

      try {
        const result = parseCommand(cmd, args, [
          ...(this.props.savedServers?.server || []),
          ...(this.props.favouriteServers?.server || []),
          ...(this.props.groupServers?.map((g) => g.server)?.flat() || []),
        ]);

        this.setState({ cmdHistory: [...cmdHistory, elem.value] });
        switch (result.command) {
          case Command.CONNECT:
            this.doConnect(result.data);
            break;
          case Command.DISCONNECT:
            this.props.push("/main");
            break;
          case Command.SAVE:
            this.props.saveServer(result.data);
            break;
        }
      } catch (e: any) {
        console.error(e);
        this.props.addBubble("command-error", {
          type: "ERROR",
          title: "Error executing Command",
          message: e,
        });
      }
    } else if (e.key === " ") {
      if (!autofill) {
        if (matches.length > 0)
          this.setState({
            autofill: matches[0],
            value:
              matches[0].description[0] +
              (matches[0].description.length > 1 ? " " : ""),
            autofillHighlight: true,
            autofillIndex: 0,
          });
      } else {
        this.setState({
          autofillIndex: value.split(/ +/g).length - 2,
          autofillHighlight: true,
        });
        return;
      }
    } else {
      if (autofill) {
        if (e.key === "Backspace") {
          if (value.length === 0) {
            this.setState({
              autofill: null,
              autofillHighlight: false,
              autofillIndex: 0,
            });
          } else {
            this.setState({
              autofillIndex: value.split(/ +/g).length - 2,
              autofillHighlight: true,
            });
          }
        }
      }

      const cmd = elem.value.split(/ +/g)[0];

      const matches = matchCommand(cmd);
      this.setState({ matches });
    }
  };

  doConnect = (details: ConnectDetails = undefined) => {
    const { username, ip, password, ftpPort, sshPort } = details;
    const { ftpType } = details;

    this.props.push("/main");

    setTimeout(() => {
      if (ftpType === FTPConnectTypes.FTP) {
        this.props.goToFTP(
          new FTP({
            user: username,
            password,
            host: ip,
            port: ftpPort || 21,
            sshPort: sshPort || 22,
          }),
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
          }),
        );
      } else {
        this.props.goToFTP(
          new SFTP({
            username,
            password,
            host: ip,
            port: sshPort || 22,
          }),
        );
      }
    }, 500);
  };

  render() {
    const {
      state: {
        value,
        matches,
        autofill,
        autofillIndex,
        autofillHighlight,
        selectionIndex,
      },
      props: { okbar, setOkbar },
    } = this;

    return (
      <div className={`okbar-wrapper ${okbar ? "shown" : ""}`}>
        <div
          className='okbar-background'
          onClick={() => setOkbar(undefined)}
        ></div>
        <div className='okbar'>
          <div className='okbar-hint'>
            <span>
              {(matches[0]?.description[0][0] === value[0]?.toLowerCase()
                ? matches[0]?.description[0]
                : undefined) || (value.length === 0 ? "Enter Command" : "")}
            </span>
            <span className='okbar-hint-value'>
              {" " + value.split(/ +/g).slice(1)}
            </span>
            <span>
              {value.trim().split(/ +/g).length == autofillIndex + 1
                ? autofill?.references[
                    autofill.description.slice(1)[autofillIndex]
                  ]
                : ""}
            </span>
          </div>
          <input
            autoComplete='off'
            spellCheck='false'
            type='text'
            ref={this.input}
            onChange={this.onChange}
            value={value}
            onKeyUp={this.onKeyUp}
            onFocus={() => this.input.current.select()}
          />
          {matches.length > 0 && (
            <div className='matches'>
              {matches.map((match) => (
                <Match
                  key={match.type}
                  autofillIndex={autofillIndex}
                  autofillHighlight={autofillHighlight}
                  match={match}
                  selected={
                    matches.findIndex((m) => m.type == match.type) ==
                    selectionIndex - 1
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const Okbar = connector(OkbarUI);
export default Okbar;
