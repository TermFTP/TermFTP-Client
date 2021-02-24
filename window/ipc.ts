import { ipcMain } from "electron";
import { IPCEncryptRequest, EncryptionType } from "../shared/models";
import { randomBytes, pbkdf2Sync } from "crypto";

ipcMain.on("encrypt", (event, arg: IPCEncryptRequest) => {
  //do the hot stuff

  const salt = randomBytes(16);

  //https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
  const key = pbkdf2Sync(arg.password, salt, EncryptionType.KEY, 64, "sha256");

  const master = pbkdf2Sync(key, salt, EncryptionType.MASTER, 64, "sha256");

  event.reply(arg.caller + "-encrypt-reply", {
    master: master.toString("hex"),
    key: key.toString("hex"),
  });
});

/**
 * https://www.electronjs.org/docs/api/ipc-main
 * const { ipcRenderer } = window.require("electron");
 * ipcRenderer.on('encrypt-reply', (event, arg) => {
    console.log(arg) // prints "pong"
  })
 * ipcRenderer.send("encrypt", "aaaaa, yes - senpai");
 */
