const Pixel = require("../models/pixel"),
      matrixRotate = require("../../lib/rotateMatrix");

// объект фигуры. Принимает карту смещения пикселей относительно крайней верхней левой точки фигуры, координаты на поле и цвет

module.exports = class Figure {
  constructor(shapeDisplacementMap, positionX, positionY, color){
    this.color = color; // установка цвета фигуры
    this.pixelsArray = shapeDisplacementMap.map(({ displacementX, displacementY }) => {
      const pixelPositionX = positionX - displacementX, // координата x будущего пикселя
            pixelPositionY = positionY - displacementY; // координата y будущего пикселя

      return new Pixel(pixelPositionX, pixelPositionY, color); // создание пикселя для фигуры
    }); // массив пикселей
  }

  // матрица расположения пикселей фигуры. null = пустая клетка, число = индекс пикселя в массиве pixelsArray
  get matrix(){
    const { pixelsArray, positionY, positionX, height, width } = this,
          matrix = [];

    for (let y = 0; y < height; y++) {
      matrix.push([]);

      for (let x = 0; x < width; x++) {
        const pixelIndex = this.pixelsArray.findIndex(p => p.positionX === positionX + x  && p.positionY === positionY + y);

        matrix[y].push(pixelIndex >= 0 ? pixelIndex : null);
      }
    }

    return matrix;
  }

  // вычесление карты смещений пикселей в фигуре относительно левой верхней её точки
  get shapeDisplacementMap(){
    const { positionX, positionY } = this; // x и y координаты левой верхней точки фигуры

    return this.pixelsArray.map(pixel => ({
      displacementX: positionX - pixel.positionX, // смещение по x
      displacementY: positionY - pixel.positionY // смещение по y
    }));
  }

  // вычесление позиции крайней левой точки фигуры на x координате
  get positionX(){
    return Math.min(...this.pixelsArray.map(({ positionX }) => positionX));
  }

  // вычесление позиции крайней верхней точки фигуры на y координате
  get positionY(){
    return Math.min(...this.pixelsArray.map(({ positionY }) => positionY));
  }

  // вычесление ширины фигуры
  get width(){
    const minPositionX = this.positionX, // позиция по x координате самого ближнего к 0 пикселя
          maxPositionX = Math.max(...this.pixelsArray.map(({ positionX }) => positionX)); // позиция по x координате самого дальнего от 0 пикселя

    return maxPositionX - minPositionX + 1; // вычесляем ширину фигуры
  }

  // вычесление вышины фигуры
  get height(){
    const minPositionY = this.positionY, // позиция по y координате самого ближнего к 0 пикселя
          maxPositionY = Math.max(...this.pixelsArray.map(({ positionY }) => positionY)); // позиция по y координате самого дальнего от 0 пикселя

    return maxPositionY - minPositionY + 1; // вычесляем высоту фигуры
  }

  // установка позиции фигуры на поле. Принимает x и y координаты
  setPosition(positionX, positionY){
    const { shapeDisplacementMap } = this; // карта смещений пикселей

    // переборка пикселей фигуры и коррекция их координат
    this.pixelsArray.forEach((pixel, index) => {
      const { displacementX, displacementY } = shapeDisplacementMap[index], // смещения пикселя относительно левой верхней точки фигуры
            newPositionX = positionX - displacementX, // новая координата x
            newPositionY = positionY - displacementY; // новая координата y

      pixel.setPosition(newPositionX, newPositionY); // установка новой позиции пикселя
    });
  }

  // поворот фигуры. Принимает кол-во поворотов на 90 градусов (1 = 90). Отрицательное значение поворачивает фигуру против часовой стрелки
  rotate(times){
    const { positionX, positionY } = this, // получение x и y координаты фигуры на поле
          ratatedMatrix = matrixRotate(this.matrix, times); // поворот матрицы фигуры переданное кол-во раз

    // перебор повернутой матрицы индексов пикселей фигуры
    ratatedMatrix.forEach((pixelsArray, displacementY) => pixelsArray.forEach((pixelIndex, displacementX) => {
      if (pixelIndex !== null) { // если индекс пикселя не null
        const pixel = this.pixelsArray[pixelIndex], // получаем пиксель по его индексу
              newPositionY = positionY - displacementY, // вычесляем новую y координату
              newPositionX = positionX - displacementX; // вычесляем новую x координату

        pixel.setPosition(newPositionX, newPositionY); // устанавливаем новую позицию пикселя на поле
      }
    }));

    this.setPosition(positionX, positionY); // устанавливаем новую позицию фигуры на поле по старым параметрам
  }

  // установка нового цвета фигуры
  setColor(color){
    this.color = color; // установка нового цвета

    // переборка всех пикселей и установка в них нового цвета
    this.pixelsArray.forEach((pixel, index) => {
      pixel.color = color; // установка нового цвета пикселя
    });
  }
}
