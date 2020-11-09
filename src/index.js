const GameController = require("./controllers/gameController"),
      ViewController = require("./controllers/viewController"),
      KeypressMiddleware = require("./middleware/keypress"),
      cli = require("./listeners/cli"),
      figures = require("./constants/figures"),
      ssh = require("./listeners/ssh"),
      createGame = (console, endHandler) => {
        const gameController = new GameController(20, 20, .3, figures),
              viewController = new ViewController(gameController, console),
              keypressMiddleware = new KeypressMiddleware(gameController, viewController, endHandler);

        viewController.startScreen(); // показ начального экрана

        return keypressMiddleware.keypress;
      };

module.exports = {
  cli: () => cli(createGame(console)), // запуск слушателя нажатия клавиш в терминале
  ssh: () => ssh(createGame) // запуск слушателя ssh
};







