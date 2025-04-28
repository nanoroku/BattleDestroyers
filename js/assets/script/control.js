window.gLocalAssetContainer["control"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Arrow = void 0;
// ============================================================================
//  矢印クラス
// ============================================================================
class Arrow extends g.Sprite {
  constructor(scene, layer) {
    super({
      scene: scene,
      parent: layer,
      src: scene.assets["arrow"],
      width: scene.assets["arrow"].width,
      height: scene.assets["arrow"].height,
      anchorX: 0,
      anchorY: 0.5,
      scaleX: 0.0,
      scaleY: 0.0,
      angle: 0,
      hidden: false
    });
  }
  drag(startX, startY, deltaX, deltaY) {
    const dx = deltaX - startX;
    const dy = deltaY - startY;
    this.scaleX = Math.min(Math.max(Math.abs(dx / 200), Math.abs(dy / 200)), 1.0);
    this.scaleY = 1.0;
    const rad = Math.atan2(dy, dx);
    let deg = rad * (180 / Math.PI);
    if (deg < 0) deg += 360;
    this.angle = deg;
    //console.log("dx:", dx);
    //console.log("dy:", dy);
    //console.log("scaleX:", this.scaleX);
    //console.log("scaleY:", this.scaleY);
    //console.log("angle:", this.angle);
  }
  get getScalar() {
    return this.scaleX;
  }
}
exports.Arrow = Arrow;
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}