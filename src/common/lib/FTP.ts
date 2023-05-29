// import Client from "ftp";
import { FileI, FTPRequest, FTPRequestType, FTPResponse, FTPResponseType } from "@models";
import { BaseFTP, FTPConfig } from "./BaseFTP";
import { connect } from "socket.io-client";

export interface FTPEventDetails {
	change: "all" | "directory" | "files";
}

const ReqT = FTPRequestType;

export class FTP extends BaseFTP {
	private _pwd: string = undefined;
	private _config: FTPConfig;

	constructor(config: FTPConfig) {
		super();
		this._config = config;
		window.addEventListener("unload", (() => {
			this.disconnect();
		}).bind(this));
	}

	get config(): FTPConfig {
		return this._config;
	}

	connect(callback: (data: FTPResponse) => void, config?: FTPConfig): void {
		const socket = connect('localhost:15000');
		this.socket = socket;
		this._config = config || this._config;

		socket.once('connect', () => {
			socket.emit('ftp', this._config)

			socket.on('ftp:data', (res: FTPResponse) => {
				if (res.type === FTPResponseType.LIST) {
					res.data.files = res.data.files.map((f: any) => ({ ...f, date: new Date(f.date) }))
				}
				callback(res)
			});
		})
			.on('error', (err: any) => {
				callback({ type: FTPResponseType.ERROR, data: err.message })
			})
	}

	private _reconnect(): void {
		//
	}

	private emit(req: FTPRequest) {
		this.socket?.emit("ftp:data", req);
	}

	async pwd(): Promise<string> {
		return new Promise((resolve) => {
			this.socket?.once('ftp:pwd', (res: string) => {
				this._pwd = res;
				resolve(res);
			})
			this.emit({
				type: ReqT.PWD
			})
		})
	}

	list(dir?: string): void {
		this.emit({
			type: ReqT.LIST,
			data: {
				dir
			}
		});
	}

	disconnect(): void {
		try {
			this.socket?.close();
		} catch (e) {
			//
		}
	}

	cd(dir: string): Promise<void> {
		return new Promise((resolve) => {
			this.socket?.once('ftp:cd', () => {
				resolve();
			})
			this.emit({
				type: ReqT.CD,
				data: {
					dir
				}
			})
		})
	}

	// get(
	//   remoteFile: string,
	//   localPath: string,
	// ): void {
	//   this.emit({
	//     type: ReqT.GET,
	//     data: {
	//       localPath,
	//       remotePath: remoteFile
	//     }
	//   })
	// }

	getFiles(files: string[], localPath: string): void {
		this.emit({
			type: ReqT.GET_FILES,
			data: {
				files,
				localPath
			}
		})
	}

	getFolders(remoteFolders: FileI[], localFolder: string): void {
		this.emit({
			type: ReqT.GET_FOLDERS,
			data: {
				localPath: localFolder,
				remoteFolders
			}
		})
	}

	// private async _getFolder(c: Client, file: FileI, path: string): void {
	//   if (file.type === FileType.DIR) {
	//     try {
	//       mkdirSync(join(path, file.name));
	//     } catch (e) {
	//       //folder already exists, who cares..
	//     }
	//     const items = (await c.list(file.name))
	//       .map((v) => ({
	//         type: this.convertFileType(v.type),
	//         date: v.modifiedAt,
	//         name: v.name,
	//         size: v.size,
	//       } as FileI));

	//     await Promise.all(items.map(i => {
	//       i.name = join(file.name, i.name);
	//       return this._getFolder(c, i, path);
	//     }))
	//   } else if (file.type === FileType.FILE) {
	//     await this.get(file.name, join(path, file.name));
	//   }
	// }

	put(source: string, destPath: string): void {
		this.emit({
			type: ReqT.PUT,
			data: {
				localPath: source,
				remotePath: destPath
			}
		})
	}

	mkdir(path: string): void {
		this.emit({
			type: ReqT.MKDIR,
			data: {
				path
			}
		})
	}

	deleteFiles(files: string[]): void {
		this.emit({
			type: ReqT.DELETEFILES,
			data: {
				files
			}
		})
	}

	rmdir(path: string): void {
		this.emit({
			type: ReqT.RMDIR,
			data: {
				path
			}
		})
	}

	rename(oldPath: string, newPath: string): void {
		this.emit({
			type: ReqT.RENAME,
			data: {
				destPath: newPath,
				srcPath: oldPath
			}
		})
	}

	putFiles(files: string[], basePath?: string): void {
		this.emit({
			type: ReqT.PUT_FILES,
			data: {
				files,
				basePath
			}
		})
	}

	putFolders(folders: string[], basePath: string): void {
		this.emit({
			type: ReqT.PUT_FOLDERS,
			data: {
				folders,
				basePath
			}
		})
	}

	copyFolders(basePath: string, folders: FileI[], to: string): void {
		this.emit({
			type: ReqT.COPY_FOLDERS,
			data: { basePath, folders, to }
		})
	}

	copyFiles(basePath: string, files: FileI[], to: string): void {
		this.emit({
			type: ReqT.COPY_FILES,
			data: { basePath, files, to }
		})
	}

	get connected(): boolean { return !this.socket?.disconnected }
}

export default FTP;
