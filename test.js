const { Client, ConnectConfig } = require('ssh2');
const utf8 = require('utf8');

const ssh = new Client();

ssh.on('ready', () => {

  ssh.shell((err, stream) => {
    stream.on('data', (data) => {
      console.log(utf8.decode(data.toString('binary')));
    })
    .on('close', () => {
      ssh.end();
    });

    stream.write('whoami\n')
});
})
.on('close', () => {
  
})
.connect({
  host: "195.144.107.198", 
  port: 22, 
  username: "demo", 
  password: "password", 
  keepaliveInterval: 20000, 
  readyTimeout: 20000,
});