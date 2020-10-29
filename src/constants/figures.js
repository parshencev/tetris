// массив фигур

const arrToShapeDisplacementMap = require("../../lib/arrToShapeDisplacementMap"),
      figures = arrToShapeDisplacementMap([
        // Smashboy
        [
          [0,  0], [-1,  0],
          [0, -1], [-1, -1]
        ],
        // Hero
        [
          [0,  0],
          [0, -1],
          [0, -2],
          [0, -3],
        ],
        // Rhode Island Z
        [
          [0, 0], [-1,  0],
                  [-1, -1], [-2, -1]
        ],
        // Cleveland Z
        [
                   [-1,  0], [-2, 0],
          [0, -1], [-1, -1]
        ],
        // Orange Ricky
        [
          [0,  0],
          [0, -1],
          [0, -2], [-1, -2]
        ],
        // Blue Ricky
        [
                   [-1,  0],
                   [-1, -1],
          [0, -2], [-1, -2]
        ],
        // Teewee
        [
                   [-1,  0],
          [0, -1], [-1, -1], [-2, -1]
        ]
      ]), // преобразованные координаты фигур
      colors = ["#FFFF00", "#00FFFF", "#FF0000", "#008000", "#FFA500", "#0000FF", "#8A2BE2"]; // цвета

module.exports = figures.map((figure, key) => {
  figure.color = colors[key]; // соединение координат с цветом
  return figure;
});
