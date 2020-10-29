// случайное число от min до (max+1)

module.exports = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
