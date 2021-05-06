import File from "@components/File/File";
import { normalizeURL } from "@lib";
import { FileType } from "@shared";
import { RootState } from "@store";
import React from "react";
import { useSelector } from "react-redux";

export const Files = (): JSX.Element => {
  const { files } = useSelector(({ ftpReducer: { files } }: RootState) => ({
    files,
  }));
  const pwd = normalizeURL(
    window.location.pathname.replace("/file-manager", "")
  );
  const dotdotExists = files.filter((f) => f.name == "..").length > 0;

  const filtered = files.filter((f) => !(f.name == ".." || f.name == "."));
  return (
    <>
      <div className="file-wrapper">
        <div className="file">
          <div className="file-type"></div>
          <div className="file-name">Name</div>
          <div className="file-size">Size</div>
          <div className="file-last">Last Modified</div>
        </div>
      </div>

      {pwd !== "/" && !dotdotExists && (
        <File
          file={{
            size: 0,
            name: "..",
            type: FileType.DIR,
            date: undefined,
          }}
        ></File>
      )}

      {filtered.map((file) => (
        <File file={file} key={`${file.type}-${file.name}`}></File>
      ))}
    </>
  );
};
