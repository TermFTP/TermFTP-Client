import { ipcMain, nativeImage } from "electron";
import {
  IPCEncryptRequest,
  EncryptionType,
  IPCEncryptReply,
  IPCGetKeyRequest,
  IPCGetKeyReply,
  IPCSaveKeyRequest,
  IPCSaveKeyReply
} from "../shared/models";
import { pbkdf2Sync } from "crypto";
import keytar from "keytar";

ipcMain.on("encrypt", (event, args: IPCEncryptRequest) => {
  //do the hot stuff

  const salt = Buffer.from(args.username, "utf-8");

  //https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
  const key = pbkdf2Sync(args.password, salt, EncryptionType.KEY, 64, "sha256");

  const master = pbkdf2Sync(key, salt, EncryptionType.MASTER, 64, "sha256");

  let res: IPCEncryptReply = [master.toString("hex"), key.toString("hex"), args.username];
  if (args.caller === "register") {
    res = [...res, args.email];
  }

  event.reply(args.caller + "-encrypt-reply", res);
});

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

ipcMain.on("get-key", async (event, args: IPCGetKeyRequest) => {
  try {
    const get = await keytar.getPassword("TermFTP", args.key);
    event.reply(`${args.caller}-get-key-reply`, [true, get] as IPCGetKeyReply);
  } catch (e) {
    event.reply(`${args.caller}-get-key-reply`, [false, undefined] as IPCGetKeyReply);
  }
});

ipcMain.on("save-key", async (event, args: IPCSaveKeyRequest) => {
  try {
    await keytar.setPassword("TermFTP", args.key, args.value);
    event.reply(`${args.caller}-save-key-reply`, true as IPCSaveKeyReply);
  } catch (e) {
    event.reply(`${args.caller}-save-key-reply`, false as IPCSaveKeyReply);
  }
});
