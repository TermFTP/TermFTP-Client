import File from "@components/File/File";
import { checkTag, normalizeURL } from "@lib";
import { FileType } from "@shared";
import { RootState } from "@store";
import { addBubble, setPrompt } from "@store/app";
import {
  clearPasteBuffer,
  setPasteBuffer,
  toggleContextMenu,
} from "@store/filemanager";
import { clearSelection } from "@store/ftp";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const Files = (): JSX.Element => {
  const { files, selected, client, pasteBuffer } = useSelector(
    ({
      ftpReducer: {
        files,
        selection: { selected },
        client,
      },
      fmReducer: { pasteBuffer },
    }: RootState) => ({
      files,
      selected,
      client,
      pasteBuffer,
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
      if (checkTag(el, "input") || el.isContentEditable) return;
    }
    if (e.ctrlKey) {
      const k = e.key.toLowerCase();
      if (k === "c") {
        e?.preventDefault();
        e?.stopPropagation();
        dispatch(
          setPasteBuffer({
            dir: pwd,
            files: selected,
            type: "copy",
          })
        );
      } else if (k === "x") {
        e?.preventDefault();
        e?.stopPropagation();
        dispatch(
          setPasteBuffer({
            dir: pwd,
            files: selected,
            type: "cut",
          })
        );
      } else if (k === "v") {
        e?.preventDefault();
        e?.stopPropagation();
        if (!pasteBuffer) {
          dispatch(
            addBubble("paste:warning", {
              title: "Nothing to paste",
              type: "WARNING",
            })
          );
          return;
        }
        if (pasteBuffer.type === "copy") {
          const dir = normalizeURL(pasteBuffer.dir);
          const folders = [];
          const files = [];
          for (const f of pasteBuffer.files) {
            if (f.type === FileType.DIR) {
              folders.push(f);
            } else if (f.type === FileType.FILE) {
              files.push(f);
            }
          }
          client.copyFiles(dir, files, pwd);
          client.copyFolders(dir, folders, pwd);
        } else {
          const dir = normalizeURL(pasteBuffer.dir);
          for (const f of pasteBuffer.files) {
            client.rename(`${dir}/${f.name}`, `${pwd}/${f.name}`);
          }
        }
        dispatch(clearPasteBuffer());
      }
    } else {
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
        e?.preventDefault();
        e?.stopPropagation();
        dispatch(toggleContextMenu());
      }
    }
  };
  useEffect(() => {
    document.removeEventListener("keyup", keyUp);
    document.addEventListener("keyup", keyUp);
    return () => document.removeEventListener("keyup", keyUp);
  }, [selected]);

  return (
    <>
      <div className="file-wrapper file-header">
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
