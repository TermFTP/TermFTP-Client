import React from "react";

import "./Overlay.scss";
import { RootState, DefaultDispatch } from "@store";
import { resetError } from "@store/app";
import { connect, ConnectedProps } from "react-redux";

const mapState = ({ appReducer: { error } }: RootState) => ({
  error,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  reset: () => dispatch(resetError()),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function OverlayUI({ error, reset }: Props) {
  let title = "",
    msg = "";
  if (error) {
    title = error.title;
    msg = error.msg;
  }
  return (
    <div className={`overlay-wrapper ${error ? "shown" : ""}`} onClick={reset}>
      <h2 className="overlay-title">{title}</h2>
      <p className="overlay-text">{msg}</p>
    </div>
  );
}

export const Overlay = connector(OverlayUI);

export default Overlay;
