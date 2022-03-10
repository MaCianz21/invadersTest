import {Laser,LaserGroup} from './entity/laser.js';
import {Alien,AlienGroup,AlienLaserGroup} from './entity/alien.js';

var score = 0;
var scoreText;
var ammo = 3;
var ammoText;
var timeText;
var timedEvent;
var lastLaserTime = 0;
var startGame;
var gameOverText;
function removeAlien(alien,laser){
	var explosion = this.sound.add('explosion');	
	alien.disableBody(true,true);
	laser.hit();
	explosion.play();
	score += 10;
	scoreText.setText('Score: ' + score);
}

function shipHit(ship,laser){
	var explosion = this.sound.add('explosion');
	
	laser.destroy();
	explosion.play();

	if(score>5)
	{
		score -= 5;
	    scoreText.setText('Score: ' + score);
	}
	else
	{
		score=0;
		scoreText.setText('Score: ' + score);
	}
	
}


class GameScene extends Phaser.Scene
{
	constructor() {
		super("GameScene");
		this.ship;
		this.alienGroup;
		this.laserGroup;
		this.inputKeys;
		this.bass;
		
	}

	preload() {
		this.load.image('laser', './assets/laserBlue.png');
		this.load.image('ship', './assets/ship.png');
		this.load.spritesheet("alien","./assets/alien.png",{frameWidth: 48,frameHeight: 32});
		this.load.audio('bass', [ './audio/blaster.ogg', './audio/blaster.mp3' ]);
		this.load.audio('explosion', [ './audio/explosion.ogg', './audio/explosion.mp3' ]);
		this.load.audio('ammo', [ './audio/ammo.ogg', './audio/ammo.mp3' ]);
		this.load.audio('outAmmo', [ './audio/outAmmo.ogg', './audio/outAmmo.mp3' ]);
		this.load.audio('gameOver', [ './audio/gameOver.ogg', './audio/gameOver.mp3' ]);
		this.load.audio('startGame', [ './audio/game.ogg', './audio/game.mp3' ]);
		this.load.audio('shootDelay', [ './audio/Click1.wav' ]);
		
	}

	create() {
		this.bass = this.sound.add('bass');
	    startGame = this.sound.add('startGame');
		startGame.play();	
		timedEvent = this.time.delayedCall(100000);
		//timedEvent = this.time.delayedCall(3000);
		scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '30px', fill: '#FFFF' });
		ammoText = this.add.text(16, 46, 'Ammo : 3', { fontSize: '30px', fill: '#FFFF' });
		timeText = this.add.text(16, 76, 'Time : 0.00', { fontSize: '30px', fill: '#FFFF' });
		


		this.anims.create({
			key: "animateAlien",
			frames: this.anims.generateFrameNumbers("alien"),
			frameRate: 2,
			repeat: -1,
		});
		this.laserGroup = new LaserGroup(this);
		this.alienGroup = new AlienGroup(this);
		this.alienLaser = new AlienLaserGroup(this);

		this.addAliens();
		this.addShip();
		this.addEvents();
		this.physics.add.collider(this.alienGroup,this.laserGroup,removeAlien,null, this);
		this.physics.add.overlap(this.ship,this.alienLaser,shipHit,null, this);
		
	}
	addAliens(){
		const centerX = this.cameras.main.width / 2;
		const bottom = 100;

		var children = this.alienGroup.getChildren();
		var x = 18;
		var y = 100;
		for (var i = 0; i < children.length; i++){
			if(i%10 == 0){
				y = y + 50;
				x = 18;
			}
			x = x + 68;
			children[i].setPosition(x, y);
   		}
	}

	addShip() {
		const centerX = this.cameras.main.width / 2;
		const bottom = this.cameras.main.height;
		this.ship = this.physics.add.sprite(centerX, bottom - 90, 'ship');
		this.ship.setCollideWorldBounds(true);
	}

	reloadAmmo(event)
	{
		if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.R) {
			var ammoEffect = this.sound.add('ammo');	
			ammoEffect.play();
			ammo=3;
			ammoText.setText('Ammo : ' + ammo);
		}
			
		
	}
	addEvents() {
		this.input.on('pointermove', (pointer) => {
			this.ship.x = pointer.x;
		});

		this.input.on('pointerdown', (pointer) => {
			var time = timedEvent.getProgress().toString().substr(0, 5);
			console.log(time - lastLaserTime );
			
			if(ammo>0)
			{
				if (time - lastLaserTime >0.005){
					lastLaserTime = time;
					ammo-=1;
					ammoText.setText('Ammo : ' + ammo);
					this.fireBullet();
					this.bass.play();
				}
				else{
					var shootDelay = this.sound.add('shootDelay');	
					shootDelay.play();
				}
			}
			if(ammo==0)
			{
				ammoText.setText('Ammo : ' + ammo+ '[press R to reload ]');
				var outAmmoEffect = this.sound.add('outAmmo');	
				outAmmoEffect.play();
			}
			
		});

		this.input.keyboard.on('keydown_R', this.reloadAmmo, this);
	}
	fireBullet() {
		this.laserGroup.fireBullet(this.ship.x, this.ship.y - 20);
	}
	update(time) {
		if(timedEvent.getProgress().toString().substr(0, 4)<0.60)
		{
			timeText.setText('Time: ' + timedEvent.getProgress().toString().substr(0, 4));
		}
		if(timedEvent.getProgress().toString().substr(0, 4)==0.60)
		{
			if(timedEvent.getProgress().toString().substr(0, 4)==0.60)
		    {
				startGame.stop();
				this.scene.start('GameOver');
		    }
			
			
		}
		if(Math.round(time/100)%10 == 0){
			var random = Phaser.Math.Between(0, 49);
			var alienShoot = this.alienGroup.getChildren()[random];
			this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
		}
	}
}
class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('GameOver');
    }
 
	preload() {
		
		this.load.audio('gameOver', [ './audio/gameOver.ogg', './audio/gameOver.mp3' ]);
		

	}
    create ()
    {
        var gameOver = this.sound.add('gameOver');	
		
		scoreText = this.add.text(16, 16, 'Score: '+score, { fontSize: '32px', fill: '#FFFF' });
		gameOverText = this.add.text(200, 300, 'GAME OVER', { fontSize: '80px', fill: '#FF0000' });
        gameOver.play();

        
    }
}
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 0 },
			enableBody: true
		}
	},
  scale: {
    parent: 'container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 700
  } ,
	scene: [GameScene,GameOver]
};

const game = new Phaser.Game(config);