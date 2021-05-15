import { convertFileSize, normalizeURL } from "@lib";
import { FileType, FileI } from "@shared";
import { DefaultDispatch, RootState } from "@store";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import {
  addSelection,
  removeSelection,
  selectFile,
  shiftSelection,
} from "@store/ftp";
import { push } from "connected-react-router";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./File.scss";
import FileIcon from "./FileIcon";

const mapState = ({
  ftpReducer: {
    selection: { selected },
  },
}: RootState) => ({ selected });
const mapDispatch = (dispatch: DefaultDispatch) => ({
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  push: (path: string) => dispatch(push(path)),
  selectFile: (file: FileI) => dispatch(selectFile(file)),
  removeSelection: (file: FileI) => dispatch(removeSelection(file)),
  addSelection: (file: FileI) => dispatch(addSelection(file)),
  shiftSelection: (file: FileI) => dispatch(shiftSelection(file)),
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
}: Props): JSX.Element {
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
      selectFile(file);
    }
  }

  function onContextMenu(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      file,
    });
    if (!selected.has(file)) {
      selectFile(file);
    }
  }

  return (
    <div
      className="file-wrapper"
      data-name={file.name.toLowerCase()}
      onDoubleClick={async () => {
        if (file.type === FileType.DIR) {
          push(`${normalizeURL(window.location.pathname)}/${file.name}`);
        }
      }}
      onContextMenuCapture={onContextMenu}
      onClick={handleClick}
    >
      <div
        className={`file file-${file.type} ${
          selected.has(file) ? "file-selected" : ""
        }`}
      >
        <FileIcon file={file}></FileIcon>
        <div className="file-name">{file.name}</div>
        <div className="file-size">{convertFileSize(file.size)}</div>
        <div className="file-last">{file.date?.toLocaleString()}</div>
      </div>
    </div>
  );
}

export const File = connector(FileUI);

export default File;
