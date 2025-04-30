window.gLocalAssetContainer["title"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTitleScene = createTitleScene;
const gameMain = require("./gameMain");
function createTitleScene() {
  let backLayer;
  let font;
  let timerLabel;
  const titleTimeoutMsec = 10000;
  let remainingTime = titleTimeoutMsec / 1000;
  const scene = new g.Scene({
    game: g.game,
    assetIds: ["howto" // タイトル画像
    ]
  });
  scene.onLoad.add(() => {
    // ====================================================================
    //  レイヤーの生成
    // ====================================================================
    backLayer = new g.E({
      scene: scene,
      parent: scene
    });
    // ====================================================================
    //
    //  UI関係の設定
    //
    // ==================================================================== 
    // フォントの生成
    font = new g.DynamicFont({
      game: g.game,
      fontFamily: "sans-serif",
      fontColor: "white",
      size: 72
    });
    const background = new g.Sprite({
      scene: scene,
      parent: backLayer,
      src: scene.assets["howto"],
      x: 0,
      y: 0
    });
    timerLabel = new g.Label({
      scene: scene,
      parent: backLayer,
      font: font,
      fontSize: font.size,
      text: "",
      x: 1120,
      y: 615,
      anchorX: 0.5,
      anchorY: 0.5
    });
    function updateTimer() {
      timerLabel.text = `${remainingTime}`;
      timerLabel.invalidate();
    }
    const timer = scene.setInterval(() => {
      remainingTime--;
      updateTimer();
    }, 1000);
    scene.setTimeout(() => {
      g.game.pushScene(gameMain.createGameMainScene());
    }, titleTimeoutMsec);
  });
  return scene;
}
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}