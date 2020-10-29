const fs = require("fs"),
      moment = require("moment"),
      yaml = require("yaml"),
      path = require("path"),
      rootPath = require("app-root-path").toString(), // путь до корня приложения
      logPath = path.resolve(rootPath, "log"), // путь до папки с логами
      gamesLogPath = path.resolve(logPath, "games"), // путь до папки с логами игр
      errorsFilePath = path.resolve(logPath, "errors.yml"), // путь до файла с логами ошибок
      dateTimeMixin = () => ({ // получение объекта с датой его создания
        date: moment().format("YYYY-MM-DD hh:mm:ss.SSSS") // дата в виде строки
      }),
      // запись файла с контентом или допись уже существующего файла. Данные трансформируется в yaml формат и к ним добавляется дата и время
      createOrRecord = (filePath, data, cb = () => {}) => fs.appendFile(filePath, yaml.stringify([{...data, ...dateTimeMixin() }]), cb),
      getData = filePath => yaml.parse(fs.readFileSync(path.resolve(filePath))); // получение данных из .yml файла как js объект

// создание папок для хранения файлов если их нет
[logPath, gamesLogPath].forEach(folderPath => !fs.existsSync(folderPath) && fs.mkdirSync(folderPath));

module.exports = class Log {
  static error(error, data){ // запись в лог ошибок
    createOrRecord(errorsFilePath, { error, ...data });
  }

  static game(id, action, field, data){ // запись в лог игры
    const filePath = path.resolve(gamesLogPath, `${id}.yml`);
    createOrRecord(filePath, { id, action, field, ...data });
  }

  static get(type, id){ // получение лога игры или ошибок
    return getData(type === "game" ? path.resolve(gamesLogPath, `${id}.yml`) : errorsFilePath);
  }
}
