const readline = require("readline");

// контроллер управления игрой через командную строку
module.exports = (gameController, viewController) => {
  readline.emitKeypressEvents(process.stdin); // если бы мы знали что это такое
  process.stdin.setRawMode(true); // мы бы знали что это такое

  let firstKeyPress = false; // установка флага о том что ещё не было нажатия любой клавиши

  viewController.startScreen(); // показ начального экрана

  process.stdin.on("keypress", (str, key) => { // объявление события на нажатия любой клавиши
    if (!firstKeyPress) { // если ещё ни одна из клавиш не была нажата
      firstKeyPress = true; // устанавливаем флаг нажатия первой клавиши
      gameController.startGame(viewController); // запуск игры
    } else {
      if (key.name === "escape") { // если нажата клавиша escape
        gameController.stopGame(); // завершаем игру
        process.exit(0); // выключаем скрипт
      } else { // иначе
        if (!gameController.gameEnd) { // если игры не окончена
          if (gameController.gameInterval) { // если игра идёт
            key.name === "down" && gameController.setAcceleration(); // если клавиша вниз то ускоряем падение фигуры

            key.name === "up" && gameController.rotateFigure(1); // если клавиша вверх то поворачиваем фигуру по часовой стрелке

            ["right", "left"].includes(key.name) && gameController.moveFigure(key.name); // если стрелки влево/вправо то двигаем фигуру по оси x
          }

          if (key.name === "p") { // если нажата клавиша p
            gameController.gameInterval ? // если игра идёт
              gameController.stopGame(false, true) : // останавливаем игру
              gameController.startGame(); // если не идет то запускаем
          }
        }

        key.name === "r" && gameController.restartGame(); // если нажата клавиша r то перезапускаем игру
      }
    }
  });
};
