// превращение массива чисел в объект shapeDisplacementMap

module.exports = arr => arr.map(figureArr =>
  figureArr.map(
    ([ displacementX, displacementY ]) => ({ displacementX, displacementY })
  )
);
