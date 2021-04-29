import { Client, ConnectConfig } from 'ssh2';
import { Terminal } from 'xterm';
import utf8 from 'utf8';

export class SSH {

  private ssh: Client;
  private term: Terminal;

  public constructor() {
    this.ssh = new Client();
  }

  async connect(config: ConnectConfig, term: Terminal): Promise<void> {
    this.term = term;
    return new Promise((resolve, reject) => {
      this.ssh.on('ready', () => {
          term.write("\r\n*** SSH CONNECTION ESTABLISHED ***\n\n");

          this.ssh.shell((err, stream) => {
            if(err) term.write(err.message);

            stream.on('data', (data: any) => {
              term.write(utf8.decode(data.toString('binary')));
            })
            .on('close', () => {
              this.ssh.end();
            });

            stream.write('whoami')
        });
      })
      .on('close', () => {
        term.write("\r\n*** SSH CONNECTION CLOSED ***\n\n");
      })
      .connect(config);
    });
  }

}

export default SSH;