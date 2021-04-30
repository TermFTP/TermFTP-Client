import { Client, ConnectConfig } from 'ssh2';
import { Terminal } from 'xterm';
import utf8 from 'utf8';
import { finished } from 'node:stream';

export class SSH {

  private ssh: Client;
  private term: Terminal;

  public constructor() {
    this.ssh = new Client();

    window.addEventListener('unload', () => {
      this.ssh.end();
      this.ssh.destroy();
    })
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

            term.onKey(({key, domEvent}) => {
              const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

              if(printable) {
                stream.write(key);
              }

            })

            stream.write('whoami\n')
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