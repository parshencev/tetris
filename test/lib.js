const { assert, expect } = require("chai"),
      rotateMatrix = require("../lib/rotateMatrix"),
      random = require("../lib/random"),
      arrToShapeDisplacementMap = require("../lib/arrToShapeDisplacementMap"),
      { uniq } = require("lodash");

describe("Тестирование модуля rotateMatrix", () => {
  it("Поворот по часовой стрелке", () => {
    const matrix = [
            [1,2,3],
            [4,5,6],
            [7,8,9]
          ],
          rotatedMatrix90 = [
            [7,4,1],
            [8,5,2],
            [9,6,3]
          ],
          rotatedMatrix180 = [
            [9,8,7],
            [6,5,4],
            [3,2,1]
          ],
          rotatedMatrix270 = [
            [3,6,9],
            [2,5,8],
            [1,4,7]
          ];

    expect(rotateMatrix(matrix, 1)).to.deep.equal(rotatedMatrix90);
    expect(rotateMatrix(matrix, 2)).to.deep.equal(rotatedMatrix180);
    expect(rotateMatrix(matrix, 3)).to.deep.equal(rotatedMatrix270);
    expect(rotateMatrix(matrix, 4)).to.deep.equal(matrix);

    expect(rotateMatrix(matrix, 5)).to.deep.equal(rotatedMatrix90);
    expect(rotateMatrix(matrix, 6)).to.deep.equal(rotatedMatrix180);
    expect(rotateMatrix(matrix, 7)).to.deep.equal(rotatedMatrix270);
    expect(rotateMatrix(matrix, 8)).to.deep.equal(matrix);
  });

  it("Поворот против часовой стрелки", () => {
    const matrix = [
            [1,2,3],
            [4,5,6],
            [7,8,9]
          ],
          rotatedMatrix90 = [
            [3,6,9],
            [2,5,8],
            [1,4,7]
          ],
          rotatedMatrix180 = [
            [9,8,7],
            [6,5,4],
            [3,2,1]
          ],
          rotatedMatrix270 = [
            [7,4,1],
            [8,5,2],
            [9,6,3]
          ];

    expect(rotateMatrix(matrix, -1)).to.deep.equal(rotatedMatrix90);
    expect(rotateMatrix(matrix, -2)).to.deep.equal(rotatedMatrix180);
    expect(rotateMatrix(matrix, -3)).to.deep.equal(rotatedMatrix270);
    expect(rotateMatrix(matrix, -4)).to.deep.equal(matrix);

    expect(rotateMatrix(matrix, -5)).to.deep.equal(rotatedMatrix90);
    expect(rotateMatrix(matrix, -6)).to.deep.equal(rotatedMatrix180);
    expect(rotateMatrix(matrix, -7)).to.deep.equal(rotatedMatrix270);
    expect(rotateMatrix(matrix, -8)).to.deep.equal(matrix);
  });
});

describe("Тестирование модуля random", () => {
  it("Проверка генерации чисел в заданом диапазоне", () => {
    const min = 1,
          max = 5;

    for (let i = 0; i < 1000; i++) expect(random(min, max)).to.be.at.most(max).and.least(min);
  });

  it("Проверка на уникальность", () => {
    const min = 1,
          max = 50,
          numbers = [];

    for (let i = 0; i < 1000; i++) numbers.push(random(min, max));

    assert(uniq(numbers).length === max, "За 1000 итераций не получилось создать 50 уникальных чисел");
  });
});

describe("Тестирование модуля arrToShapeDisplacementMap", () => {
  it("Проверка трансформации массива чисел в массив объектов", () => {
    const arr = [
      [
        [1,2],
        [3,4],
        [5,6]
      ],
      [
        [7,8],
        [9,10],
        [11,12]
      ],
    ];

    expect(arrToShapeDisplacementMap(arr)).to.deep.equal([
      [
        { displacementX: 1, displacementY: 2 },
        { displacementX: 3, displacementY: 4 },
        { displacementX: 5, displacementY: 6 }
      ],
      [
        { displacementX: 7, displacementY: 8 },
        { displacementX: 9, displacementY: 10 },
        { displacementX: 11, displacementY: 12 }
      ]
    ]);
  });
});
