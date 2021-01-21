import Client from "ftp";

export class FTP {
  constructor(config: Client.Options) {
    const c = new Client();
    c.on("ready", function () {
      c.list(function (err, list) {
        if (err) throw err;
        console.log(list);
        c.end();
        console.groupEnd();
      });
    });

    console.groupCollapsed(`FTP Connection: ${config.host}`);
    console.log("Config", config);
    c.connect(config);
  }
}

export default FTP;
