import { basename, join } from "path";
import { Socket } from "socket.io";
import { Client, ConnectConfig, SFTPWrapper } from "ssh2";
import { ClientEvents, ServerEvents, FTPRequest, FTPRequestType, FTPResponse, FTPResponseType, FileI, FileType, ProgressType } from "@models";
import { FileEntry } from "ssh2-streams";
import fs from 'fs';

export const SFTPHandler = (socket: Socket<ClientEvents, ServerEvents>) => (sshConfig: ConnectConfig): void => {
	const ssh = new Client();

	//https://github.com/mscdex/ssh2/blob/master/SFTP.md
	ssh.on('ready', () => {

		let cwd = "";

		const giveCwd = (): string => {
			return cwd;
		}

		ssh.exec('pwd', (err, stream) => {
			stream.on('data', (data: Buffer) => {
				cwd = data.toString().trim() + '/';
			});
		});

		ssh.sftp((err, sftp) => {
			if (err) socket.emit('sftp:data', { type: FTPResponseType.ERROR, data: err.message });

			//default listdir after connection established
			// sftpReadDir(socket, sftp, cwd);
			socket.emit("sftp:data", { type: FTPResponseType.INIT, data: cwd })

			socket.on('sftp:data', async (req: FTPRequest) => {
				switch (req.type) {
					// LIST DIRECTORY
					case FTPRequestType.LIST:
						sftpReadDir(socket, sftp, [cwd, req.data.dir].join(''));
						break;

					// CHANGE DIRECOTRY
					case FTPRequestType.CD:
						if (req.data.dir == '..') {
							cwd = cwd.split('/').slice(0, -2).join('/');
						}
						else if (req.data.dir.startsWith("/")) {
							cwd = req.data.dir
						}
						else
							cwd += req.data.dir;

						if (cwd.endsWith("/")) {
							cwd = cwd.substring(0, cwd.length - 1);
						}

						cwd += "/";
						sftpReadDir(socket, sftp, cwd);
						break;

					// DOWNLOAD FILES
					case FTPRequestType.GET_FILES:
						for (const file of req.data.files) {
							download(socket, sftp, cwd, file, join(req.data.localPath, basename(file)))
						}
						break;

					case FTPRequestType.GET_FOLDERS:
						for (const folder of req.data.remoteFolders) {
							try {
								downloadFolders(socket, sftp, cwd, folder, join(req.data.localPath, folder.name), folder.name);
							} catch (err) {
								sftpErr(socket, { name: "Error uploading " + folder.name, message: err })
							}
						}
						break;

					// UPLOAD FILES
					case FTPRequestType.PUT_FILES:
						for (const file of req.data.files) {
							upload(socket, sftp, file, cwd + (req.data.basePath ? req.data.basePath + "/" : ""));
						}
						break;

					// RENAME / MOVE
					case FTPRequestType.RENAME:
						sftp.rename([cwd, req.data.srcPath].join(''), [cwd, req.data.destPath].join('/'), (err) => {
							if (err) return sftpErr(socket, err);
							sftpReadDir(socket, sftp, cwd);
						});
						break;

					// DELETE
					case FTPRequestType.DELETEFILES:
						try {
							await Promise.all(req.data.files.map(f => deleteFile(sftp, [cwd, f].join(""))));
							sftpReadDir(socket, sftp, cwd);
						} catch (e) {
							sftpErr(socket, e);
						}
						break;

					// RMDIR
					case FTPRequestType.RMDIR:
						try {
							rmDir(socket, sftp, cwd, req.data.path, giveCwd);
						} catch (err) {
							sftpErr(socket, { name: "Error deleting " + req.data.path, message: err })
						}
						break;

					// MKDIR
					case FTPRequestType.MKDIR:
						createDir(socket, sftp, cwd, req.data.path);
						break;

					// PUT FOLDERS
					case FTPRequestType.PUT_FOLDERS:
						for (const path of req.data.folders) {
							createDir(socket, sftp, cwd + (req.data.basePath ? req.data.basePath + "/" : ""), basename(path))
							uploadFolders(socket, sftp, cwd + (req.data.basePath ? req.data.basePath + "/" : ""), path, basename(path))
						}
						break;

					// COPY FOLDERS
					case FTPRequestType.COPY_FOLDERS:
						for (const folder of req.data.folders) {
							copy(ssh, socket, sftp, req.data.basePath, folder, req.data.to, cwd);
						}
						break;

					// COPY FILES
					case FTPRequestType.COPY_FILES:
						for (const file of req.data.files) {
							copy(ssh, socket, sftp, req.data.basePath, file, req.data.to, cwd);
						}
						break;

					case FTPRequestType.PWD:
						socket.emit("sftp:pwd", cwd);
						break;
				}
			});

		});

	})
		.on('error', (err) => sftpErr(socket, err))
		.connect(sshConfig);

}

const deleteFile = (sftp: SFTPWrapper, path: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		sftp.unlink(path, (err) => {
			if (err) reject(err);
			// sftpReadDir(socket, sftp, cwd);
			resolve();
		});
	});
}

const rmDir = async (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, relativePath: string, giveCwd?: () => string) => {
	const files = await readDir(sftp, [cwd, relativePath].join('/'));

	for (const f of files) {
		if (f.type === FileType.DIR) {
			await rmDir(socket, sftp, cwd, [relativePath, f.name].join('/'));
		} else {
			sftp.unlink([cwd, relativePath, f.name].join('/'), (err) => {
				if (err) return sftpErr(socket, err);
			});
		}
	}

	sftp.rmdir([cwd, relativePath].join(''), (err) => {
		if (err) return sftpErr(socket, err);
		if (giveCwd && giveCwd() === cwd) {
			sftpReadDir(socket, sftp, cwd);
		}
	});
}

const download = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, remotePath: string, localPath: string) => {
	sftp.fastGet([cwd, remotePath].join(''), localPath, {
		step: (transferred: number, chunk: number, total: number) => sftpStep(socket, [cwd, remotePath.split('/').slice(0, -1).join('/')].join(''), basename(remotePath), transferred, chunk, total, "download"),
	}, (err) => {
		if (err) sftpErr(socket, err);
	});
}

const downloadFolders = async (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, folder: FileI, localPath: string, relativePath: string) => {
	const files = await readDir(sftp, [cwd, relativePath].join('/'));

	if (!fs.existsSync(localPath))
		fs.mkdirSync(localPath)

	for (const f of files) {
		if (f.type === FileType.DIR) {
			downloadFolders(socket, sftp, cwd, f, join(localPath, f.name), [relativePath, f.name].join('/'));
		} else {
			download(socket, sftp, cwd, [relativePath, f.name].join('/'), join(localPath, f.name));
		}
	}

}

const uploadFolders = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, dirPath: string, relativePath: string) => {
	const files = fs.readdirSync(dirPath);

	for (const f of files) {
		if (fs.statSync(join(dirPath, f)).isDirectory()) {
			createDir(socket, sftp, cwd, [relativePath, f].join('/'));
			uploadFolders(socket, sftp, cwd, join(dirPath, f), [relativePath, f].join('/'));
		} else
			upload(socket, sftp, join(dirPath, f), [cwd, relativePath + "/"].join(''))
	}
}

const createDir = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, cwd: string, path: string) => {
	sftp.mkdir([cwd, path].join('/'), (err) => {
		if (err) return sftpErr(socket, err);
		sftpReadDir(socket, sftp, cwd);
	});
}

const upload = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, localPath: string, cwd: string) => {
	sftp.fastPut(localPath, [cwd, basename(localPath)].join(''), {
		step: (transferred: number, chunk: number, total: number) => sftpStep(socket, cwd, basename(localPath), transferred, chunk, total, "upload"),
	}, (err) => {
		if (err) return sftpErr(socket, err);
		sftpReadDir(socket, sftp, cwd);
	});
}

const sftpStep = (socket: Socket<ClientEvents, ServerEvents>, cwd: string, name: string, transferred: number, chunk: number, total: number, type: ProgressType) => {
	socket.emit('sftp:data', {
		type: FTPResponseType.TRANSFER_UPDATE,
		data: {
			cwd, name, progress: transferred, total, progressType: type
		}
	} as FTPResponse)
}

const sftpErr = (socket: Socket<ClientEvents, ServerEvents>, err: Error) => {
	socket.emit('sftp:data', {
		type: FTPResponseType.ERROR,
		data: err.message,
	} as FTPResponse)
}

function convertSftpFile(file: FileEntry): FileI {
	const type = file.longname.substr(0, 1);
	let t = FileType.UNKNOWN;
	if (type === "-") t = FileType.FILE;
	else if (type === "d") t = FileType.DIR;
	else if (type === "l") t = FileType.SYMBOLIC;
	return {
		date: new Date(file.attrs.mtime),
		name: file.filename,
		size: file.attrs.size,
		type: t
	}
}

const sftpReadDir = (socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, dir: string) => {
	sftp.readdir(dir, (err, list) => {
		if (err) {
			sftpErr(socket, err);
			return;
		}
		const oldList = list;
		const l: FileI[] = oldList.map(convertSftpFile).sort((a, b) => {
			if (a.type === b.type) return a.name.localeCompare(b.name);
			if (a.type === FileType.DIR) return -1;
			return 1;
		})
		socket.emit('sftp:data', {
			type: FTPResponseType.LIST,
			data: {
				files: l,
				pwd: dir
			},
		} as FTPResponse);
	});
}

const readDir = async (sftp: SFTPWrapper, dir: string): Promise<FileI[]> => {
	return new Promise((resolve, reject) => {
		sftp.readdir(dir, (err, list) => {
			if (err) {
				reject(err);
				return;
			}
			const oldList = list;
			const l: FileI[] = oldList.map(convertSftpFile).sort((a, b) => {
				if (a.type === b.type) return a.name.localeCompare(b.name);
				if (a.type === FileType.DIR) return -1;
				return 1;
			})
			resolve(l);
		});
	})
}

const copy = (ssh: Client, socket: Socket<ClientEvents, ServerEvents>, sftp: SFTPWrapper, from: string, file: FileI, to: string, cwd: string) => {
	ssh.exec(`cp -r "${from}/${file.name}" "${to}/${file.name}"`, (err, stream) => {
		if (err) {
			sftpErr(socket, new Error(`Could not copy file ${from} ${err.message}`))
			return;
		}
		const whenDone = (code: number) => {
			if (Number(code) !== 0) {
				sftpErr(socket, new Error(`Could not copy file ${from}`))
				return;
			}
			sftpReadDir(socket, sftp, cwd)
		}
		stream.on('close', whenDone).on("exit", whenDone);
	})
}