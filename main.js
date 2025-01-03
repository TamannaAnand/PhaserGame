var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

var platforms, player, stars, bombs, cursors, scoreText, score = 0, level = 1, levelText;
var gameOver = false;
var playAgainButton;

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.image("gameover", "assets/gameOver.png")
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
    // Add sky background
    this.add.image(400, 300, "sky");
  
    // Platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");
  
    // Player setup
    player = this.physics.add.sprite(100, 450, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);
  
    // Animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });
  
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  
    // Stars
    stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });
  
    stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
  
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
  
    // Score text
    scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
  
    // Level text
    levelText = this.add.text(634, 16, "Level: 1", {
      fontSize: "32px",
      fill: "#000",
    });
  
    // Bombs
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
  
    // Input
    cursors = this.input.keyboard.createCursorKeys();
  
    // Play Again Button
    playAgainButton = document.querySelector("button");
    playAgainButton.style.display = "none"; // Initially hide the button
    playAgainButton.addEventListener("click", () => {
      restartGame(this);
    });
  }
  

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    level += 1;
    levelText.setText("Level: " + level);
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  gameOver = true;

  // Add the "Game Over" image and make it fit the canvas
  const gameOverImage = this.add.image(400, 300, "gameover"); // Centered at canvas
  gameOverImage.setDisplaySize(800, 600); // Scale to canvas size

  playAgainButton.style.display = "block"; // Show the "Play Again" button
}


function restartGame(scene) {
  playAgainButton.style.display = "none"; // Hide the button
  gameOver = false;
  score = 0;
  level = 1;
  scene.scene.restart(); // Restart the current scene
}
