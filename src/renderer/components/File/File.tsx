import { convertFileSize, normalizeURL } from "@lib";
import { FileType, FileI } from "@models";
import { DefaultDispatch, RootState } from "@store";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import {
  addSelection,
  clearSelection,
  removeSelection,
  selectFile,
  shiftSelection,
} from "@store/ftp";
import { push } from "connected-react-router";
import { statSync } from "fs";
import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./File.scss";
import FileIcon from "./FileIcon";

const mapState = ({
  ftpReducer: {
    selection: { selected },
    client,
  },
  fmReducer: { search },
}: RootState) => ({ selected, search, client });
const mapDispatch = (dispatch: DefaultDispatch) => ({
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  push: (path: string) => dispatch(push(path)),
  selectFile: (file: FileI) => dispatch(selectFile(file)),
  removeSelection: (file: FileI) => dispatch(removeSelection(file)),
  addSelection: (file: FileI) => dispatch(addSelection(file)),
  shiftSelection: (file: FileI) => dispatch(shiftSelection(file)),
  clearSelection: () => dispatch(clearSelection()),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState & {
  file: FileI;
};

function FileUI({
  file,
  push,
  setContextMenu,
  selected,
  selectFile,
  addSelection,
  removeSelection,
  shiftSelection,
  search,
  client,
  clearSelection,
}: Props): JSX.Element {
  if (
    search.searching &&
    search.query &&
    !file.name.toLowerCase().includes(search.query)
  )
    return <></>;

  let counter = 0;
  const [dragOver, setDragOver] = useState({
    over: false,
    shouldBeHighlighted: false,
  });
  function handleClick(ev: React.MouseEvent<HTMLDivElement>) {
    if (file.name === "..") return;

    ev.stopPropagation();
    ev.preventDefault();
    if (ev.ctrlKey) {
      if (selected.has(file)) {
        removeSelection(file);
      } else {
        addSelection(file);
      }
    } else if (ev.shiftKey) {
      shiftSelection(file);
    } else {
      setContextMenu({
        isOpen: false,
      });
      selectFile(file);
    }
  }

  function onContextMenu(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void {
    e.preventDefault();
    e.stopPropagation();
    if (!selected.has(file)) {
      selectFile(file);
    }
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  }

  function onDragStart(e: React.DragEvent<HTMLDivElement>) {
    // e.stopPropagation();
    // e.preventDefault();
    if (!selected.has(file)) selectFile(file);
    const s: FileI[] = [];
    for (const f of selected.values()) {
      s.push(f);
    }
    e.dataTransfer.setData("app/file-transfer", JSON.stringify(s));
    e.dataTransfer.dropEffect = "move";
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (file.type !== FileType.DIR) return;
    if (
      e.dataTransfer.types.includes("app/file-transfer") ||
      e.dataTransfer.types.includes("Files")
    ) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (
      !dragOver.over &&
      (e.dataTransfer.types.includes("app/file-transfer") ||
        e.dataTransfer.types.includes("Files"))
    ) {
      counter++;
      setDragOver({ over: true, shouldBeHighlighted: !selected.has(file) });
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    if (file.type !== FileType.DIR) return;
    if (e.dataTransfer.types.includes("app/file-transfer")) {
      e.preventDefault();
      e.stopPropagation();
      if (selected.has(file)) return;
      const data: FileI[] = JSON.parse(
        e.dataTransfer.getData("app/file-transfer"),
      );
      for (const mFile of data) {
        client.rename(mFile.name, file.name + "/" + mFile.name);
      }
    } else if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      const files = [];
      const folders = [];
      for (const file of e.dataTransfer.files) {
        const p = file.path;

        if (statSync(p).isDirectory()) {
          folders.push(p);
        } else if (statSync(p).isFile()) {
          files.push(p);
        }
      }
      client.putFolders(folders, file.name);
      client.putFiles(files, file.name);
    }
    setDragOver({ over: false, shouldBeHighlighted: false });
  }

  function onDragLeave() {
    counter--;
    if (counter <= 0) {
      counter = 0;
      setDragOver({ over: false, shouldBeHighlighted: false });
    }
  }

  return (
    <div
      className={`file-wrapper ${
        dragOver.shouldBeHighlighted ? "file-dragover" : ""
      }`}
      data-name={file.name.toLowerCase()}
      onDoubleClick={async () => {
        if (file.type === FileType.DIR) {
          push(`${normalizeURL(window.location.pathname)}/${file.name}`);
          clearSelection();
        }
      }}
      onContextMenuCapture={onContextMenu}
      onClick={handleClick}
      draggable={true}
      // onDragOver={(e) => e.preventDefault()}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-dir={file.type === FileType.DIR}
    >
      <div
        className={`file file-${file.type} ${
          selected.has(file) ? "file-selected" : ""
        }`}
      >
        <FileIcon file={file}></FileIcon>
        <div className='file-name'>{file.name}</div>
        <div className='file-size'>{convertFileSize(file.size)}</div>
        <div className='file-last'>
          {file.name == ".."
            ? ""
            : isNaN(file.date?.getTime())
            ? "N/A"
            : file.date.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export const File = connector(FileUI);

export default File;
