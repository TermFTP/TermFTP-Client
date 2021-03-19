import React, { useEffect, useRef, useState } from "react";
import "./ContextMenu.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt, addBubble } from "@store/app";
import { BubbleModel } from "@models";
import { remote } from "electron";
import fs from "fs";
import { basename, join, dirname, sep } from "path";

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

  function getAllFiles(dirPath: string, arrayOfFiles: string[]) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        arrayOfFiles.push(join(dirPath, "/", file));
      }
    });

    return arrayOfFiles;
  }

  function onCreateFolder() {
    setPrompt({
      fieldName: "Folder name",
      callback: (value: string) => {
        setPrompt(undefined);
        client.createFolder(value).catch((err) => {
          addBubble("mkdir-error", {
            title: err.title || "Failed to create directory",
            message: err.message,
            type: "ERROR",
          });
        });
      },
    });
  }

  function onFileUpload() {
    remote.dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
      })
      .then((res) => {
        if (res.canceled) return;
        console.log(res);
        for (const path of res.filePaths) {
          const a = client.put(fs.createReadStream(path), basename(path));
          a.catch((err) => {
            addBubble("mkdir-error", {
              title: err.title || "Failed to upload file",
              message: err.message,
              type: "ERROR",
            });
          });
        }
      })
      .catch((err) => {
        addBubble("upload-error", {
          title: err.title,
          message: err.message,
          type: "ERROR",
        });
      });
  }

  function onFolderUpload() {
    remote.dialog
      .showOpenDialog({ properties: ["openDirectory", "multiSelections"] })
      .then((res) => {
        if (res.canceled) return;
        console.log(res);
        for (const path of res.filePaths) {
          const files = getAllFiles(path, []);
          console.log(files);
          for (const file of files) {
            console.warn(
              "FILEaab:",
              join(
                path.substring(path.lastIndexOf(sep) + 1),
                file.split(path)[1]
              )
            );
            const a = client.put(
              fs.createReadStream(file),
              join(
                path.substring(path.lastIndexOf(sep) + 1),
                file.split(path)[1]
              )
            );
            a.catch((err) => {
              addBubble("upload-error", {
                title: err.title || "Failed to upload directory",
                message: err.message,
                type: "ERROR",
              });
            });
          }
        }
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
      <button onClick={() => onCreateFolder()}>Create folder</button>
      <button onClick={() => onFileUpload()}>Upload file(s)</button>
      <button onClick={() => onFolderUpload()}>Upload folder(s)</button>
    </div>
  );
};

export const ContextMenu = connector(ContextMenuUI);

export default ContextMenu;
