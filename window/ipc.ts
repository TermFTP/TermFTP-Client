import { ipcMain, nativeImage } from "electron";
import {
	IPCEncryptRequest,
	EncryptionType,
	IPCEncryptReply,
	IPCGetKeyRequest,
	IPCGetKeyReply,
	IPCSaveKeyRequest,
	IPCSaveKeyReply,
	IPCDeleteKeyRequest,
} from "../src/shared/models";
import { pbkdf2Sync } from "crypto";
import keytar from "keytar";

ipcMain.handle("encrypt", (event, args: IPCEncryptRequest) => {
	//do the hot stuff

	const salt = Buffer.from(args.username, "utf-8");

	//https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
	const key = pbkdf2Sync(args.password, salt, EncryptionType.KEY, 64, "sha256");

	const master = pbkdf2Sync(key, salt, EncryptionType.MASTER, 64, "sha256");

	let res: any = [master.toString("hex"), key.toString("hex"), args.username];
	if (args.caller === "register") {
		res = [...res, args.email];
	} else {
		res = [...res, args.autoLogin];
	}

	return res as IPCEncryptReply;
});

const dragIcon = nativeImage.createFromPath("assets/logo.png");
ipcMain.on("ondragstart", (event, filePath) => {
	event.sender.startDrag({
		file: filePath,
		icon: dragIcon.resize({ height: 32, width: 32 }),
	});
});

ipcMain.handle("get-key", async (event, args: IPCGetKeyRequest): Promise<IPCGetKeyReply> => {
	try {
		const get = await keytar.getPassword("TermFTP", args.key);
		return { result: true, val: get };
	} catch (e) {
		return { result: false, val: undefined, err: e };
	}
});

ipcMain.handle("save-key", async (event, args: IPCSaveKeyRequest): Promise<IPCSaveKeyReply> => {
	try {
		await keytar.setPassword("TermFTP", args.key, args.value);
		return { result: true };
	} catch (e) {
		return { result: false, err: e };
	}
});

ipcMain.handle("logout", async (event, args: IPCDeleteKeyRequest): Promise<void> => {
	try {
		await keytar.deletePassword("TermFTP", args.key);
		return;
	} catch (e) {
		return;
	}
});
