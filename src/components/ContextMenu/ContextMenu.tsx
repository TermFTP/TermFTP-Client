import React, { useEffect, useRef, useState } from "react";
import "./ContextMenu.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt, addBubble } from "@store/app";
import { BubbleModel } from "@models";
import { onCreateFolder, uploadFolder, uploadFile, FTP } from "@lib";
import { remote } from "electron";

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
}: Props) => {
  const ownRef = useRef<HTMLDivElement>();
  const [listening, setListening] = useState<boolean>(false);
  let contextStyles = {
    "--width": "10em",
    "--items": 3,
  } as any;
  if (x && y) {
    if (ownRef.current) {
      const parent = ownRef.current.parentElement.parentElement;
      const rect = parent.getBoundingClientRect();
      const own = ownRef.current.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(ownRef.current).fontSize);
      if (x + own.width > rect.width) {
        x = x - own.width;
      }
      if (y + em * contextStyles["--items"] > rect.height) {
        y = y - em * contextStyles["--items"];
      }
    }
    contextStyles = {
      ...contextStyles,
      left: `${x}px`,
      top: `${y}px`,
      position: "fixed",
    };
  }
  useEffect(() => {
    if (!listening && isOpen) {
      window.addEventListener("click", (e) => {
        if (
          menu.isOpen &&
          !(e.target as HTMLButtonElement).id.includes("plus")
        ) {
          setContextMenu({ isOpen: false, file, x: menu.x, y: menu.y });
        }
      });
      setListening(true);
    }
  });

  // window.removeEventListener("click", onClick);

  function onFolderUpload(client: FTP): void {
    remote.dialog
      .showOpenDialog({ properties: ["openDirectory", "multiSelections"] })
      .then((res) => {
        if (res.canceled) return;
        uploadFolder(client, res.filePaths);
      })
      .catch((err) => {
        addBubble("upload-error", {
          title: err.title,
          message: err.message,
          type: "ERROR",
        });
      });
  }

  function onFileUpload(client: FTP): void {
    remote.dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
      })
      .then((res) => {
        if (res.canceled) return;
        console.log(res);
        uploadFile(client, res.filePaths);
      })
      .catch((err) => {
        addBubble("upload-error", {
          title: err.title,
          message: err.message,
          type: "ERROR",
        });
      });
  }

  return (
    <div
      id="file-manager-context-menu"
      className={`${isOpen ? "opened" : ""}`}
      style={contextStyles}
      ref={ownRef}
    >
      <button onClick={() => onCreateFolder(client)}>Create folder</button>
      <button onClick={() => onFileUpload(client)}>Upload file(s)</button>
      <button onClick={() => onFolderUpload(client)}>Upload folder(s)</button>
    </div>
  );
};

export const ContextMenu = connector(ContextMenuUI);

export default ContextMenu;
