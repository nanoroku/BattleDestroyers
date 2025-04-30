window.gLocalAssetContainer["player"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DestroyerMutsuki = void 0;
exports.gameAgeMs = gameAgeMs;
// ============================================================================
//  プレイヤーの抽象クラス
// ============================================================================
class Player extends g.Sprite {
  /**
   * コンストラクタ
   * @param scene
   * @param spawnLayer
   * @param baseAssetId
   * @param x
   * @param y
   */
  constructor(scene, spawnLayer, baseAssetId, x, y) {
    super({
      scene: scene,
      parent: spawnLayer,
      src: scene.assets[baseAssetId],
      width: scene.assets[baseAssetId].width,
      height: scene.assets[baseAssetId].height,
      x: x,
      y: y,
      anchorX: 0.5,
      anchorY: 0.5,
      angle: 0.0
    });
  }
  /**
   * ステータス設定
   * @param maxSpeed 最大船側
   * @param torpedoPower 魚雷火力
   * @param torpedoSpeed 魚雷速度
   * @param torpedoInterval 魚雷発射間隔
   */
  initStatus(maxSpeed, acceleration, rotateSpeed, torpedoPower, torpedoSpeed, torpedoInterval) {
    this.maxSpeed = maxSpeed;
    this.acceleration = acceleration;
    this.rotateSpeed = rotateSpeed;
    this.torpedoPower = torpedoPower;
    this.torpedoSpeed = torpedoSpeed;
    this.torpedoInterval = torpedoInterval;
  }
  get getCollisionArea() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
  getTipPosition() {
    // 回転をラジアンに変換
    const rad = this.angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // アンカーから見たローカルオフセット
    // anchorX=0.0, anchorY=0.5のとき、先端は画像右端の中央　⇒　ローカル( width, 0)
    const localX = this.width / 2 * this.scaleX;
    const localY = (0.5 - this.anchorY) * this.height * this.scaleY; // ここでは0
    // 回転+平行移動でワールド座標を計算
    const worldX = this.x + localX * cos - localY * sin;
    const worldY = this.y + localX * sin + localY * cos;
    return {
      x: worldX,
      y: worldY
    };
  }
  get getKnot() {
    return this.velocity * 10.0;
  }
  get getMaxSpeed() {
    return this.maxSpeed;
  }
  get getPrevX() {
    return this.prevX;
  }
  get getPrevY() {
    return this.prevY;
  }
  stop() {
    this.velocity = 0.0;
  }
}
// ============================================================================
//  睦月型駆逐艦
// ============================================================================
class DestroyerMutsuki extends Player {
  constructor(scene, spawnLayer, x, y) {
    super(scene, spawnLayer, "mutsuki_base", x, y);
    this.torpedoTubePos = [{
      x: 33.5,
      y: 0.0
    } // 96
    ];
    this.torpedoTubeAnchor = {
      anchorX: 0.5,
      anchorY: 0.5
    };
    this.torpedoTubeFrontIdx = 0;
    this.lineAngleSensitivity = 0.25;
    this.TORPEDO_RELOAD_MS = 5000;
    this.lastShotTime = -10000;
    this.torpedoManager = null;
    this.spriteRangeFrontLeft = new g.Sprite({
      scene: scene,
      parent: this,
      src: scene.assets["range"],
      width: scene.assets["range"].width,
      height: scene.assets["range"].height,
      x: this.width / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].x,
      y: this.height / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].y,
      anchorX: 0.5,
      anchorY: 1.0
    });
    this.spriteRangeFrontRight = new g.Sprite({
      scene: scene,
      parent: this,
      src: scene.assets["range"],
      width: scene.assets["range"].width,
      height: scene.assets["range"].height,
      x: this.width / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].x,
      y: this.height / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].y,
      anchorX: 0.5,
      anchorY: 1.0,
      angle: 180.0
    });
    this.spriteLineFrontLeft = new g.Sprite({
      scene: scene,
      parent: this,
      src: scene.assets["line"],
      width: scene.assets["line"].width,
      height: scene.assets["line"].height,
      x: this.width / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].x,
      y: this.height / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].y,
      anchorX: 0.5,
      anchorY: 1.0,
      angle: 0,
      hidden: true
    });
    this.spriteLineFrontRight = new g.Sprite({
      scene: scene,
      parent: this,
      src: scene.assets["line"],
      width: scene.assets["line"].width,
      height: scene.assets["line"].height,
      x: this.width / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].x,
      y: this.height / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].y,
      anchorX: 0.5,
      anchorY: 1.0,
      angle: 180,
      hidden: true
    });
    this.spriteTorpedoTubeFront = new g.Sprite({
      scene: scene,
      parent: this,
      src: scene.assets["mutsuki_torpedo_tube"],
      width: scene.assets["mutsuki_torpedo_tube"].width,
      height: scene.assets["mutsuki_torpedo_tube"].height,
      x: this.width / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].x,
      y: this.height / 2 + this.torpedoTubePos[this.torpedoTubeFrontIdx].y,
      anchorX: this.torpedoTubeAnchor.anchorX,
      anchorY: this.torpedoTubeAnchor.anchorY,
      angle: 0
    });
    this.spriteBuilding = new g.Sprite({
      scene: scene,
      parent: this,
      src: scene.assets["mutsuki_building"],
      width: scene.assets["mutsuki_building"].width,
      height: scene.assets["mutsuki_building"].height
    });
    this.velocity = 0.0;
    this.currentSpeed = 0.0;
  }
  set setTorpedoManager(torpedoManager) {
    this.torpedoManager = torpedoManager;
  }
  set setLineLeftAngle(angle) {
    this.spriteLineFrontLeft.angle = angle;
  }
  set setLineRightAngle(angle) {
    this.spriteLineFrontRight.angle = angle;
  }
  get getLineLeftAngle() {
    return this.spriteLineFrontLeft.angle;
  }
  get getLineRightAngle() {
    return this.spriteLineFrontRight.angle;
  }
  get getLineAngleSensitivity() {
    return this.lineAngleSensitivity;
  }
  get getLastShotTime() {
    return this.lastShotTime;
  }
  accelerate(targetSpeed) {
    if (this.currentSpeed < targetSpeed) {
      this.velocity = Math.min(this.velocity + this.acceleration, targetSpeed);
    } else if (this.currentSpeed > targetSpeed) {
      this.velocity = Math.max(this.velocity - this.acceleration, targetSpeed);
    }
    this.currentSpeed = this.velocity;
    //console.log("stopRequested:", this.stopRequested);
    /*
    if(!this.stopRequested)
    {
        // 加速⇒等速
        this.velocity = Math.min(this.velocity + this.acceleration, this.maxSpeed * scalar * 2.0);
    }
    else
    {
        // 減速⇒停止
        this.velocity = Math.max(this.velocity - this.acceleration, 0);
    }
    */
  }
  move() {
    // 前の座標を保持
    this.prevX = this.x;
    this.prevY = this.y;
    const rad = this.angle * Math.PI / 180;
    this.x += Math.cos(rad) * this.velocity;
    this.y += Math.sin(rad) * this.velocity;
  }
  rotate(arrowAngle) {
    // 0～360に正規化
    const cur = normalizeAngle(this.angle);
    const tgt = normalizeAngle(arrowAngle);
    // signed 差分を[-180, +180) の範囲で求める
    let delta = (tgt - cur + 540) % 360 - 180;
    // 最大回転量でクランプ
    if (delta > this.rotateSpeed) {
      this.angle = cur + this.rotateSpeed;
    } else if (delta < -this.rotateSpeed) {
      this.angle = cur - this.rotateSpeed;
    }
  }
  renderLineLeftAngle() {
    this.spriteLineFrontLeft.show();
    this.spriteLineFrontRight.hide();
    this.spriteLineFrontLeft.modified();
  }
  renderLineRightAngle() {
    this.spriteLineFrontLeft.hide();
    this.spriteLineFrontRight.show();
    this.spriteLineFrontRight.modified();
  }
  set setTorpedoAngle(angle) {
    this.spriteTorpedoTubeFront.angle = angle;
  }
  renderTorpedoAngle() {
    this.spriteTorpedoTubeFront.modified();
  }
  shootTorpedo() {
    const now = gameAgeMs();
    if (now - this.lastShotTime < this.TORPEDO_RELOAD_MS) return;
    this.lastShotTime = now;
    const w = this.width;
    const h = this.height;
    // anchorを考慮した中心からのオフセット
    const ax = this.anchorX * w;
    const ay = this.anchorY * h;
    const dx = 96 - ax;
    const dy = 5.5 - ay;
    // スプライトの回転をラジアンに変換
    const rad = this.angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // 回転+平行移動
    const x = this.x + dx * cos - dy * sin;
    const y = this.y + dx * sin + dy * cos;
    console.log("angle:", this.angle);
    console.log("dx:" + x + " dy:" + y);
    console.log("x:" + x + " y:" + y);
    // 船体の慣性
    const PlayerRad = this.angle * Math.PI / 180;
    const pvx = Math.cos(PlayerRad) * this.velocity;
    const pvy = Math.sin(PlayerRad) * this.velocity;
    console.log("pvx:" + pvx + " pvy:" + pvy);
    this.torpedoManager.spawnTorpedo(x, y, this.spriteTorpedoTubeFront.angle + this.angle, pvx, pvy);
    //this.torpedoManager.spawnTorpedo(this.x + this.torpedoTubePos[this.torpedoTubeFrontIdx].x, this.y, this.spriteTorpedoTubeFront.angle + angle);
  }
}
exports.DestroyerMutsuki = DestroyerMutsuki;
function normalizeAngle(angle) {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}
function gameAgeMs() {
  return g.game.age * (1000 / g.game.fps);
}
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}