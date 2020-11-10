const ssh2 = require("ssh2"),
      fs = require("fs"),
      path = require("path"),
      appRootPath = require("app-root-path").toString(),
      { emitKeypressEvents, createInterface } = require("readline"),
      streamConsole = require("../../lib/streamConsole"),
      keysFolderPath = path.resolve(appRootPath, "keys"),
      connections = [],
      deleteConnection = ip => {
        const index = connections.findIndex(({ ip:i }) => i === ip);

        !!~index && connections.splice(index, 1);
      },
      newConnection = (ip, username) => connections.push({ ip, username }),
      getConnection = ip => connections.find(({ ip:i }) => i === ip),
      isConnnect = ip => !!~connections.findIndex(({ ip:i }) => i === ip),
      { port:defaultPort, host:defaultHost } = require("config").get("ssh-server");

!fs.existsSync(keysFolderPath) && fs.mkdirSync(keysFolderPath);

const hostKeys = fs.readdirSync(keysFolderPath).map(fileName => fs.readFileSync(path.resolve(keysFolderPath, fileName)));

module.exports = (createGame, { host, port, ...serverProps } = {}) => new ssh2.Server({...serverProps, hostKeys: hostKeys || []}, (client, { ip }) => {
  client.on("authentication", ctx => {
    newConnection(ip, ctx.username);
    ctx.accept();
  }).on("ready", () => {
    client.on("session", accept => {
      accept()
        .on("pty", (accept, reject) => {
          accept & accept();
        })
        .on("shell", accept => {
          const stream = accept();

          let connection = getConnection(ip);
          connection.stream = stream;

          emitKeypressEvents(stream);

          const readline = createInterface({ // Интерфейс для считывания строк
            input: stream,
            output: stream,
            prompt: "> ",
            historySize: 0,
            terminal: true
          });

          stream.on("keypress", (str, key) => isConnnect(ip) && getConnection(ip).cb(key.name));

          connection.cb = createGame(streamConsole(readline, stream), () => {
            stream.end();
            deleteConnection(ip);
          });
        });
      });
  }).on("end", () => deleteConnection(ip));
}).listen(port || defaultPort, host || defaultHost);
