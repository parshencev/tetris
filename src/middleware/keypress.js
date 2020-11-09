// прослойка для реализации действий в игре по нажатию клавиш

const defaultEnd = () => process.exit(0); // выключаем скрипт

module.exports = class KeypressMiddleware {
  constructor(gameController, viewController, endHandle = defaultEnd){
    this.gameController = gameController; // запись ссылки на конттроллер игры
    this.viewController = viewController; // запись ссылки на контроллер отображения
    this.firstKeypress = false; // установка флага первого нажатия клавиши на отрицательное значение
    this.keypress = this.keypress.bind(this); // привязка функции к экземпляру класса
    this.endHandle = endHandle;
  }

  // функция - обработчик нажатия клавиши. Принимает идетификатор нажатия клавиши
  keypress(key){
    const { gameController } = this;

    if (!this.firstKeypress) { // если ещё ни одна из клавиш не была нажата
      this.firstKeypress = true; // установка флага первого нажатия клавиши на положительное значение
      gameController.startGame(this.viewController); // запуск игры
    } else {
      if (key === "escape") { // если нажата клавиша escape
        gameController.stopGame(); // завершаем игру
        this.endHandle && this.endHandle(); // вызываем функцию отключения
      } else { // иначе
        if (!gameController.gameEnd) { // если игры не окончена
          if (gameController.gameInterval) { // если игра идёт
            key === "down" && gameController.setAcceleration(); // если клавиша вниз то ускоряем падение фигуры

            key === "up" && gameController.rotateFigure(1); // если клавиша вверх то поворачиваем фигуру по часовой стрелке

            ["right", "left"].includes(key) && gameController.moveFigure(key); // если стрелки влево/вправо то двигаем фигуру по оси x
          }

          if (key === "p") { // если нажата клавиша p
            gameController.gameInterval ? // если игра идёт
              gameController.stopGame(false, true) : // останавливаем игру
              gameController.startGame(); // если не идет то запускаем
          }
        }

        key === "r" && gameController.restartGame(); // если нажата клавиша r то перезапускаем игру
      }
    }
  }
}
