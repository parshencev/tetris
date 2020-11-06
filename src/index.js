const GameController = require("./controllers/gameController"),
      ViewController = require("./controllers/viewController"),
      KeypressMiddleware = require("./middleware/keypress"),
      cli = require("./listeners/cli"),
      figures = require("./constants/figures"),
      gameController = new GameController(20, 20, .3, figures),
      viewController = new ViewController(gameController),
      keypressMiddleware = new KeypressMiddleware(gameController, viewController);

viewController.startScreen(); // показ начального экрана

cli(keypressMiddleware.keypress); // запуск слушателя нажатия клавиш в терминале







