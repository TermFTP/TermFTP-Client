import "./Terminal.scss";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { DefaultDispatch, RootState } from "@store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faTimes } from "@fortawesome/free-solid-svg-icons";
import { setTerminal, TerminalActions } from "@store/filemanager";
import { XTerm } from "@termftp/react-xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { SSH } from "@lib";

const mapState = ({
  ftpReducer: { client },
  fmReducer: { terminalOpen },
}: RootState) => ({
  client,
  terminalOpen,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  setTerminal: (action: TerminalActions) => dispatch(setTerminal(action)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

class TerminalUI extends React.Component<Props> {
  xtermRef: React.RefObject<XTerm> = React.createRef();
  fitAddon = new FitAddon();
  ssh: SSH = new SSH(this.fitAddon);
  webLinksAddon = new WebLinksAddon();

  constructor(props: Props) {
    super(props);
  }

  onDisconnect = () => {
    this.setState({ open: false });
  };

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    const term = this.xtermRef.current.getTerminal();
    const style = getComputedStyle(document.documentElement);
    term.setOption("theme", {
      background: style.getPropertyValue("--dark-bg-2"),
    });
    (window as any).fit = this.fitAddon.fit.bind(this.fitAddon);
  }

  resize = (): void => {
    this.ssh.resize();
  };

  componentDidUpdate() {
    if (!this.ssh.connected && this.props.terminalOpen) {
      const config = this.props.client.config;
      this.ssh.connect(
        {
          host: config.host,
          port: config.sshPort,
          password: config.password,
          username: config.user,
          keepaliveInterval: 20000,
          readyTimeout: 20000,
        },
        this.xtermRef.current.getTerminal(),
        this.xtermRef.current.container.current
      );
      setTimeout(this.resize, 100);
    }
  }

  handleToggle = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ): void => {
    e.stopPropagation();
    e.preventDefault();
    this.props.setTerminal("TOGGLE");
  };

  handleDisconnect = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    e.preventDefault();
    this.props.setTerminal("CLOSE");
    this.ssh.disconnect();
  };

  componentWillUnmount() {
    this.ssh.disconnect();
  }

  render(): JSX.Element {
    return (
      <div
        className={`terminal-c ${
          this.props.terminalOpen ? "terminal-open" : ""
        }`}
      >
        <div className="terminal-top" onDoubleClick={this.handleToggle}>
          <p>Terminal</p>
          <button className="terminal-toggle-btn" onClick={this.handleToggle}>
            <div className="terminal-icon-wrapper">
              <FontAwesomeIcon icon={faAngleUp}></FontAwesomeIcon>
            </div>
          </button>
          <button
            className="terminal-close-btn"
            onClick={this.handleDisconnect}
          >
            <div className="terminal-icon-wrapper">
              <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
            </div>
          </button>
        </div>
        <div className="terminal-content">
          <XTerm
            ref={this.xtermRef}
            addons={[this.fitAddon, this.webLinksAddon]}
            className="terminal-xterm"
            options={{
              convertEol: true,
              fontFamily: `"JetBrains Mono", "MesloLGS NF"`,
              rendererType: "dom",
            }}
          />
        </div>
      </div>
    );
  }
}

export const Terminal = connector(TerminalUI);
export default Terminal;
