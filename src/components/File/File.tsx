import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { convertFileSize, FTP } from "@lib";
import Client from "ftp";
import React from "react";
import "./File.scss";

interface Props {
  file: Client.ListingElement;
  ftp: FTP;
}

export function File({ file, ftp }: Props): JSX.Element {
  return (
    <div
      className={`file file-${file.type}`}
      onDoubleClick={() => {
        if (file.type === "d") {
          ftp.cd(file.name);
        }
      }}
    >
      <div className="file-type">
        <FontAwesomeIcon
          icon={file.type === "d" ? faFolder : faFile}
        ></FontAwesomeIcon>
      </div>
      <div className="file-name">{file.name}</div>
      <div className="file-size">{convertFileSize(file.size)}</div>
      <div className="file-last">{file.date?.toLocaleString()}</div>
    </div>
  );
}

export default File;
