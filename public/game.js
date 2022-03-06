//Game scene
var player;
var cursors;
const w = 800;
const h = 600;
class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  
  //load assets
  preload() {
    this.load.spritesheet(
      "ship",
      "./assets/ship.png",
      {
        frameWidth: 60,
        frameHeight: 32
      }
    );
  }
  
  //init variables, define animations & sounds, and display assets
  create() {
    player = this.physics.add.sprite(400, 300, 'ship');
    player.y = h*0.9;
    cursors = this.input.keyboard.createCursorKeys();
    player.setCollideWorldBounds(true);
  }
  //update the attributes of various game objects per game logic
  update(){
    if (cursors.left.isDown){
        player.setVelocityX(-160);
    }
    else if (cursors.right.isDown){
        player.setVelocityX(160);
    }
    else{
        player.setVelocityX(0);
    }
  }
}

//config init
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 }
      }
  },
  scene: [GameScene],
  scale: {
    parent: 'container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: w,
    height: h
  } 
};

var game = new Phaser.Game(config);
