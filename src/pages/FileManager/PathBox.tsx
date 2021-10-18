import { DefaultDispatch, RootState } from "@store";
import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";

const mapState = ({ fmReducer: { pathBox } }: RootState) => ({ pathBox });

const mapDispatch = (dispatch: DefaultDispatch) => ({});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export class PathBoxUI extends Component<Props> {
  render() {
    const { pwd, focused } = this.props.pathBox;
    return <div id="file-manager-pwd">{pwd}</div>;
  }
}

export const PathBox = connector(PathBoxUI);
export default PathBox;
