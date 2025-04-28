window.gLocalAssetContainer["main"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

const gameMain_1 = require("./gameMain");
function main() {
  g.game.pushScene((0, gameMain_1.createGameMainScene)());
}
module.exports = main;
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}