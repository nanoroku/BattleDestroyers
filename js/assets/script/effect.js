window.gLocalAssetContainer["effect"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WaterColumn = exports.Explosion = void 0;
// ============================================================================
//  爆発
// ============================================================================
class Explosion extends g.FrameSprite {
  constructor(scene, layer) {
    super({
      scene: scene,
      parent: layer,
      src: scene.assets["explosion"],
      width: scene.assets["explosion"].width / 11,
      height: scene.assets["explosion"].height,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      interval: 100,
      x: -1000,
      y: -1000,
      anchorX: 0.5,
      anchorY: 0.5,
      loop: false
    });
    this.stop();
  }
  startEffect(x, y, loop = false) {
    this.x = x;
    this.y = y;
    this.start();
    this.onFinish.add(() => {
      if (loop) {
        this.stop();
        this.frameNumber = 0;
        this.modified();
      } else {
        this.destroy();
      }
    });
  }
}
exports.Explosion = Explosion;
// ============================================================================
//  水柱
// ============================================================================
class WaterColumn extends g.FrameSprite {
  constructor(scene, layer) {
    super({
      scene: scene,
      parent: layer,
      src: scene.assets["waterColumn"],
      width: scene.assets["waterColumn"].width / 11,
      height: scene.assets["waterColumn"].height,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      interval: 100,
      x: -1000,
      y: -1000,
      anchorX: 0.5,
      anchorY: 0.77,
      loop: false
    });
    this.stop();
  }
  startEffect(x, y, loop = false) {
    this.x = x;
    this.y = y;
    this.start();
    this.onFinish.add(() => {
      if (loop) {
        this.stop();
        this.frameNumber = 0;
        this.modified();
      } else {
        this.destroy();
      }
    });
  }
}
exports.WaterColumn = WaterColumn;
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}