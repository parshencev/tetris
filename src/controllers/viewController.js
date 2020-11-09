const { flatten } = require("lodash"),
      chalk = require("chalk"),
      declint = require("declint-ru"),
      Figure = require("../models/figure"),
      background = " ",
      block = "█",
      line = {
        vertical: "┃",
        horizontal: "━"
      },
      angle = {
        bottom: {
          right: "┛",
          left: "┗"
        },
        top: {
          right: "┓",
          left: "┏"
        }
      },
      controlsInfo = `${[
        "ESC  выход",
        " ↑   Повернуть фигуру по часовой стрелке",
        "← →  Подвинуть влево/вправо",
        " ↓   Ускорить/Замедлить фигуру",
        " p   поставить игру на паузу/возвратить игру",
        " r   перезапуск игры"
      ].join("\n")}\n`,
      declintSpeed = num => declint(num, ["%s клетка", "%s клетки", "%s клеток"]),
      declintLevel = num => declint(num, ["%s очко", "%s очка", "%s очков"]);

// контроллер отображения. Принимает объект поля

module.exports = class ViewController {
  constructor(gameController, console){
    this.gameController = gameController; // контроллер игры
    this.field = gameController.field; // объект поля игры
    this.console = console;
  }

  // показать начальный экран
  startScreen(){
    this.console.clear(); // очищение консоли
    this.console.log(`${controlsInfo}\nнажмите любую клавишу для начала игры`); // отображение управления и что нужно сделать для начала игры
  }

  // отображение кадра игры
  render(){
    this.console.clear(); // очищение консоли
    this.console.log(controlsInfo); // отображение инофрмации об управлении
    const { width, height, figures } = this.field, // получение ширины, высоты и фигур на поле
          pixels = flatten(figures.map(({ pixelsArray }) => pixelsArray.map(({ positionX, positionY, color }) => ({ positionX, positionY, color })))), // массив всех пикселей на поле
          delimiter = line.horizontal.repeat(width), // разделитель
          displayTextArray = []; // массив строк для отображения на экране

    displayTextArray.push(`${angle.top.left}${delimiter}${angle.top.right}`); // добавление в отображение верхней рамки поля

    for (let y = 0; y < height; y++) { // цикл по высоте поля
      let rowText = line.vertical; // добавлеине в строку вертикальной линии

      for (let x = 0; x < width; x++) { // цикл по ширине поля
        // поиск пикселя для данной кординаты на строке
        const pixel = pixels.find(({ positionX, positionY }) => positionX === x && positionY === y);

        rowText += !pixel ? background : chalk.hex(pixel.color)(block); // добавление в строку заднего фона если пикселя нет, или закрашенного блока по цвету пикселя
      }

      displayTextArray.push(`${rowText}${line.vertical}`); // добавление строки вместе с вертикальной линией в конце
    }

    const config = this.gameController.figuresArray[this.gameController.nextFigureConfigIndex], // получение конфига будущей фигуры
          nextFigure = new Figure(config, 0, 0, config.color), // создание будущей фигуры
          speed = Math.floor(1/this.gameController.speed), // расчёт скорости игры для отображения
          { level, removedPixels, removedFigures, score, acceleration, pause, gameEnd, levelThreshold } = this.gameController, // получение различной информации о состоянии игры для отображения
          pointsToNextLevel = levelThreshold * level - score, // расчёт оставшихся очков до следующего уровня игры
          margin = " ".repeat(6), // отступ от поля игры справа
          insertInMarginCenter = text => {
            const border = " ".repeat((margin.length - text.length) / 2);
            return `${border}${text}${border}`;
          }; // функция для вставки текста в центр отступа

    displayTextArray[0] += `${margin}Следующая фигура:`; // отображение справа от поля сверху

    for (let y = 0; y <= nextFigure.height; y++) { // цикл по высоте будущей фигуры
      displayTextArray[y + 2] += margin; // добавление отступа начиная со 2-й сверху строки справа от поля

      for (let x = 0; x <= nextFigure.width; x++) { // цикл по ширине фигуры
        // поиск пикеля фигуры
        const pixel = nextFigure.pixelsArray.find(({ positionX, positionY }) => positionX === x && positionY === y);

        displayTextArray[y + 2] += !pixel ? background : chalk.hex(pixel.color)(block); // если пиксель найден то добавление в строку блока в цвет пикселя или фона
      }
    }

    displayTextArray.push(`${angle.bottom.left}${delimiter}${angle.bottom.right}`); // отображение нижней черты поля

    // отображение снизу вверх справа от поля данных о счёте игры и её текущих параметрах
    displayTextArray[displayTextArray.length - 6] += `${margin}Состояние игры: ${gameEnd ? "Конец игры" : pause ? "Пауза" : "Запущена"}`;
    displayTextArray[displayTextArray.length - 5] += `${acceleration ? insertInMarginCenter("x2") : margin}Скорость падения фигуры: ≈${declintSpeed(speed)} в секунду`;
    displayTextArray[displayTextArray.length - 4] += `${margin}Уровень игры: ${level} (до следующего уровня осталось ${declintLevel(pointsToNextLevel)})`;
    displayTextArray[displayTextArray.length - 3] += `${margin}Кол-во удалённых пикселей (+1 очко): ${removedPixels}`;
    displayTextArray[displayTextArray.length - 2] += `${margin}Кол-во удалённых фигур (+10 очков): ${removedFigures}`;
    displayTextArray[displayTextArray.length - 1] += `${margin}Счёт: ${score}`;

    const displayText = displayTextArray.join("\n"); // соединение всех строк для отображения в единый текст

    this.console.log(displayText); // отображение на экране
    return displayText; // возврат текста для отображения
  }
}
