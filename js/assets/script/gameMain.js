window.gLocalAssetContainer["gameMain"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

// import { XorshiftRandomGenerator } from "@akashic/akashic-engine";
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGameMainScene = createGameMainScene;
const player_1 = require("./player");
const control_1 = require("./control");
const torpedo_1 = require("./torpedo");
const enemy_1 = require("./enemy");
// import * as al from "@akashic-extension/akashic-label";
function createGameMainScene() {
  // ========================================================================
  //  シーンの作成
  // ========================================================================
  const scene = new g.Scene({
    game: g.game,
    assetIds: ["background", "mutsuki_base", "mutsuki_building", "mutsuki_torpedo_tube", "arrow", "torpedo_bullet", "range", "line", "target", "island01", "island02", "island03", "island04", "explosion", "waterColumn", "Along the coast", "se", "se2"]
  });
  scene.onLoad.add(() => {
    // ====================================================================
    //  変数宣言
    // ====================================================================
    // レイヤー
    let backgroundLayer = null;
    let enemyLayer = null;
    let raderLayer = null;
    let torpedoLayer = null;
    let playerLayer = null;
    let controlLayer = null;
    let uiLayer = null;
    // UI
    let strokeFont = null;
    let knotLabel = null;
    let torpedoReloadLabel = null;
    let torpedoReloadBar = null;
    let torpedoReloadBarBackground = null;
    const torpedoReloadBarWidth = 250;
    const torpedoReloadBarHeight = 25;
    let scoreLabel = null;
    let timerLabel = null;
    // 背景
    let bg;
    const bgRows = 5;
    const bgCols = 5;
    const mapWidth = scene.assets["background"].width * bgCols; // 6400px
    const mapHeight = scene.assets["background"].height * bgRows; // 3600px
    // カメラ
    let camera = null;
    // 操作系
    const LEFT_CLICK = 0;
    const RIGHT_CLICK = 2;
    let clickedButtonType;
    let isDragging = false;
    let dragStartPos;
    let targetScalar = 0.0;
    let dx;
    let dy;
    let arrow = null;
    // 乱数
    // const rand = new XorshiftRandomGenerator(0);
    // const r = rand.generate();
    // タイム関係
    let time = 125;
    let remainingTime = time - 5;
    // スコア関係
    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.scoreの値をスコアとして扱います
    g.game.vars.gameState = {
      score: 0
    };
    // ====================================================================
    //  BGMの再生
    // ====================================================================
    let stageBgm = scene.assets["Along the coast"];
    let bgmPlayer = stageBgm.play();
    bgmPlayer.changeVolume(0.12);
    // ====================================================================
    //  レイヤーの生成
    // ====================================================================
    backgroundLayer = new g.E({
      scene: scene,
      parent: scene
    });
    enemyLayer = new g.E({
      scene: scene,
      parent: scene
    });
    raderLayer = new g.E({
      scene: scene,
      parent: scene
    });
    torpedoLayer = new g.E({
      scene: scene,
      parent: scene
    });
    playerLayer = new g.E({
      scene: scene,
      parent: scene
    });
    controlLayer = new g.E({
      scene: scene,
      parent: scene
    });
    uiLayer = new g.E({
      scene: scene,
      parent: scene
    });
    // ====================================================================
    //  UI表示関係
    // ====================================================================
    strokeFont = new g.DynamicFont({
      game: g.game,
      fontFamily: "sans-serif",
      fontColor: "black",
      strokeColor: "white",
      strokeWidth: 4,
      size: 36
    });
    knotLabel = new g.Label({
      scene: scene,
      parent: uiLayer,
      text: "SPEED:  0.00 kt",
      font: strokeFont,
      fontSize: strokeFont.size,
      x: 0.0,
      y: 0.0,
      anchorX: 0.0,
      anchorY: 0.5
    });
    torpedoReloadLabel = new g.Label({
      scene: scene,
      parent: uiLayer,
      text: "RELOAD:",
      font: strokeFont,
      fontSize: strokeFont.size,
      x: 0.0,
      y: 0.0,
      anchorX: 1.0,
      anchorY: 0.5
    });
    torpedoReloadBarBackground = new g.FilledRect({
      scene: scene,
      parent: uiLayer,
      width: torpedoReloadBarWidth,
      height: torpedoReloadBarHeight,
      cssColor: "#000000",
      x: 0.0,
      y: 0.0,
      anchorX: 0.0,
      anchorY: 0.5
    });
    torpedoReloadBar = new g.FilledRect({
      scene: scene,
      parent: uiLayer,
      width: torpedoReloadBarWidth,
      height: torpedoReloadBarHeight,
      cssColor: "#00ff00",
      x: 0.0,
      y: 0.0,
      anchorX: 0.0,
      anchorY: 0.5
    });
    scoreLabel = new g.Label({
      scene: scene,
      parent: uiLayer,
      text: "SCORE: 00000",
      font: strokeFont,
      fontSize: strokeFont.size,
      x: 0.0,
      y: 0.0,
      anchorX: 0.0,
      anchorY: 0.5
    });
    timerLabel = new g.Label({
      scene: scene,
      parent: uiLayer,
      text: "TIME: 120",
      font: strokeFont,
      fontSize: strokeFont.size,
      x: 0.0,
      y: 0.0,
      anchorX: 0.5,
      anchorY: 0.5
    });
    // ====================================================================
    //  背景の生成
    // ====================================================================
    bg = [];
    for (let r = 0; r < bgRows; r++) {
      bg[r] = [];
      for (let c = 0; c < bgCols; c++) {
        const sprite = new g.Sprite({
          scene: scene,
          parent: backgroundLayer,
          src: scene.assets["background"],
          width: scene.assets["background"].width,
          height: scene.assets["background"].height,
          x: scene.assets["background"].width * c,
          y: scene.assets["background"].height * r
        });
        bg[r][c] = sprite;
      }
    }
    // ====================================================================
    //  カメラの設定
    // ====================================================================
    camera = new g.Camera2D({});
    g.game.focusingCamera = camera; // ここでcameraの設置が画面描画に反映される
    // ====================================================================
    //  プレイヤーの生成
    // ====================================================================
    const player = new player_1.DestroyerMutsuki(scene, playerLayer, mapWidth / 2, mapHeight / 2);
    player.initStatus(3.0, 0.015, 0.3, 0, 0, 0); //player.initStatus(2.0, 0.005, 0.2, 0, 0, 0);
    // ====================================================================
    //  操作系統の生成
    // ====================================================================
    arrow = new control_1.Arrow(scene, controlLayer);
    // ====================================================================
    //  魚雷管理クラスの生成
    // ====================================================================
    const torpedoManager = new torpedo_1.TorpedoManager(scene, torpedoLayer);
    // ====================================================================
    //  敵管理クラスの生成
    // ====================================================================
    const enemyManager = new enemy_1.EnemyManager(scene);
    // ====================================================================
    //  各クラスの生成
    // ====================================================================
    player.setTorpedoManager = torpedoManager;
    torpedoManager.setEnemyManager = enemyManager;
    enemyManager.setPlayer = player;
    enemyManager.setSpawnLayer = enemyLayer;
    // ====================================================================
    //  敵の生成
    // ====================================================================
    const startTime = remainingTime;
    // 島
    enemyManager.addEnemySchedule("島1", startTime, 1280, 720);
    enemyManager.addEnemySchedule("島2", startTime, 4480, 850);
    enemyManager.addEnemySchedule("島3", startTime, 1350, 2160);
    enemyManager.addEnemySchedule("島4", startTime, 4000, 2520);
    // ターゲット
    enemyManager.addEnemySchedule("ターゲット", startTime, 960, 540);
    enemyManager.addEnemySchedule("ターゲット", startTime, 3200, 360);
    enemyManager.addEnemySchedule("ターゲット", startTime, 5300, 400);
    enemyManager.addEnemySchedule("ターゲット", startTime, 2200, 1000);
    enemyManager.addEnemySchedule("ターゲット", startTime, 4000, 1400);
    enemyManager.addEnemySchedule("ターゲット", startTime, 640, 2000);
    enemyManager.addEnemySchedule("ターゲット", startTime, 3200, 1550);
    enemyManager.addEnemySchedule("ターゲット", startTime, 5000, 1800);
    enemyManager.addEnemySchedule("ターゲット", startTime, 1920, 2500);
    enemyManager.addEnemySchedule("ターゲット", startTime, 4520, 2550);
    enemyManager.addEnemySchedule("ターゲット", startTime, 320, 3240);
    enemyManager.addEnemySchedule("ターゲット", startTime, 3200, 2900);
    enemyManager.addEnemySchedule("ターゲット", startTime, 5760, 3200);
    // ====================================================================
    //  タイマーカウント処理
    // ====================================================================
    const timer = scene.setInterval(() => {
      remainingTime--;
      if (remainingTime === 0) {
        scene.clearInterval(timer); // タイマーの停止
        // TODO: 終了処理
        player.stop();
        bgmPlayer.stop();
      }
    }, 1000);
    // ====================================================================
    //  フレーム毎の更新処理
    // ====================================================================
    scene.onUpdate.add(() => {
      // ================================================================
      //  UI表示更新
      // ================================================================
      knotLabel.x = 0.005 * g.game.width + camera.x;
      knotLabel.y = 0.96 * g.game.height + camera.y;
      knotLabel.text = "SPEED: " + formatNum(player.getKnot) + " kt";
      knotLabel.invalidate();
      torpedoReloadLabel.x = 0.395 * g.game.width + camera.x;
      torpedoReloadLabel.y = 0.96 * g.game.height + camera.y;
      torpedoReloadLabel.invalidate();
      torpedoReloadBarBackground.x = 0.5 * g.game.width + camera.x - torpedoReloadBarWidth / 2;
      torpedoReloadBarBackground.y = 0.96 * g.game.height + camera.y;
      torpedoReloadBarBackground.modified();
      torpedoReloadBar.x = torpedoReloadBarBackground.x;
      torpedoReloadBar.y = torpedoReloadBarBackground.y;
      const now = (0, player_1.gameAgeMs)();
      const elapsed = now - player.getLastShotTime;
      const t = Math.min(Math.max(elapsed / player.TORPEDO_RELOAD_MS, 0), 1);
      torpedoReloadBar.width = torpedoReloadBarWidth * t;
      torpedoReloadBar.modified();
      scoreLabel.x = 0.005 * g.game.width + camera.x;
      scoreLabel.y = 0.03 * g.game.height + camera.y;
      scoreLabel.text = "SCORE: " + String(g.game.vars.gameState.score).padStart(5, "0");
      scoreLabel.invalidate();
      timerLabel.x = 0.5 * g.game.width + camera.x;
      timerLabel.y = 0.03 * g.game.height + camera.y;
      timerLabel.text = "TIME: " + String(remainingTime).padStart(3, "0");
      timerLabel.invalidate();
      if (remainingTime === 0) return;
      if (isDragging) {
        player.rotate(arrow.angle);
        player.modified();
      }
      player.accelerate(player.getMaxSpeed * targetScalar);
      player.move();
      // 四隅のワールド座標を計算
      const w = player.width;
      const h = player.height;
      const ax = player.anchorX * w;
      const ay = player.anchorY * h;
      const rad = player.angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const localCorners = [{
        x: -ax,
        y: -ay
      },
      // 左上
      {
        x: -ax + w,
        y: -ay
      },
      // 右上
      {
        x: -ax,
        y: -ay + h
      },
      // 左下
      {
        x: -ax + w,
        y: -ay + h
      } // 右下
      ];
      const worldXs = [];
      const worldYs = [];
      for (const c of localCorners) {
        const wx = player.x + c.x * cos - c.y * sin;
        const wy = player.y + c.x * sin + c.y * cos;
        worldXs.push(wx);
        worldYs.push(wy);
      }
      const minX = Math.min(...worldXs);
      const maxX = Math.max(...worldXs);
      const minY = Math.min(...worldYs);
      const maxY = Math.max(...worldYs);
      // はみ出した分だけ中心をシフト
      if (minX < 0) {
        player.x += 0 - minX;
        player.stop();
      } else if (maxX > mapWidth) {
        player.x += mapWidth - maxX;
        player.stop();
      }
      if (minY < 0) {
        player.y += 0 - minY;
        player.stop();
      } else if (maxY > mapHeight) {
        player.y += mapHeight - maxY;
        player.stop();
      }
      player.modified();
      const tipPos = player.getTipPosition();
      arrow.x = tipPos.x;
      arrow.y = tipPos.y;
      //arrow.x = player.x + player.width / 2;
      //arrow.y = player.y;
      arrow.modified();
      camera.x = player.x - g.game.width / 2;
      camera.y = player.y - g.game.height / 2;
      camera.modified();
      torpedoManager.update();
      enemyManager.update(remainingTime);
    });
    // ====================================================================
    //  マウスボタンを押したとき
    // ====================================================================
    scene.onPointDownCapture.add(e => {
      // player.setStopRequested = true;
      if (remainingTime === 0) return;
      if (e.button === LEFT_CLICK) {
        clickedButtonType = LEFT_CLICK;
        targetScalar = 0.0;
        isDragging = true;
        dragStartPos = {
          x: e.point.x + camera.x,
          y: e.point.y + camera.y
        };
        dx = dragStartPos.x;
        dy = dragStartPos.y;
        // arrow.x = dragStartPos.x;
        // arrow.y = dragStartPos.y;
        // arrow.x = player.x + player.width / 2;
        // arrow.y = player.y;
        arrow.show();
        arrow.modified();
        //console.log("dragStartPos:", dragStartPos);
      } else
        // 右クリックが押されたとき
        {
          clickedButtonType = RIGHT_CLICK;
        }
    });
    // ====================================================================
    //  マウスドラッグ操作
    // ====================================================================
    scene.onPointMoveCapture.add(e => {
      if (remainingTime === 0) return;
      if (clickedButtonType === LEFT_CLICK) {
        dx = e.startDelta.x + dragStartPos.x;
        dy = e.startDelta.y + dragStartPos.y;
        //console.log("dx:" + dx + " dy:" + dy);
        //console.log("e.startDelta", e.startDelta);
        arrow.drag(dragStartPos.x, dragStartPos.y, dx, dy);
        targetScalar = arrow.getScalar;
        /*
        if(arrow.getScalar >= 0.01)
        {
            player.setStopRequested = false;
        }
        */
        arrow.modified();
      } else
        // 右クリックの時
        {
          const px = e.point.x - g.game.width / 2;
          const py = e.point.y - g.game.height / 2;
          const dragDeg = Math.atan2(py, px) * 180 / Math.PI;
          let diff = dragDeg - player.angle;
          // モジュロ演算で0...360に丸め
          diff = (diff % 360 + 360) % 360;
          const diffRad = diff * Math.PI / 180;
          const sin = Math.sin(diffRad);
          //console.log("px:" + px + " py:" + py);
          //console.log("dragDeg:", dragDeg);
          //console.log("diff", diff);
          //console.log("diffRad:", diffRad);
          //console.log("sin:", sin);
          const dx = e.prevDelta.x;
          const dy = e.prevDelta.y;
          // 角度をラジアンに
          const rad = player.angle * Math.PI / 180;
          // その方向の単位ベクトル
          const ux = Math.cos(rad);
          const uy = Math.sin(rad);
          // 内積で長さを取得
          const projLen = dx * ux + dy * uy;
          let angle;
          if (sin < 0)
            // 左舷をドラッグ
            {
              angle = player.getLineLeftAngle + projLen * player.getLineAngleSensitivity;
              angle = Math.max(-45, Math.min(45, angle));
              player.setLineLeftAngle = angle;
              player.renderLineLeftAngle();
            } else if (sin > 0)
            // 右舷をドラッグ
            {
              angle = player.getLineRightAngle - projLen * player.getLineAngleSensitivity;
              angle = Math.max(135, Math.min(225, angle));
              player.setLineRightAngle = angle;
              player.renderLineRightAngle();
            }
          player.setTorpedoAngle = angle - 90;
          player.renderTorpedoAngle();
        }
    });
    // ====================================================================
    //  マウスボタンを離したとき
    // ====================================================================
    scene.onPointUpCapture.add(e => {
      if (remainingTime === 0) return;
      if (clickedButtonType === LEFT_CLICK) {
        isDragging = false;
        arrow.scaleX = 0.0;
        arrow.hide();
        arrow.modified();
      } else
        // 右クリックの時
        {
          player.shootTorpedo();
        }
    });
  });
  return scene;
}
function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}
function formatNum(num) {
  // 小数点2桁までの文字列に四捨五入
  const fixed = num.toFixed(2);
  const [intPart, fracPart] = fixed.split(".");
  // 整数部を2桁に空白埋め
  const paddedInt = intPart.padStart(2, "0");
  return paddedInt + "." + fracPart;
}
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}