import { convertFileSize, normalizeURL } from "@lib";
import { FileType, FileI } from "@shared";
import { DefaultDispatch, RootState } from "@store";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import { push } from "connected-react-router";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./File.scss";
import FileIcon from "./FileIcon";

const mapState = ({ ftpReducer: { client } }: RootState) => ({ client });
const mapDispatch = (dispatch: DefaultDispatch) => ({
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
  push: (path: string) => dispatch(push(path)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState & {
  file: FileI;
};

function FileUI({ file, push, setContextMenu }: Props): JSX.Element {
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
    >
      <div className={`file file-${file.type}`}>
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
