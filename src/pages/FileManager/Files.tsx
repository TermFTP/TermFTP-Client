import File from "@components/File/File";
import { normalizeURL } from "@lib";
import { FileType } from "@shared";
import { RootState } from "@store";
import { addBubble, setPrompt } from "@store/app";
import { toggleContextMenu } from "@store/filemanager";
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
      // check if element is either input, editable or a not a file
      if (el.tagName === "input" || el.isContentEditable) return;
    }
    if (e.key === "Backspace" || e.key === "Delete") {
      e?.preventDefault();
      e?.stopPropagation();
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
    } else if (e.key === "F2") {
      e?.preventDefault();
      e?.stopPropagation();
      if (selected.size === 0) {
        dispatch(
          addBubble("files:rename", {
            title: "No file to rename",
            type: "WARNING",
          })
        );
      } else if (selected.size > 1) {
        dispatch(
          addBubble("files:rename", {
            title: "Can't rename multiple files",
            type: "WARNING",
          })
        );
      } else {
        const filename = selected.values().next().value.name;
        dispatch(
          setPrompt({
            fieldName: "file name",
            initial: filename,
            callback: (val) => {
              client.rename(filename, val);
            },
          })
        );
      }
    } else if (e.key.toLowerCase() === "c") {
      dispatch(toggleContextMenu());
    }
  };
  useEffect(() => {
    document.removeEventListener("keyup", keyUp);
    document.addEventListener("keyup", keyUp);
    return () => document.removeEventListener("keyup", keyUp);
  }, [selected]);

  return (
    <>
      <div className="file-wrapper">
        <div className="file">
          <div className="file-icon"></div>
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
