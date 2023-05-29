import React, { useEffect, useRef, useState } from "react";
import "./ContextMenu.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import {
  addProgressFiles,
  ContextMenuProps,
  setContextMenu,
} from "@store/filemanager";
import { PromptProps } from "@components/Prompt/Prompt";
import { setPrompt, addBubble } from "@store/app";
import { BubbleModel } from "@models";
import { dialog } from "electron";
import {
  faDownload,
  faFileDownload,
  faFileUpload,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faICursor,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FileType, ProgressFileI } from "@models";
import { statSync } from "fs";
import { basename } from "path";
import { checkIfInInput, getProgressDir } from "@lib";
import { focusFilesElement } from "@pages";

const mapState = ({
  fmReducer: { menu },
  ftpReducer: {
    client,
    selection: { selected },
  },
}: RootState) => ({ menu, client, selected });

const mapDispatch = (dispatch: DefaultDispatch) => ({
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  setPrompt: (prompt: PromptProps) => dispatch(setPrompt(prompt)),
  addBubble: (key: string, bubble: BubbleModel) =>
    dispatch(addBubble(key, bubble)),
  addProgressFiles: (files: ProgressFileI[]) =>
    dispatch(addProgressFiles(files)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

const ContextMenuUI = ({
  menu: { x, y, isOpen },
  client,
  setContextMenu,
  setPrompt,
  addBubble,
  selected,
  addProgressFiles,
}: Props) => {
  const [curItem, setCurItem] = useState<number>(-1);
  const ownRef = useRef<HTMLDivElement>();
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
      icon: faFileUpload,
    },
    {
      label: "Upload folder(s)",
      func: onFolderUpload,
      name: "context-upload-folder",
      icon: faFolderPlus,
    },
  ];
  const file = selected.values().next().value;
  if (selected.size > 1) {
    items = [
      ...items,
      {
        label: "Download Files/Folders",
        func: onFilesDownload,
        icon: faDownload,
        name: "context-download-files",
      },
      {
        label: "Delete Files/Folders",
        func: onFilesDelete,
        icon: faDownload,
        name: "context-delete",
      },
    ];
  } else if (file?.type === FileType.DIR) {
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
        func: onRename("folder name"),
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
        func: onFilesDownload,
        name: "context-download-file",
        icon: faFileDownload,
      },
      {
        label: "Rename file",
        func: onRename("file name"),
        name: "context-rename",
        icon: faICursor,
      },
      {
        label: "Delete file",
        func: onFilesDelete,
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
    if (!(e.target as HTMLButtonElement).id.includes("plus")) {
      setContextMenu({ isOpen: false });
    }
  };
  const keyUp = (e: KeyboardEvent) => {
    if (e?.target) {
      const el = e.target as HTMLElement;
      // check if element is either input, editable or a not a file
      if (checkIfInInput(el)) return;
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      setContextMenu({ isOpen: false });
      focusFilesElement();
      setCurItem(-1);
    } else if (e.key.includes("Arrow")) {
      e.stopPropagation();
      e.preventDefault();
      let change = 0;
      if (e.key === "ArrowDown") change = 1;
      else if (e.key === "ArrowUp") change = -1;
      // wrap around
      const item = curItem < 0 ? -1 : curItem;
      setCurItem((item + items.length + change) % items.length);
    }
  };
  const keyDown = (e: KeyboardEvent) => {
    if (e?.target) {
      const el = e.target as HTMLElement;
      // check if element is either input, editable or a not a file
      if (checkIfInInput(el)) return;
    }

    if (e.key === "Tab") {
      e.stopPropagation();
      e.preventDefault();
      let change = 0;
      if (e.shiftKey) change = -1;
      else change = 1;
      // wrap around
      const item = curItem < 0 ? -1 : curItem;
      setCurItem((item + items.length + change) % items.length);
    }
  };
  useEffect(() => {
    // remove any previous event listeners (you never know)
    document.removeEventListener("keyup", keyUp);
    document.removeEventListener("keydown", keyDown);
    document.removeEventListener("click", click);

    // add the event listeners if it is open
    if (isOpen) {
      document.addEventListener("click", click);
      document.addEventListener("keydown", keyDown);
      document.addEventListener("keyup", keyUp);
      !x && !y && curItem == -1 && setCurItem(0);
    }

    // clean up (remove the event listeners)
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
      !isOpen && setCurItem(-1);
    };
  }, [isOpen, items.length, curItem]);

  useEffect(() => {
    if (curItem >= 0) {
      const btn = document.getElementsByClassName(
        `file-manager-context-menu-btn`,
      ) as HTMLCollectionOf<HTMLButtonElement>;
      btn[curItem]?.focus();
    } else {
      const el = document.activeElement as HTMLElement;
      el.classList.contains("file-manager-context-menu-btn") &&
        document.getElementById("file-manager-context-menu").focus();
    }
  }, [curItem]);

  function onRename(field: string): () => void {
    return () => {
      setPrompt({
        fieldName: field,
        initial: file.name,
        callback: (val) => {
          client.rename(file.name, val);
        },
      });
    };
  }

  async function onFolderUpload(): Promise<void> {
    try {
      const res = await dialog.showOpenDialog({
        properties: ["openDirectory", "multiSelections"],
      });
      if (res.canceled) return;
      const cwd = await client.pwd();
      const progressFiles: ProgressFileI[] = [];
      for (const path of res.filePaths) {
        progressFiles.push(...getProgressDir(cwd, path));
      }
      addProgressFiles(progressFiles);
      client.putFolders(res.filePaths);
    } catch (err: any) {
      addBubble("upload-error", {
        title: "Could not upload folder",
        message: err.message,
        type: "ERROR",
      });
    }
  }

  async function onFileUpload(): Promise<void> {
    try {
      const res = await dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
      });
      if (res.canceled) return;
      const cwd = await client.pwd();
      const progressFiles: ProgressFileI[] = [];
      for (const path of res.filePaths) {
        const stats = statSync(path);
        progressFiles.push({
          cwd,
          name: basename(path),
          progress: 0,
          progressType: "upload",
          total: stats.size,
        });
      }
      addProgressFiles(progressFiles);
      client.putFiles(res.filePaths);
    } catch (err: any) {
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
        client.mkdir(value);
      },
    });
  }

  function onFolderDownload(): void {
    dialog
      .showOpenDialog({
        properties: ["createDirectory", "openDirectory"],
      })
      .then((res: any) => {
        if (res.canceled) return;
        client.getFolders([file], res.filePaths[0]);
      });
  }

  function onFolderDelete(): void {
    if (!file) return;
    client.rmdir(file.name);
  }

  function onFilesDownload(): void {
    if (selected.size === 0) return;
    dialog
      .showOpenDialog({
        properties: ["createDirectory", "openDirectory"],
      })
      .then(async (res: any) => {
        if (res.canceled || res.filePaths.length == 0) return;
        const folders = [];
        const files = [];
        const cwd = await client.pwd();
        const progressFiles: ProgressFileI[] = [];
        for (const f of selected) {
          if (f.type === FileType.DIR) {
            folders.push(f);
          } else {
            files.push(f.name);
            progressFiles.push({
              cwd,
              name: f.name,
              progress: 0,
              progressType: "download",
              total: f.size,
            });
          }
        }
        addProgressFiles(progressFiles);
        client.getFolders(folders, res.filePaths[0]);
        client.getFiles(files, res.filePaths[0]);
      });
  }

  function onFilesDelete(): void {
    if (selected.size === 0) return;
    const files = [];
    for (const f of selected) {
      if (f.type === FileType.DIR) {
        client.rmdir(f.name);
      } else {
        files.push(f.name);
      }
    }
    client.deleteFiles(files);
  }

  return (
    <div
      id='file-manager-context-menu'
      className={`${isOpen ? "menu-opened" : ""} ${
        isOpen && !x && !y ? "menu-fixed" : ""
      }`}
      style={contextStyles}
      ref={ownRef}
      onMouseMove={() => setCurItem(-2)}
      tabIndex={-1}
    >
      {items.map((item, i) => (
        <button
          key={item.label}
          onClick={() => item.func()}
          className={`${item.name} file-manager-context-menu-btn`}
          tabIndex={isOpen ? i : -1}
        >
          <div className='context-icon'>
            <FontAwesomeIcon icon={item.icon}></FontAwesomeIcon>
          </div>
          <div className='context-text'>{item.label}</div>
        </button>
      ))}
    </div>
  );
};

export const ContextMenu = connector(ContextMenuUI);

export default ContextMenu;
