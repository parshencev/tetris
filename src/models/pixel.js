// объект пикселя. Принимает позицию x и y на поле, а так же цвет

module.exports = class Pixel {
  constructor(positionX, positionY, color){
    this.color = color; // цвет
    this.positionX = positionX; // координата x на поле
    this.positionY = positionY; // координата y на поле
  }

  // установка новых координат
  setPosition(positionX, positionY){
    this.positionY = positionY; // координата x
    this.positionX = positionX; // координата y
  }
}
