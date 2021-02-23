import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Client from "ftp";
import React from "react";
import "./File.scss";

interface Props {
  file: Client.ListingElement;
}

export function File({ file }: Props): JSX.Element {
  return (
    <div className="file">
      <div className="file-icon">
        <FontAwesomeIcon
          icon={file.type === "d" ? faFolder : faFile}
        ></FontAwesomeIcon>
      </div>
      {file.name}
    </div>
  );
}

export default File;
