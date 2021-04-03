import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BaseFTP, convertFileSize } from "@lib";
import { FileI, FileType } from "@models";
import { DefaultDispatch } from "@store";
import { ContextMenuProps, setContextMenu } from "@store/filemanager";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import "./File.scss";

const mapState = () => ({});
const mapDispatch = (dispatch: DefaultDispatch) => ({
  setContextMenu: (contextMenu: ContextMenuProps) =>
    dispatch(setContextMenu(contextMenu)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState & {
  file: FileI;
  ftp: BaseFTP;
};

function FileUI({ file, ftp, setContextMenu }: Props): JSX.Element {
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
          await ftp.cd(file.name);
        }
      }}
      onContextMenuCapture={onContextMenu}
    >
      <div className={`file file-${file.type}`}>
        <div className="file-type">
          <FontAwesomeIcon
            icon={file.type === FileType.DIR ? faFolder : faFile}
          ></FontAwesomeIcon>
        </div>
        <div className="file-name">{file.name}</div>
        <div className="file-size">{convertFileSize(file.size)}</div>
        <div className="file-last">{file.date?.toLocaleString()}</div>
      </div>
    </div>
  );
}

export const File = connector(FileUI);

export default File;
