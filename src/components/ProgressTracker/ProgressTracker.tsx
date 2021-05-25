import FileIcon from "@components/File/FileIcon";
import {
  faAngleDown,
  faDownload,
  faTimes,
  faTimesCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileType } from "@shared";
import { DefaultDispatch, RootState } from "@store";
import { ProgressFileI, removeProgressFiles } from "@store/filemanager";
import React, { useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch } from "react-redux";
import "./ProgressTracker.scss";

const mapState = ({ fmReducer: { progressFiles } }: RootState) => ({
  progressFiles,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  removeProgressFiles: (files: ProgressFileI[]) =>
    dispatch(removeProgressFiles(files)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function ProgressTrackerUI({ progressFiles }: Props): JSX.Element {
  const uploads = [];
  const downloads = [];
  for (const file of progressFiles.values()) {
    if (file.progressType === "download") downloads.push(file);
    else if (file.progressType === "upload") uploads.push(file);
  }
  const [downOpen, setDownOpen] = useState(false);
  const [upOpen, setUpOpen] = useState(false);
  useEffect(() => {
    if (upOpen && uploads.length == 0) setUpOpen(false);
  }, [uploads.length]);
  useEffect(() => {
    if (downOpen && downloads.length == 0) setDownOpen(false);
  }, [downloads.length]);
  console.log(downloads);

  return (
    <div className="progress-tracker">
      <div className={`progress-part ${downOpen ? "progress-open" : ""}`}>
        <button
          className="progress-tracker-btn"
          onClick={() => setDownOpen(true)}
        >
          <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
        </button>
        <div className="progress-content-wrapper">
          <div className="progress-content">
            <div className="progress-part-header">
              <p>Downloads</p>
              <button onClick={() => setDownOpen(false)}>
                <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
              </button>
              <button className="progress-part-cancel">
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
              </button>
            </div>
            {downloads.map((f) => (
              <ProgressFile file={f} key={f.cwd + f.name}></ProgressFile>
            ))}
          </div>
        </div>
      </div>
      <div className={`progress-part ${upOpen ? "progress-open" : ""}`}>
        <button
          className="progress-tracker-btn"
          onClick={() => setUpOpen(true)}
        >
          <FontAwesomeIcon icon={faUpload}></FontAwesomeIcon>
        </button>
        <div className="progress-content-wrapper">
          <div className="progress-content">
            <div className="progress-part-header">
              <p>Uploads</p>
              <button onClick={() => setUpOpen(false)}>
                <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
              </button>
              <button className="progress-part-cancel">
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
              </button>
            </div>
            {uploads.map((f) => (
              <ProgressFile file={f} key={f.cwd + f.name}></ProgressFile>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressFileProps {
  file: ProgressFileI;
}
const ProgressFile = ({ file }: ProgressFileProps) => {
  const dispatch = useDispatch();
  return (
    <div className="progress-file">
      <FileIcon
        file={{
          date: new Date(),
          name: file.name,
          size: file.total,
          type: FileType.FILE,
        }}
        className="progress-file-type"
      ></FileIcon>
      <div className="progress-file-name">{file.name}</div>
      <div className="progress-file-right">
        <div className="progress-status"></div>
        <button
          className="progress-file-cancel"
          onClick={() => dispatch(removeProgressFiles([file]))}
        >
          <FontAwesomeIcon icon={faTimesCircle}></FontAwesomeIcon>
        </button>
      </div>
    </div>
  );
};

export const ProgressTracker = connector(ProgressTrackerUI);
export default ProgressTracker;
