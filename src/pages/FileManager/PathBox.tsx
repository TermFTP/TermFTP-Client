import { normalizeURL } from "@lib";
import { DefaultDispatch, RootState } from "@store";
import { changePathBox, PathBoxData } from "@store/filemanager";
import { clearSelection } from "@store/ftp";
import { push } from "connected-react-router";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";

const mapState = ({ fmReducer: { pathBox } }: RootState) => ({ pathBox });

const mapDispatch = (d: DefaultDispatch) => ({
  changePathBox: (pathBox: PathBoxData) => d(changePathBox(pathBox)),
  push: (path: string) => d(push(path)),
  clearSelection: () => d(clearSelection()),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

interface State {
  path: string;
}

export class PathBoxUI extends Component<Props, State> {
  inputRef = React.createRef<HTMLInputElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      path: decodeURI(this.props.pathBox.pwd),
    };
  }

  componentDidUpdate(): void {
    if (
      !this.props.pathBox.focused &&
      this.state.path != decodeURI(this.props.pathBox.pwd)
    ) {
      this.setState({
        path: decodeURI(this.props.pathBox.pwd),
      });
    }
    if (
      this.props.pathBox.focused &&
      this.inputRef.current !== document.activeElement
    ) {
      this.inputRef.current.focus();
    }
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    this.inputRef.current.blur();
    const path = this.state.path.trim();
    const { push } = this.props;
    if (path.startsWith("/")) {
      push(`/file-manager${path}`);
    } else {
      push(`${normalizeURL(window.location.pathname)}/${path}`);
    }
    clearSelection();
  };

  handlePath = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ path: e.target.value });
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Escape") {
      this.setState({ path: this.props.pathBox.pwd });
    }
  };

  render(): JSX.Element {
    const { path } = this.state;
    const { changePathBox } = this.props;
    return (
      <form id="file-manager-pwd" onSubmit={this.handleSubmit}>
        <label>
          <input
            ref={this.inputRef}
            value={path}
            onChange={(e) => this.setState({ path: e.target.value })}
            onFocus={() => changePathBox({ focused: true })}
            onBlur={() => changePathBox({ focused: false })}
            onKeyDown={this.onKeyDown}
          />
        </label>
      </form>
    );
  }
}

export const PathBox = connector(PathBoxUI);
export default PathBox;
