import { FileI, FileType } from "@models";
import { addBubble } from "@store/app";
import fs from "fs";
import { basename, join, sep } from "path";
import { BaseFTP } from "./BaseFTP";
// import Client from "BaseFTP";

function getAllFiles(dirPath: string, arrayOfFiles: string[]) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

function getAllFolders(
  dirPath: string,
  relative: string,
  arrayOfFolders: string[]
) {
  const files = fs.readdirSync(dirPath);

  arrayOfFolders = arrayOfFolders || [];

  files.forEach((file) => {
    if (fs.statSync(join(dirPath, file)).isDirectory()) {
      arrayOfFolders = getAllFolders(
        join(dirPath, file),
        join(relative, file),
        arrayOfFolders
      );
      arrayOfFolders.push(join(relative, file));
    }
  });

  return arrayOfFolders;
}

export async function uploadFile(
  client: BaseFTP,
  filePaths: string[],
  addB: typeof addBubble
): Promise<void> {
  for (const path of filePaths) {
    try {
      await client.put(path, basename(path));
    } catch (err) {
      addB("mkdir-error", {
        title: err.title || "Failed to upload file",
        message: err.message,
        type: "ERROR",
      });
    }
  }
}

export async function uploadFolder(
  client: BaseFTP,
  filePaths: string[],
  addB: typeof addBubble
): Promise<void> {
  for (const path of filePaths) {
    const files = getAllFiles(path, []);
    const folders = getAllFolders(
      path,
      path.substring(path.lastIndexOf(sep) + 1),
      []
    );

    try {
      await client.mkdir(path.substring(path.lastIndexOf(sep) + 1));
    } catch (e) {
      console.info(`folder already exists`);
    }

    for (const folder of folders) {
      try {
        await client.mkdir(folder);
      } catch (e) {
        console.info(`folder already exists`);
      }
    }

    for (const file of files) {
      // console.warn(
      //   "FILEaab:",
      //   join(path.substring(path.lastIndexOf(sep) + 1), file.split(path)[1])
      // );
      try {
        await client.put(
          file,
          join(path.substring(path.lastIndexOf(sep) + 1), file.split(path)[1])
        );
      } catch (err) {
        addB("upload-error", {
          title: err.title || "Failed to upload directory",
          message: err.message,
          type: "ERROR",
        });
      }
    }
  }
}

export async function downloadFile(
  client: BaseFTP,
  file: FileI,
  path: string
): Promise<void> {
  await client.get(file.name, path);
  return Promise.resolve();
}

export async function downloadFolder(
  client: BaseFTP,
  file: FileI,
  path: string
): Promise<void> {
  if (file.type === FileType.DIR) {
    try {
      fs.mkdirSync(join(path, file.name));
    } catch (e) {
      //folder already exists, who cares..
    }
    const items = await client.list(file.name);
    for (const i of items) {
      i.name = join(file.name, i.name);
      await downloadFolder(client, i, path);
    }
  } else if (file.type === FileType.FILE) {
    await downloadFile(client, file, join(path, file.name));
  }
}
