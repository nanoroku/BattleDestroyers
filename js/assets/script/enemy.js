window.gLocalAssetContainer["enemy"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnemyManager = void 0;
const effect_1 = require("./effect");
// ============================================================================
//  エネミー基本クラス
// ============================================================================
class Enemy extends g.Sprite {
  constructor(scene, layer, assetId, x, y, hp, speed, score) {
    super({
      scene: scene,
      src: scene.assets[assetId],
      parent: layer,
      local: true,
      width: scene.assets[assetId].width,
      height: scene.assets[assetId].height,
      x: x,
      y: y,
      anchorX: 0.5,
      anchorY: 0.5
    });
    this.maxHp = hp;
    this.hp = this.maxHp;
    this.speed = speed;
    this.score = score;
    this.isDestroy = false;
    this.seKilled = scene.assets["se"];
    this.seDamaged = scene.assets["se2"];
    this.effect = new effect_1.Explosion(scene, layer);
  }
  get getScore() {
    return this.score;
  }
  get getCollisionArea() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
  takeDamage(damage) {
    if (this.isDestroy) return;
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isDestroy = true;
      this.killed();
      this.destroy();
      g.game.vars.gameState.score += this.score;
    } else {
      let se = this.seDamaged.play();
      se.changeVolume(0.12);
    }
  }
}
// ============================================================================
//  ターゲット
// ============================================================================
class Target extends Enemy {
  constructor(scene, layer, x, y) {
    super(scene, layer, "target", x, y, 1, 0, 1000);
  }
  move() {
    // 動作させない
  }
  killed() {
    this.effect.startEffect(this.x, this.y);
    let se = this.seKilled.play();
    se.changeVolume(0.12);
  }
}
// ============================================================================
//  島
// ============================================================================
class Island extends Enemy {
  constructor(scene, layer, assetName, x, y) {
    super(scene, layer, assetName, x, y, 0, 0, 0);
  }
  move() {}
  takeDamage(damage) {
    // ダメージを受けない    
  }
  killed() {
    // ダメージを受けない
  }
}
// ============================================================================
//  敵管理クラス
// ============================================================================
class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.schedule = [];
  }
  set setSpawnLayer(layer) {
    this.spawnLayer = layer;
  }
  set setPlayer(player) {
    this.player = player;
  }
  get getEnemies() {
    return this.enemies;
  }
  addEnemySchedule(assetId, spawnTime, x, y) {
    this.schedule.push({
      assetId,
      spawnTime,
      x,
      y
    });
  }
  spawnEnemy(enemyName, x, y) {
    let enemy;
    switch (enemyName) {
      case "ターゲット":
        enemy = new Target(this.scene, this.spawnLayer, x, y);
        break;
      case "島1":
        enemy = new Island(this.scene, this.spawnLayer, "island01", x, y);
        break;
      case "島2":
        enemy = new Island(this.scene, this.spawnLayer, "island02", x, y);
        break;
      case "島3":
        enemy = new Island(this.scene, this.spawnLayer, "island03", x, y);
        break;
      case "島4":
        enemy = new Island(this.scene, this.spawnLayer, "island04", x, y);
        break;
      default:
        break;
    }
    if (enemy) {
      this.enemies.push(enemy);
    }
  }
  checkCollisions() {
    this.enemies.forEach(enemy => {
      if (enemy.destroyed()) return;
      if (g.Collision.intersectEntities(this.player, enemy)) {
        this.player.x = this.player.getPrevX;
        this.player.stop();
      }
      if (g.Collision.intersectEntities(this.player, enemy)) {
        this.player.y = this.player.getPrevY;
        this.player.stop();
      }
    });
  }
  update(remainingTime) {
    for (let i = this.schedule.length - 1; i >= 0; i--) {
      const enemyData = this.schedule[i];
      if (remainingTime <= enemyData.spawnTime) {
        this.spawnEnemy(enemyData.assetId, enemyData.x, enemyData.y);
        this.schedule.splice(i, 1);
      }
    }
    // 全ての敵の移動処理
    this.enemies.forEach(enemy => enemy.move());
    // 全てのエネミーの衝突判定処理
    this.checkCollisions();
    // 削除した敵をリストからも削除
    this.enemies = this.enemies.filter(enemy => !enemy.destroyed());
  }
}
exports.EnemyManager = EnemyManager;
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}