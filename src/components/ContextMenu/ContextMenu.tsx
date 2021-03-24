import React, { useEffect, useRef, useState } from "react";
import "./ContextMenu.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt, addBubble } from "@store/app";
import { BubbleModel } from "@models";
import { uploadFolder, uploadFile, downloadFile, downloadFolder } from "@lib";
import { remote } from "electron";
import {
  faFileDownload,
  faFolder,
  faFolderMinus,
  faFolderOpen,
  faFolderPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  client,
  setContextMenu,
  setPrompt,
  addBubble,
}: Props) => {
  const ownRef = useRef<HTMLDivElement>();
  const [listening, setListening] = useState<boolean>(false);
  let items = [
    {
      label: "Create folder",
      func: onCreateFolder,
      name: "context-create-folder",
      icon: faFolderOpen,
    },
    {
      label: "Upload file(s)",
      func: onFileUpload,
      name: "context-upload-file",
      icon: faFileDownload,
    },
    {
      label: "Upload folder(s)",
      func: onFolderUpload,
      name: "context-upload-folder",
      icon: faFolderPlus,
    },
  ];
  if (file?.type === "d") {
    items = [
      ...items,
      {
        label: "Download folder",
        func: onFolderDownload,
        name: "context-download",
        icon: faFolder,
      },
      {
        label: "Delete folder",
        func: onDeleteFolder,
        name: "context-delete",
        icon: faFolderMinus,
      },
    ];
  } else if (file) {
    items = [
      ...items,
      {
        label: "Download file",
        func: onFileDownload,
        name: "context-download-file",
        icon: faFileDownload,
      },
      {
        label: "Delete file",
        func: onDeleteFile,
        name: "context-delete",
        icon: faMinus,
      },
    ];
  }

  let contextStyles = {
    "--width": "10em",
    "--items": items.length,
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
  const click = (e: MouseEvent) => {
    if (isOpen && !(e.target as HTMLButtonElement).id.includes("plus")) {
      setContextMenu({ isOpen: false, file, x, y });
      window.removeEventListener("click", click);
      setListening(false);
    }
  };
  useEffect(() => {
    if (!listening && isOpen) {
      window.addEventListener("click", click);
      setListening(true);
    }
  });

  // window.removeEventListener("click", onClick);

  function onFolderUpload(): void {
    remote.dialog
      .showOpenDialog({ properties: ["openDirectory", "multiSelections"] })
      .then((res) => {
        if (res.canceled) return;
        uploadFolder(client, res.filePaths, addBubble);
      })
      .catch((err) => {
        addBubble("upload-error", {
          title: err.title,
          message: err.message,
          type: "ERROR",
        });
      });
  }

  function onFileUpload(): void {
    remote.dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
      })
      .then((res) => {
        if (res.canceled) return;
        console.log(res);
        uploadFile(client, res.filePaths, addBubble);
      })
      .catch((err) => {
        addBubble("upload-error", {
          title: err.title,
          message: err.message,
          type: "ERROR",
        });
      });
  }

  function onCreateFolder(): void {
    setPrompt({
      fieldName: "Folder name",
      initial: "",
      callback: (value: string) => {
        setPrompt(undefined);
        client.createFolder(value, false).catch((err) => {
          addBubble("mkdir-error", {
            title: err.title || "Failed to create directory",
            message: err.message,
            type: "ERROR",
          });
        });
      },
    });
  }

  function onFileDownload(): void {
    remote.dialog
      .showSaveDialog({
        defaultPath: file.name,
        properties: ["createDirectory"],
      })
      .then((path) => {
        if (path) {
          downloadFile(client, file, path.filePath);
        }
      });
  }

  function onFolderDownload(): void {
    remote.dialog
      .showOpenDialog({
        properties: ["createDirectory", "openDirectory"],
      })
      .then((res) => {
        downloadFolder(client, file, res.filePaths[0]);
      });
  }

  function onDeleteFile(): void {
    client.delete(file.name).catch(() => {
      addBubble("delete-error", {
        title: `Could not delete file`,
        type: "ERROR",
        message: `failed on: ${file.name}`,
      });
    });
  }

  function onDeleteFolder(): void {
    client.rmdir(file.name).catch(() => {
      addBubble("delete-error", {
        title: `Could not delete folder`,
        type: "ERROR",
        message: `failed on: ${file.name}`,
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
      {items.map((i) => (
        <button key={i.label} onClick={() => i.func()} className={i.name}>
          <div className="context-icon">
            <FontAwesomeIcon icon={i.icon}></FontAwesomeIcon>
          </div>
          <div className="context-text">{i.label}</div>
        </button>
      ))}
    </div>
  );
};

export const ContextMenu = connector(ContextMenuUI);

export default ContextMenu;
