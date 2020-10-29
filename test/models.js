const { assert, expect } = require("chai"),
      Pixel = require("../src/models/pixel"),
      Figure = require("../src/models/figure"),
      Field = require("../src/models/field"),
      arrToShapeDisplacementMap = require("../lib/arrToShapeDisplacementMap");

describe("тестирование модели Pixel", () => {
  it("создание", () => {
    const pixel = new Pixel(0, 1, "red");

    expect(pixel.positionX).to.be.equal(0);
    expect(pixel.positionY).to.be.equal(1);
    expect(pixel.color).to.be.equal("red");
  });

  it("установка новых координат", () => {
    const pixel = new Pixel(0, 1, "red");

    pixel.setPosition(2,3);

    expect(pixel.positionX).to.be.equal(2);
    expect(pixel.positionY).to.be.equal(3);
  });
});

describe("тестирование модели Field", () => {
  it("Создание", () => {
    const field = new Field(20, 50);

    expect(field.width).to.be.equal(20);
    expect(field.height).to.be.equal(50);
    expect(field.figures).to.be.deep.equal([]);
  });

  it("Добавление фигуры", () => {
    const field = new Field(20, 50),
          figure = {a: 1};

    expect(field.addFigure(figure)).to.be.equal(0);
    expect(field.figures).to.deep.equal([figure]);
  });

  it("Проверка на пересечение фигур", () => {
    const field = new Field(20, 50),
          shapeDisplacementMap = arrToShapeDisplacementMap([
            [
              [0, 0], [-1, 0],
              [0, -1], [-1, -1]
            ]
          ]),
          figure1 = new Figure(shapeDisplacementMap[0], 1, 1, "red"),
          figure2 = new Figure(shapeDisplacementMap[0], 1, 1, "green");

    field.addFigure(figure1);
    field.addFigure(figure2);

    assert(field.checkIntersection(), "фигуры не пересекаются а должны");

    field.figures[1].setPosition(5,5);

    assert(!field.checkIntersection(), "фигуры пересекаются а не должны");
  });

  it("Проверка на пересечение границ поля", () => {
    const field = new Field(20, 50),
          shapeDisplacementMap = arrToShapeDisplacementMap([
            [
              [0, 0], [-1, 0],
              [0, -1], [-1, -1]
            ]
          ]),
          figure = new Figure(shapeDisplacementMap[0], 0, 0, "red");

    field.addFigure(figure);

    assert(!field.checkOutOfField(), "фигура пересекает поле, хотя не должна");
    assert(!field.checkOutOfField("top"), "фигура пересекает поле, хотя не должна");
    assert(!field.checkOutOfField("bottom"), "фигура пересекает поле, хотя не должна");
    assert(!field.checkOutOfField("right"), "фигура пересекает поле, хотя не должна");
    assert(!field.checkOutOfField("left"), "фигура пересекает поле, хотя не должна");

    figure.setPosition(-1, 0);

    assert(field.checkOutOfField(), "фигура не пересекает поле, хотя должна");
    assert(field.checkOutOfField("left"), "фигура не пересекает левую границу, хотя должна");
    assert(!field.checkOutOfField("right"), "фигура пересекает правую границу, хотя не должна");
    assert(!field.checkOutOfField("bottom"), "фигура пересекает нижнюю границу, хотя не должна");
    assert(!field.checkOutOfField("top"), "фигура пересекает верхнюю границу, хотя не должна");

    figure.setPosition(0, -1);

    assert(field.checkOutOfField(), "фигура не пересекает поле, хотя должна");
    assert(!field.checkOutOfField("left"), "фигура пересекает левую границу, хотя не должна");
    assert(!field.checkOutOfField("right"), "фигура пересекает правую границу, хотя не должна");
    assert(!field.checkOutOfField("bottom"), "фигура пересекает нижнюю границу, хотя не должна");
    assert(field.checkOutOfField("top"), "фигура не пересекает верхнюю границу, хотя должна");

    figure.setPosition(21, 0);

    assert(field.checkOutOfField(), "фигура не пересекает поле, хотя должна");
    assert(!field.checkOutOfField("left"), "фигура пересекает левую границу, хотя не должна");
    assert(field.checkOutOfField("right"), "фигура не пересекает правую границу, хотя должна");
    assert(!field.checkOutOfField("bottom"), "фигура пересекает нижнюю границу, хотя не должна");
    assert(!field.checkOutOfField("top"), "фигура пересекает верхнюю границу, хотя не должна");

    figure.setPosition(0, 51);

    assert(field.checkOutOfField(), "фигура не пересекает поле, хотя должна");
    assert(!field.checkOutOfField("left"), "фигура пересекает левую границу, хотя не должна");
    assert(!field.checkOutOfField("right"), "фигура пересекает правую границу, хотя не должна");
    assert(field.checkOutOfField("bottom"), "фигура не пересекает нижнюю границу, хотя должна");
    assert(!field.checkOutOfField("top"), "фигура пересекает верхнюю границу, хотя не должна");
  });

  it("Проверка удаления полных строк", () => {
    const field = new Field(5, 10),
          shapeDisplacementMap = arrToShapeDisplacementMap([
            [
              [0, 0], [-1, 0], [-2, 0], [-3, 0], [-4, 0]
            ],
            [
              [0, 0], [-1, 0], [-2, 0], [-3, 0]
            ]
          ]),
          figure1 = new Figure(shapeDisplacementMap[0], 0, 10, "red"),
          figure2 = new Figure(shapeDisplacementMap[1], 0, 8, "green"),
          figure3 = new Figure(shapeDisplacementMap[1], 0, 6, "blue"),
          figure4 = new Figure(shapeDisplacementMap[1], 0, 4, "yellow"),
          figure5 = new Figure(shapeDisplacementMap[0], 0, 8, "black");

    field.addFigure(figure1);
    field.addFigure(figure2);
    field.addFigure(figure3);
    field.addFigure(figure4);

    field.deleteFullRowPixels();

    expect(figure1.pixelsArray).to.deep.equal([]);

    expect(figure2.positionX).to.equal(0);
    expect(figure2.positionY).to.equal(9);
    expect(figure2.pixelsArray.length).to.equal(4);

    expect(figure3.positionX).to.equal(0);
    expect(figure3.positionY).to.equal(7);
    expect(figure3.pixelsArray.length).to.equal(4);

    expect(figure4.positionX).to.equal(0);
    expect(figure4.positionY).to.equal(5);
    expect(figure4.pixelsArray.length).to.equal(4);

    field.addFigure(figure5);

    field.deleteFullRowPixels();

    expect(figure5.pixelsArray).to.deep.equal([]);

    expect(figure2.positionX).to.equal(0);
    expect(figure2.positionY).to.equal(9);
    expect(figure2.pixelsArray.length).to.equal(4);

    expect(figure3.positionX).to.equal(0);
    expect(figure3.positionY).to.equal(8);
    expect(figure3.pixelsArray.length).to.equal(4);

    expect(figure4.positionX).to.equal(0);
    expect(figure4.positionY).to.equal(6);
    expect(figure4.pixelsArray.length).to.equal(4);
  });

  it("Проверка очищения всех фигур с поля", () => {
    const field = new Field(5, 10),
          shapeDisplacementMap = arrToShapeDisplacementMap([
            [
              [0, 0], [-1, 0], [-2, 0], [-3, 0], [-4, 0]
            ],
            [
              [0, 0], [-1, 0], [-2, 0], [-3, 0]
            ]
          ]),
          figure1 = new Figure(shapeDisplacementMap[0], 0, 10, "red"),
          figure2 = new Figure(shapeDisplacementMap[1], 0, 8, "green"),
          figure3 = new Figure(shapeDisplacementMap[1], 0, 6, "blue"),
          figure4 = new Figure(shapeDisplacementMap[1], 0, 4, "yellow");

    field.addFigure(figure1);
    field.addFigure(figure2);
    field.addFigure(figure3);
    field.addFigure(figure4);

    field.clear();

    expect(field.figures).to.deep.equal([]);
  })
});

describe("тестирование модели Figure", () => {
  it("Создание", () => {
    const shapeDisplacementMap = arrToShapeDisplacementMap([
            [
              [0, 0], [-1, 0],
              [0, -1], [-1, -1]
            ]
          ]),
          figure = new Figure(shapeDisplacementMap[0], 1, 1, "red");

    expect(figure.color).to.be.equal("red");
    expect(figure.pixelsArray).to.deep.equal([
      new Pixel(1, 1, "red"), new Pixel(2, 1, "red"),
      new Pixel(1, 2, "red"), new Pixel(2, 2, "red")
    ]);
    expect(figure.shapeDisplacementMap).to.deep.equal(shapeDisplacementMap[0]);
    expect(figure.positionX).to.equal(1);
    expect(figure.positionY).to.equal(1);
    expect(figure.width).to.equal(2);
  });

  it("Установка новой позиции", () => {
    const shapeDisplacementMap = arrToShapeDisplacementMap([
            [
              [0, 0], [-1, 0],
              [0, -1], [-1, -1]
            ]
          ]),
          figure = new Figure(shapeDisplacementMap[0], 1, 1, "red");

    figure.setPosition(2,2);

    expect(figure.shapeDisplacementMap).to.deep.equal(shapeDisplacementMap[0]);
    expect(figure.pixelsArray).to.deep.equal([
      new Pixel(2, 2, "red"), new Pixel(3, 2, "red"),
      new Pixel(2, 3, "red"), new Pixel(3, 3, "red")
    ]);
  });
});

