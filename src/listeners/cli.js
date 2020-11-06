const readline = require("readline");

// контроллер управления игрой через командную строку
module.exports = cb => {
  readline.emitKeypressEvents(process.stdin); // если бы мы знали что это такое
  process.stdin.setRawMode(true); // мы бы знали что это такое
  process.stdin.on("keypress", (str, key) => cb(key.name)); // объявление события на нажатия любой клавиши
};
