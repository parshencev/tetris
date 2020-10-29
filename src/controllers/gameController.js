const Field = require("../models/field"),
      Figure = require("../models/figure"),
      random = require("../../lib/random"),
      moment = require("moment"),
      Log = require("../models/log"),
      crypto = require("crypto"),
      generateGameId = () => crypto.createHash("sha256").update(moment().toString()).digest("hex"), // генерация хеша от текущей даты и времени
      getAction = (name, data) => ({ name, ...data }); // получение объекта события

// контроллер игры. Принимает ширину поля, высоу поля, скорость для движения фигур по умолчанию и допустимые в игре фигуры

module.exports = class GameController {
  constructor(width, height, speed, figuresArray){
    this.width = width; // ширина поля
    this.height = height; // высота поля
    this.figuresArray = figuresArray; // допустимые в игре фигуры (параметры для создания)
    this.field = new Field(width, height); // поле игры
    this.removedPixels = 0; // установка кол-во удаленных пикселей
    this.removedFigures = 0; // установка кол-во удаленных фигур
    this.gameId = generateGameId(); // установка идентификатора игры
    this.level = 1; // уровень игры
    this.levelThreshold = 500; // разница в очках для перехода на следующий уровень
    this.speed = speed / this.level; // скорость движения фигур на поле по умолчанию

    this.generateNextStepFigureConfigIndex(); // генерация индекса конфига первой фигуры на поле

    this.log(getAction("Создание контроллера игры"), { figuresArray }); // запись в лог
  }

  // получение главной фигуры на поле
  get mainFigure(){
    const { figures } = this.field; // объявление массива фигур на поле

    return figures.find(({ main }) => main); // поиск фигуры с пометкой как главная
  }

  // получение счёта игры
  get score(){
    return this.removedPixels + (this.removedFigures * 10);
  }

  // логирование действия игры
  log(action, data){
    const { removedPixels, removedFigures, speed, acceleration, gameEnd } = this; // получение основных параметров игры
    // запись в лог
    Log.game(this.gameId, action, this.field, { ...data, removedPixels, removedFigures, speed, acceleration, gameEnd });
  }

  // на рандом генерируется индекс конфига следующей фигуры
  generateNextStepFigureConfigIndex(){
    this.nextFigureConfigIndex = random(0, this.figuresArray.length - 1); // запись рандомного индекса следующией фигуры
  }

  // создание новой фигуры на поле. Принимает цвет
  createFigure(color){
    const figureConfig = this.figuresArray[this.nextFigureConfigIndex], // получение конфига фигуры.
          figure = new Figure(figureConfig, 0, 0, color || figureConfig.color), // новая фигура. Если цвет не передан, то он береттся из конфига
          positionX = random(0, this.width - figure.width /*+ 1*/), // случайная координата x с вычетом ширины фигуры (0 левый край поля)
          positionY = figure.height * -1, // координата y (0 верх поля)
          { mainFigure } = this; // поулчение главной фигуры

    figure.setPosition(positionX, positionY); // установка позиции фигуры на поле

    mainFigure && (mainFigure.main = false); // установка пометки для предыдущей главной фигуры о том что она не является больше главной
    figure.main = true; // установка пометки для сгенерированной фигуры как главная

    this.field.addFigure(figure); // добавление фигуры на поле

    this.log(getAction("Создание фигуры на поле", { figureConfig, positionX, positionY, color })); // запись в лог

    return figure; // возврат объекта фигуры
  }

  // установка нового уровня
  levelUp(level = this.level + 1){ // если не передан уровень, то добавляется + 1 к текущему
    this.level = level; // утановка нового уровня
    this.speed /= level; // уставнока новой скорости игры

    this.stopGame(); // оставнока игры (удаление интервала)
    this.startGame(); // запуск игры (установка нового интервала)
  }

  // запуск игры. Принимает контроллер отображения.
  startGame(viewController){
    viewController ?
      (this.viewController = viewController) : // установка контроллера отображения если он передан
      (viewController = this.viewController); // объявление контроллера из объекта контроллера если он не передан

    !this.gameId && (this.gameId = generateGameId()); // установка идентификатора игры если его нет
    this.pause = false; // установка флага о том что игра не остановлена

    // функция для создания фигуры и выбора конфига для следующей фигуры
    const nextStep = () => {
      this.acceleration && this.setAcceleration(); // остановка ускорения фигуры если она есть

      const { figures, pixels } = this.field.deleteFullRowPixels(); // удаление полных строк на поле со смещением пикселей вниз и получение кол-ва удаленных фигур и пикселей

      this.removedPixels += pixels; // запись кол-ва удаленных пикселей
      this.removedFigures += figures; // запись кол-ва удаленных пикселей

      this.log(getAction("Удаление полных строк со смещением", { figures, pixels })); // запись в лог

      if (pixels > 0) {
        const nextLevel = Math.ceil(this.score / this.levelThreshold); // расчёт следующего уровня
        nextLevel > this.level && this.levelUp(nextLevel); // если следующий уровень больше текущего то устанавливаем новый уровень
      }

      this.createFigure(); // генерация новой фигуры на поле
      this.generateNextStepFigureConfigIndex(); // выбор рандомного индекса конфига следующей фигуры
    };

    // установка id интервала игры в объект контроллера
    this.gameInterval = setInterval(() => {
      const last = this.mainFigure, // получение главной фигуры на поле
            move = num => last.setPosition(last.positionX, last.positionY + num); // функция для смещения главной фигуры по y координате. Принимает число для смещения

      if (last) { // если на поле имеется хотябы одна последнаяя фигура и она не белого цвета
        move(1); // смещение главной фигуры на поле на 1 клетку вниз по оси y

        const outFieldBottom = this.field.checkOutOfField("bottom"); // проверка пересечения нижней части поля одной из фигур
        let intersection = false; // запись о том что нет пересечений фигур

        // если фигура пересекла нижнюю границу поля или пересеклась своими пикселями с другой фигурой на поле
        if (outFieldBottom || this.field.checkIntersection()) {
          !outFieldBottom && (intersection = true); // запись о том что есть пересечение фигур, если нет пересечения нижней границы поля
          move(-1); // смещение главной фигуры на поле на 1 клетку вверх по оси y

          // если фигура пересекает верхнюю границу поля, то игра останавливается, иначе идет генерация следующей фигуры
          if (this.field.checkOutOfField("top")) this.stopGame(true);
          else {
            last.setColor("#FFFFFF"); // установка белого цвета для главной фигуры
            nextStep();
          }
        }

        this.log(getAction("Смещение фигуры вниз", { last, outFieldBottom, intersection })); // запись в лог
      } else { // если на поле нет фигур
        nextStep(); // генерация фигуры
      }

      viewController.render(); // рендер сцены
    }, this.speed * 1000 / (this.acceleration ? 2 : 1)); // установка времени интервала. 1 = 1 миллисекунда
  }

  // ускорение/торможение движения блока. Если блок ускорен, то уменьшает его скорость, если он не ускорен, то ускоряет
  setAcceleration(){
    this.acceleration = this.acceleration ? false : true; // установка маркера ускорения фигуры противоположно текущему или положительный, если его нет

    this.stopGame(); // оставнока игры (удаление интервала)
    this.startGame(); // запуск игры (установка нового интервала)
  }

  // остановка игры
  stopGame(gameEnd = false, pause = false){
    this.gameEnd = gameEnd; // установка флага о том что игра закончилась

    if (this.pause !== pause) { // если флаг остановки игры отличается от текущего
      this.pause = pause; // установка флага о том что игра остановлена/возобнавлена
      this.viewController.render(); // перерисовываем сцену
    }

    clearInterval(this.gameInterval); // удаление интервала игры по его id
    this.gameInterval = null; // удаление id интервала из контроллера
  }

  // подвинуть фигуру по оси x. Принимает направление "right" или "left"
  moveFigure(direction){
    const figure = this.mainFigure, // получение главной фигуры на поле
          lastPosition = figure.positionX, // получение последней позии фигуры по оси x
          positionX = figure.positionX + (1 * (direction === "left" ? -1 : 1)); // новая позиция фигуры по оси x.

    // если новая позиция меньше или равна ширине поля или больше или равна 0
    if (positionX <= this.field.width - figure.width && positionX >= 0) {
      figure.setPosition(positionX, figure.positionY); // установка новой координаты для фигуры по оси x
      // если фигура пересекает другую фигуру на поле, то устанавливается старая координата по оси x
      this.field.checkIntersection() && figure.setPosition(lastPosition, figure.positionY);
      this.viewController.render(); // рендер сцены
    }

    this.log(getAction("Смещение фигуры в бок", { lastPosition, positionX, figure })); // запись в лог
  }

  // повернуть последнюю фигуру на поле по часовой стрелке на 90
  rotateFigure(){
    const figure = this.mainFigure, // получение главной фигуры на поле
          { field } = this; // получение объекта поля

    figure.rotate(1); // поворот фигуры на 90 градусов
    let rotated = true; // установка флага о том что фигура повёрнута

    // если есть пересечение фигур на поле или одна из фигур вышла за его пределы
    if (field.checkIntersection() || field.checkOutOfField()) {
      figure.rotate(-1); // поворот фигуры на -90 градусов
      rotated = false; // отмена флага поворота фигуры
    }

    rotated && this.viewController.render(); // если флаг поворотта фигуры положительный то отрисовать сцену

    this.log(getAction("Поворот фигуры по часовой стрелке", { figure, rotated })); // запись в лог
  }

  // перезапуск игры
  restartGame(){
    const lastGameId = this.gameId;

    this.gameInterval && this.stopGame(true); // остановка игры если она запущена
    this.field.clear(); // очищение поля
    this.removedPixels = 0; // установка кол-ва удаленных пикселей
    this.removedFigures = 0; // установка кол-ва удаленных фигур
    this.gameEnd = false; // установка флага о том что игра не кончилась
    this.gameId = null; // сброс идентификатора игры
    this.startGame(); // запуск игры

    this.log(getAction("Перезапуск игры", { lastGameId })); // запись в лог
  }
}
