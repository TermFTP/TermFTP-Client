import React, { Component } from "react";
import { DefaultDispatch } from "@store";
import { connect, ConnectedProps } from "react-redux";
import "./Connect.scss";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lists } from "@components";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  mode: boolean;
}

export class ConnectUI extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: false,
    };
  }

  changeMode = (): void => {
    this.setState({ mode: !this.state.mode });
  };

  render(): JSX.Element {
    return (
      <div id="connect">
        <div className="connect-settings">
          <button
            className={`connect-switch ${this.state.mode ? "switched" : ""}`}
            onClick={this.changeMode}
          >
            <span>GUI</span>
            <span>CLI</span>
          </button>
          <button className="connect-settings-btn">
            <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
          </button>
        </div>
        <div className="connect-gui">
          <div className="connect-list-wrapper">
            <Lists></Lists>
          </div>
          <form className="connect-form">
            <input type="text" placeholder="IP" className="connect-ip" />
            <input type="number" placeholder="Port" className="connect-port" />
            <input
              type="text"
              placeholder="Username"
              className="connect-user"
            />
            <input type="text" placeholder="Password" className="connect-pw" />
            <div className="connect-form-btn">
              <input type="submit" value="Connect" />
              <input type="submit" value="Save" />
              <input type="submit" value="Favourite" />
            </div>
          </form>
        </div>
        <div className="connect-cli"></div>
      </div>
    );
  }
}

export const Connect = connector(ConnectUI);

export default Connect;
