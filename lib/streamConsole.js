const rl = require("readline");

// монипуляции с консолью ssh клиента

// отдаёт аналог console. Принимает кол-во вертикальных строк терминала и интерфейс со стримом
module.exports = (readline, stream) => ({
  log: str => readline.write(`${str}\n`), // отобразить что нибудь
  clear: str => { // очистить экран
    rl.cursorTo(stream, 0, 0); // установка позиции курсора в верхний левый угол экрана
    rl.clearScreenDown(stream); // очистка всех строк под курсором
  }
});
