import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultDispatch, RootState } from "@store";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./Lists.scss";

const mapState = ({ listReducer }: RootState) => ({
  ...listReducer,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function ToggleBtn({ title }: { title: string }): JSX.Element {
  function onClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const parent = event.currentTarget.parentElement;
    if (parent.classList.contains("toggled")) {
      parent.classList.remove("toggled");
    } else {
      parent.classList.add("toggled");
    }
  }

  return (
    <div className="connect-list-toggle" onClick={onClick}>
      <div>
        <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>
      </div>
      {title}
    </div>
  );
}

function ListsUI({ groups, history }: Props) {
  // this is how height will be automatically transitioned
  const historyStyle = { "--items": 2 } as React.CSSProperties;
  const five = { "--items": 5 } as React.CSSProperties;
  return (
    <div id="connect-lists">
      <div className="connect-list" id="connect-fav" style={historyStyle}>
        <ToggleBtn title="Favourites"></ToggleBtn>
        <div>Fav 1</div>
        <div>Fav 2</div>
      </div>
      <div className="connect-list" id="connect-groups" style={five}>
        <ToggleBtn title="Groups"></ToggleBtn>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 2</div>
        <div>Item 2</div>
        <div>Item 2</div>
      </div>
      {/* {history.length > 0 && ( */}
      <div className="connect-list" id="connect-history" style={historyStyle}>
        <ToggleBtn title="History"></ToggleBtn>
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
      {/* )} */}
    </div>
  );
}

export const Lists = connector(ListsUI);

export default Lists;
