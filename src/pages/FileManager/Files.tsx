import File from "@components/File/File";
import { normalizeURL } from "@lib";
import { FileType } from "@shared";
import { RootState } from "@store";
import { clearSelection } from "@store/ftp";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const Files = (): JSX.Element => {
  const { files, selected, client } = useSelector(
    ({
      ftpReducer: {
        files,
        selection: { selected },
        client,
      },
    }: RootState) => ({
      files,
      selected,
      client,
    })
  );
  const pwd = normalizeURL(
    window.location.pathname.replace("/file-manager", "")
  );
  const dotdotExists = files.filter((f) => f.name == "..").length > 0;

  const filtered = files.filter((f) => !(f.name == ".." || f.name == "."));
  const dispatch = useDispatch();

  const keyUp = (e: KeyboardEvent): void => {
    if (e?.target) {
      const el = e.target as HTMLElement;
      if (el.tagName === "input" || el.isContentEditable) return;
    }
    if (e.key === "Backspace" || e.key === "Delete") {
      e?.preventDefault();
      e?.stopPropagation();
      // console.log("slec", selected);
      const files = [];
      for (const f of selected) {
        if (f.type === FileType.DIR) {
          client.rmdir(f.name);
        } else {
          files.push(f.name);
        }
      }
      client.deleteFiles(files);
      dispatch(clearSelection());
    }
  };
  useEffect(() => {
    document.removeEventListener("keyup", keyUp);
    document.addEventListener("keyup", keyUp);
    // if (selected.size > 0) {
    //   console.log("updated", selected);
    //   setListening(true);
    // } else if (selected.size === 0) {
    //   document.removeEventListener("keyup", keyUp);
    //   setListening(false);
    // }
    return () => document.removeEventListener("keyup", keyUp);
  }, [selected]);

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
