import React, { useEffect, useRef, useState } from "react";
import "./ContextMenu.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt, addBubble } from "@store/app";
import { BubbleModel } from "@models";
import { remote } from "electron";
import {
  faFileDownload,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faICursor,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FileType } from "@shared";

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
  if (file?.type === FileType.DIR) {
    items = [
      ...items,
      {
        label: "Download folder",
        func: onFolderDownload,
        name: "context-download",
        icon: faFolder,
      },
      {
        label: "Rename folder",
        func: onFolderRename,
        name: "context-rename",
        icon: faICursor,
      },
      {
        label: "Delete folder",
        func: onFolderDelete,
        name: "context-delete",
        icon: faTrashAlt,
      },
    ];
  } else if (file?.type === FileType.FILE) {
    items = [
      ...items,
      {
        label: "Download file",
        func: onFileDownload,
        name: "context-download-file",
        icon: faFileDownload,
      },
      {
        label: "Rename file",
        func: onFileRename,
        name: "context-rename",
        icon: faICursor,
      },
      {
        label: "Delete file",
        func: onFileDelete,
        name: "context-delete",
        icon: faTrashAlt,
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
    // TODO also listen to escape
    if (isOpen && !(e.target as HTMLButtonElement).id.includes("plus")) {
      setContextMenu({ isOpen: false });
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

  function onFolderRename(): void {
    setPrompt({
      fieldName: "Folder name",
      initial: file.name,
      callback: (val) => {
        client.rename(file.name, val).catch(() =>
          addBubble("rename-error", {
            title: "Could not rename folder",
            type: "ERROR",
            message: `renaming of ${file.name} failed`,
          })
        );
      },
    });
  }

  function onFileRename(): void {
    setPrompt({
      fieldName: "File name",
      initial: file.name,
      callback: (val) => {
        client.rename(file.name, val).catch(() =>
          addBubble("rename-error", {
            title: "Could not rename folder",
            type: "ERROR",
            message: `renaming of ${file.name} failed`,
          })
        );
      },
    });
  }

  async function onFolderUpload(): Promise<void> {
    try {
      const res = await remote.dialog.showOpenDialog({
        properties: ["openDirectory", "multiSelections"],
      });
      if (res.canceled) return;
      client.putFolders(res.filePaths);
    } catch (err) {
      addBubble("upload-error", {
        title: "Could not upload folder",
        message: err.message,
        type: "ERROR",
      });
    }
  }

  async function onFileUpload(): Promise<void> {
    try {
      const res = await remote.dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
      });
      if (res.canceled) return;
      client.putFiles(res.filePaths);
    } catch (err) {
      addBubble("upload-error", {
        title: "Could not upload file",
        message: err.message,
        type: "ERROR",
      });
    }
  }

  function onCreateFolder(): void {
    setPrompt({
      fieldName: "Folder name",
      initial: "",
      callback: (value: string) => {
        setPrompt(undefined);
        client.mkdir(value, false).catch((err) => {
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
        if (path && !path.canceled) {
          client.get(file.name, path.filePath);
        }
      });
  }

  function onFolderDownload(): void {
    remote.dialog
      .showOpenDialog({
        properties: ["createDirectory", "openDirectory"],
      })
      .then((res) => {
        if (res.canceled) return;
        client.getFolder(file, res.filePaths[0]);
      });
  }

  function onFileDelete(): void {
    client.deleteFile(file.name).catch(() => {
      addBubble("delete-error", {
        title: `Could not delete file`,
        type: "ERROR",
        message: `failed on: ${file.name}`,
      });
    });
  }

  function onFolderDelete(): void {
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
