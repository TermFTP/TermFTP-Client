import React from "react";

import "./Loading.scss";
import { RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";

const mapState = ({
  appReducer: {
    data: { isLoading },
  },
}: RootState) => ({
  isLoading,
});

const connector = connect(mapState, {});

type PropsFromState = ConnectedProps<typeof connector>;

type Props = PropsFromState;

function LoadingUI({ isLoading }: Props) {
  return (
    <div className={`loading-wrapper ${isLoading ? "loading" : ""}`}>
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {/* <h3>Did you know..</h3> */}
      {/* <p>{rf.randomFact()}</p> */}
    </div>
  );
}

export const Loading = connector(LoadingUI);

export default Loading;
