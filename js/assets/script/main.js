window.gLocalAssetContainer["main"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

const title_1 = require("./title");
function main() {
  g.game.pushScene((0, title_1.createTitleScene)());
}
module.exports = main;
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}