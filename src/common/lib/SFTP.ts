import { connect } from 'socket.io-client';
import { ConnectConfig } from 'ssh2';
import { FTPResponse, FTPResponseType, FTPRequestType, FileI, FTPRequest } from '@models';
import { BaseFTP, FTPConfig, buildSocketURL } from './BaseFTP';

const ReqT = FTPRequestType;

export class SFTP extends BaseFTP {
	private cwd: string;
	private _config: ConnectConfig;

	constructor(config: ConnectConfig) {
		super();
		this.cwd = "";
		this._config = config;
	}

	get config(): FTPConfig {
		return {
			...this._config,
			sshPort: this._config.port,
			user: this._config.username,
			host: this._config.host,
			password: this._config.password,
			port: this._config.port,
		}
	}

	connect(callback: (data: FTPResponse) => void, config?: ConnectConfig): void {
		const socket = connect(buildSocketURL());
		this.socket = socket;
		this._config = config || this._config;

		socket.once('connect', () => {
			socket.emit('sftp', this._config);

			socket.on('sftp:data', (res: FTPResponse) => {
				if (res.type === FTPResponseType.LIST) {
					res.data.files = res.data.files.map(f => ({ ...f, date: new Date(f.date) }))
				}
				callback(res)
			});
		})
			.on('error', (err: any) => {
				callback({ type: FTPResponseType.ERROR, data: err.message });
			});
	}

	private emit(req: FTPRequest): void {
		this.socket?.emit('sftp:data', req);
	}

	disconnect(): void {
		this.socket?.close();
		this.cwd = undefined;
	}

	cd(dir: string): Promise<void> {
		return new Promise((resolve) => {
			this.socket.once("sftp:cd", () => resolve())
			this.emit({
				type: ReqT.CD,
				data: {
					dir
				}
			})
		})
	}

	pwd(): Promise<string> {
		return new Promise((resolve) => {
			this.socket.once('sftp:pwd', (res: string) => {
				this.cwd = res;
				resolve(res);
			})
			this.emit({
				type: ReqT.PWD
			})
		})
	}

	list(dir?: string): void {
		this.emit({
			type: FTPRequestType.LIST,
			data: {
				dir: dir || '',
			}
		})
	}

	getFiles(files: string[], localPath: string): void {
		this.emit({
			type: FTPRequestType.GET_FILES,
			data: {
				files,
				localPath
			}
		})
	}

	rename(oldPath: string, newPath: string): void {
		this.emit({
			type: FTPRequestType.RENAME,
			data: {
				srcPath: oldPath,
				destPath: newPath,
			}
		})
	}

	deleteFiles(files: string[]): void {
		this.emit({
			type: FTPRequestType.DELETEFILES,
			data: {
				files,
			}
		});
	}

	mkdir(path: string): void {
		this.emit({
			type: FTPRequestType.MKDIR,
			data: {
				path,
			}
		});
	}

	rmdir(path: string): void {
		this.emit({
			type: FTPRequestType.RMDIR,
			data: {
				path,
			}
		});
	}

	getFolders(remoteFolders: FileI[], localFolder: string): void {
		this.emit({
			type: ReqT.GET_FOLDERS,
			data: {
				localPath: localFolder,
				remoteFolders
			}
		});
	}

	putFolders(folders: string[], basePath?: string): void {
		this.emit({
			type: ReqT.PUT_FOLDERS,
			data: {
				folders,
				basePath
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

	get connected(): boolean {
		return this.socket?.connected;
	}
}



export default SFTP;