import { addBubble } from "@store/app";
import fs from "fs";
import { basename, join, sep } from "path";
import { FTP } from "./FTP";
import Client from "ftp";

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

export function uploadFile(
  client: FTP,
  filePaths: string[],
  addB: typeof addBubble
): void {
  for (const path of filePaths) {
    const a = client.put(fs.createReadStream(path), basename(path));
    a.catch((err) => {
      addB("mkdir-error", {
        title: err.title || "Failed to upload file",
        message: err.message,
        type: "ERROR",
      });
    });
  }
}

export function uploadFolder(
  client: FTP,
  filePaths: string[],
  addB: typeof addBubble
): void {
  for (const path of filePaths) {
    const files = getAllFiles(path, []);
    const folders = getAllFolders(
      path,
      path.substring(path.lastIndexOf(sep) + 1),
      []
    );

    client
      .createFolder(path.substring(path.lastIndexOf(sep) + 1), false)
      .catch((error) => {
        //folder already exists
        console.info(error);
      });

    for (const folder of folders) {
      client.createFolder(folder, true).catch((error) => {
        //folder already exists
        console.info(error);
      });
    }

    for (const file of files) {
      console.warn(
        "FILEaab:",
        join(path.substring(path.lastIndexOf(sep) + 1), file.split(path)[1])
      );
      const a = client.put(
        fs.createReadStream(file),
        join(path.substring(path.lastIndexOf(sep) + 1), file.split(path)[1])
      );
      a.catch((err) => {
        addB("upload-error", {
          title: err.title || "Failed to upload directory",
          message: err.message,
          type: "ERROR",
        });
      });
    }
  }
}

export function downloadFile(
  client: FTP,
  file: Client.ListingElement,
  path: string
): void {
  client.get(file.name).then((stream) => {
    const ws = fs.createWriteStream(path);
    stream.pipe(ws);
    stream.on("end", () => console.log("DONE"));
  });
}

export async function downloadFolder(
  client: FTP,
  file: Client.ListingElement,
  path: string
): Promise<void> {
  if (file.type === "d") {
    try {
      fs.mkdirSync(join(path, file.name));
    } catch (e) {
      //folder already exists, who cares..
    }
    client.list(file.name).then((items) => {
      items.forEach((i) => {
        i.name = join(file.name, i.name);
        downloadFolder(client, i, path);
      });
    });
  } else if (file.type === "-") {
    downloadFile(client, file, join(path, file.name));
  }
}
