const { flatten, uniq } = require("lodash");

// объект поля. Принимает ширину, высоту в пикселях

module.exports = class Field {
  constructor(width, height){
    this.width = width; // ширина поля
    this.height = height; // высота поля
    this.figures = []; // фигуры на поле
  }

  // массив всех координат пикселей на поле
  get pixelsCoords(){
    return flatten(this.figures.map(({ pixelsArray }) => pixelsArray.map(({ positionX, positionY }) => ([ positionX, positionY ]))));
  }

  // возвращает кол-во пустых фигур (без пикселей)
  get emptyFigures(){
    return this.figures.filter(({ pixelsArray }) => !pixelsArray.length).length;
  }

  // добавление новой фигуры на поле
  addFigure(figure){
    return this.figures.push(figure) - 1; // возврат индекса фигуры
  }

  // проверка не пересекаются ли фигуры на поле. Если пересекаются true
  checkIntersection(){
    const pixels = this.pixelsCoords; // массив всех пикселей на поле

    // переборка пикселей и сравнение их координат
    for (let i = 0; i < pixels.length; i++) {
      const pixelCoords = pixels[i], // отдельный пиксель
            intersectionPixelIndex = pixels.findIndex(([ x, y ], key) => key !== i && pixelCoords[0] === x && pixelCoords[1] === y); // поиск индекса похожего пикселя

      if (intersectionPixelIndex !== -1) return true; // выход из цикла если есть похожий пиксель
    }

    return false; // выход если нет похожих пикселей
  }

  // проверка есть ли фигуры за пределами поля. Принимает границу для проверки: left, right, bottom, top (undefined = все границы). Если есть true
  checkOutOfField(border){
    const pixels = this.pixelsCoords; // массив координат пикселей

    if (border === "right") return pixels.findIndex(([ x ]) => x >= this.width) !== -1; // проверка выходит ли хотя бы один за правую рамку поля
    if (border === "left") return pixels.findIndex(([ x ]) => x < 0) !== -1; // проверка выходит ли хотя бы один за левую рамку поля
    if (border === "top") return pixels.findIndex(([ ,y ]) => y < 0) !== -1; // проверка выходит ли хотя бы один за верхнюю рамку поля
    if (border === "bottom") return pixels.findIndex(([ ,y ]) => y >= this.height) !== -1; // проверка выходит ли хотя бы один за нижнюю рамку поля

    return pixels.findIndex(([ x, y ]) => x >= this.width || y >= this.height || x < 0 || y < 0) !== -1; // проверка выходит ли хотя бы один за рамки всего поля
  }

  // удаление всех пикселей в заполненых полностью строках и смещение вышестоящих пикселей вниз на кол-во удалённых строк. Возвращает кол-во удаленных пикселей
  deleteFullRowPixels(){
    const pixels = this.pixelsCoords, // массив координат всех пикселей на поле
          yArray = uniq(pixels.map(([,y]) => y)), // массив уникальных y координат всех пикселей на поле
          fullRowsY = yArray.filter(y => pixels.filter(arr => arr[1] === y).length === this.width), // y координаты всех полных строк на поле
          minFullRowsY = Math.min(...fullRowsY); // минимальная y координата полной строки. Черта над которой нужно двигать пиксели вниз

    // переборка фигур для удаления в них пикселей
    this.figures.forEach(({ pixelsArray }) => {
       const pixelsIndexes = pixelsArray // индексы всех пикселей, имеющих y координату полной строки
         .map(({ positionY }, key) => fullRowsY.includes(positionY) ? key : null)
         .filter(i => i !== null);

       pixelsIndexes.sort((a, b) => a - b) // сортировка массива индексов в порядке возрастания
                    .forEach((index, key) => pixelsArray.splice(index - key, 1)); // удаление пикселей по их индексу из фигуры
    });

    // переборка фигур для смещения вниз
    this.figures.forEach(figure => {
      const { positionY, positionX, height } = figure; // y, x координаты и высота фигуры
      // если крайняя нижняя y координата больше y координаты самой нижней удаленной строки то смещение фигуры вниз на кол-во удалённых строк
      positionY + height <= minFullRowsY && figure.setPosition(positionX, positionY + fullRowsY.length);
    });

    // установка числа пустых фигур
    const deleteFiguresCount = this.figures.filter(({ pixelsArray }) => !pixelsArray.length).length;

    // удаление пустых фигур если они есть
    !!deleteFiguresCount && (this.figures = this.figures.filter(({ pixelsArray }) => !!pixelsArray.length));

    return {
      pixels: fullRowsY.length * this.width, // возврат кол-ва удаленных пикселей
      figures: deleteFiguresCount // возврат кол-ва удаленных фигур
    };
  }

  // очищение поля
  clear(){
    this.figures = []; // установка пустого массива фигур
  }
}
