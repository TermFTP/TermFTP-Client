import { ipcMain, nativeImage } from "electron";
import {
  IPCEncryptRequest,
  EncryptionType,
  IPCEncryptReply,
} from "../shared/models";
import { randomBytes, pbkdf2Sync } from "crypto";

ipcMain.on("encrypt", (event, arg: IPCEncryptRequest) => {
  //do the hot stuff

  const salt = Buffer.from(arg.username, "utf-8");

  //https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
  const key = pbkdf2Sync(arg.password, salt, EncryptionType.KEY, 64, "sha256");

  const master = pbkdf2Sync(key, salt, EncryptionType.MASTER, 64, "sha256");

  event.reply(arg.caller + "-encrypt-reply", [
    master.toString("hex"),
    key.toString("hex"),
  ] as IPCEncryptReply);
});

/**
 * https://www.electronjs.org/docs/api/ipc-main
 * const { ipcRenderer } = window.require("electron");
 * ipcRenderer.on('encrypt-reply', (event, arg) => {
    console.log(arg) // prints "pong"
  })
 * ipcRenderer.send("encrypt", "aaaaa, yes - senpai");
 */

const dragIcon = nativeImage.createFromPath("assets/logo.png");
ipcMain.on("ondragstart", (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: dragIcon.resize({ height: 32, width: 32 }),
  });
});
// onDragStart={(e) => {
//   e.preventDefault();
//   e.stopPropagation();
//   console.log("ss");
//   ipcRenderer.send("ondragstart", "D:\\msdia80.dll");
// }}
// draggable={true}
