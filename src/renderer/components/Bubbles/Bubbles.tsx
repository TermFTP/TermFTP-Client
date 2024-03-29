import { DefaultDispatch, RootState } from "@store";
import React, { CSSProperties } from "react";
import { connect, ConnectedProps } from "react-redux";
import Bubble from "./Bubble/Bubble";
import "./Bubbles.scss";

const mapState = ({ appReducer: { bubbles } }: RootState) => ({
  bubbles,
});

// eslint-disable-next-line
const mapDispatch = (dispatch: DefaultDispatch) => ({
  // addBubble: (key: string, bubble: BubbleModel) =>
  // dispatch(addBubble(key, bubble)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export const BubblesUI = ({ bubbles }: Props): JSX.Element => {
  const keys = [];
  for (const k of bubbles.keys()) {
    keys.push(k);
  }
  const style = {
    "--bubble-items": keys.length,
  } as CSSProperties;
  return (
    <div id="bubbles" style={style}>
      {keys.map((k, i) => (
        <Bubble
          key={k}
          k={k}
          i={i}
          bubble={bubbles.get(k)}
          timeout={8000}
        ></Bubble>
      ))}
    </div>
  );
};

export * from "./Bubble/Bubble";
export const Bubbles = connector(BubblesUI);
export default Bubbles;
