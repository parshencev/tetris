const GameController = require("./controllers/gameController"),
      ViewController = require("./controllers/viewController"),
      cli = require("./listeners/cli"),
      figures = require("./constants/figures"),
      gameController = new GameController(20, 20, .3, figures),
      viewController = new ViewController(gameController);

cli(gameController, viewController);







