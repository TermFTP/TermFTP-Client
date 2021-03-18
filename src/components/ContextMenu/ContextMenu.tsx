import React, { useState } from "react";
import Client from "ftp";
import "./ContextMenu.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt, addBubble } from "@store/app";
import { BubbleModel } from "@models";

const mapState = ({
  fmReducer: { menu },
  ftpReducer: { client },
}: RootState) => ({ menu, client });

const mapDispatch = (dispatch: DefaultDispatch) => ({
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  setPrompt: (prompt: PromptProps) => dispatch(setPrompt(prompt)),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

const ContextMenuUI = ({
  menu: { x, y, file, isOpen },
  menu,
  client,
  setContextMenu,
  setPrompt,
  addBubble,
}: Props) => {
  const [listening, setListening] = useState<boolean>(false);
  let contextStyles = {
    "--width": "10em",
    "--items": 3,
  } as any;
  if (x && y) {
    contextStyles = {
      ...contextStyles,
      left: `${x}px`,
      top: `${y}px`,
      position: "fixed",
    };
  }

  // window.removeEventListener("click", onClick);
  if (!listening && isOpen) {
    window.addEventListener("click", (e) => {
      if (menu.isOpen && !(e.target as HTMLButtonElement).id.includes("plus")) {
        setContextMenu({ isOpen: false, file, x, y });
      }
    });
    setListening(true);
  }

  function onCreateFolder() {
    console.log("asd");
    setPrompt({
      fieldName: "Folder name",
      callback: (value: string) => {
        setPrompt(undefined);
        client.createFolder(value).catch((err) => {
          console.log("err", err);
          addBubble("mkdir-error", {
            title: err.title || "Failed to create directory",
            message: err.message,
            type: "ERROR",
          });
        });
      },
    });
  }

  return (
    <div
      id="file-manager-context-menu"
      className={`${isOpen ? "opened" : ""}`}
      style={contextStyles}
    >
      <button onClick={() => onCreateFolder()}>Create folder</button>
      <button>Upload files</button>
      <button>Upload folder(s)</button>
    </div>
  );
};

export const ContextMenu = connector(ContextMenuUI);

export default ContextMenu;
