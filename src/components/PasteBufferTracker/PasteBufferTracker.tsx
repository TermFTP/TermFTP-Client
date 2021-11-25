import React, { useEffect, useState } from "react";
import { RootState } from "@store";
import { useDispatch, useSelector } from "react-redux";
import "./PasteBufferTracker.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faAngleDown, faCut, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FileI, FileType } from "@shared";
import FileIcon from "@components/File/FileIcon";
import { clearPasteBuffer } from "@store/filemanager";

export const PasteBufferTracker = (): JSX.Element => {
  const { pasteBuffer } = useSelector(
    ({ fmReducer: { pasteBuffer } }: RootState) => ({ pasteBuffer })
  );
  const [downOpen, setDownOpen] = useState(false);
  const dispatch = useDispatch();

  const files = [];
  for (const f of pasteBuffer?.files || []) {
    files.push(
      <PasteBufferFile file={f} key={f.name + f.type}></PasteBufferFile>
    );
  }
  useEffect(() => {
    if (downOpen && files.length == 0) setDownOpen(false);
  }, [files.length]);

  return (
    <div className="paste-buffer">
      {pasteBuffer?.files.size > 0 && (
        <div
          className={`paste-buffer-part ${downOpen ? "paste-buffer-open" : ""}`}
        >
          <button
            className="paste-buffer-btn"
            onClick={() => setDownOpen(true)}
          >
            <FontAwesomeIcon
              icon={pasteBuffer.type === "copy" ? faCopy : faCut}
            ></FontAwesomeIcon>
          </button>
          <div className="paste-buffer-content-wrapper">
            <div className="paste-buffer-content">
              <div className="paste-buffer-part-header">
                <button
                  className="btn-not-active"
                  onClick={() => setDownOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={pasteBuffer.type === "copy" ? faCopy : faCut}
                  ></FontAwesomeIcon>
                </button>
                <p>{pasteBuffer.dir}</p>
                <button onClick={() => setDownOpen(false)}>
                  <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
                </button>
                <button
                  className="paste-buffer-part-cancel"
                  onClick={() => dispatch(clearPasteBuffer())}
                >
                  <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
                </button>
              </div>
              {files}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PasteBufferFileProps {
  file: FileI;
}
const PasteBufferFile = ({ file }: PasteBufferFileProps) => {
  return (
    <div className="paste-buffer-file">
      <FileIcon
        file={{
          date: new Date(),
          name: file.name,
          size: file.size,
          type: FileType.FILE,
        }}
        className="paste-buffer-file-type"
      ></FileIcon>
      <p className="paste-buffer-file-name">{file.name}</p>
    </div>
  );
};
