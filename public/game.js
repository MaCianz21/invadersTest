import {Laser,LaserGroup} from './entity/laser.js';
import {Alien,AlienGroup} from './entity/alien.js';

var score = 0;
var scoreText;
var ammo = 7;
var ammoText;
function removeAlien(alien,laser){
	alien.playExplosion();
	alien.disableBody(true,true);
	
	laser.hit();
	score += 10;
	scoreText.setText('Score: ' + score);
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
		this.explosion;
	}

	preload() {
		this.load.image('laser', './assets/laserBlue.png');
		this.load.image('ship', './assets/ship.png');
		this.load.spritesheet("alien","./assets/alien.png",{frameWidth: 48,frameHeight: 32});
		this.load.audio('bass', [ './audio/blaster.ogg', './audio/blaster.mp3' ]);
		this.load.audio('explosion', [ './audio/explosion.ogg', './audio/explosion.mp3' ]);
	}

	create() {
		
		this.bass = this.sound.add('bass');
		this.alienExplosion =  this.sound.add('explosion');
		scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFFF' });
		ammoText = this.add.text(16, 40, 'Ammo : 7', { fontSize: '32px', fill: '#FFFF' });
		this.anims.create({
			key: "animateAlien",
			frames: this.anims.generateFrameNumbers("alien"),
			frameRate: 2,
			repeat: -1,
		});
		this.laserGroup = new LaserGroup(this);
		this.alienGroup = new AlienGroup(this);
		
		this.addAliens();
		this.addShip();
		this.addEvents();
		this.physics.add.collider(this.alienGroup,this.laserGroup,removeAlien,null, this);
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
			ammo=7;
			ammoText.setText('Ammo : ' + ammo);
		}
			
		
	}
	addEvents() {
		this.input.on('pointermove', (pointer) => {
			this.ship.x = pointer.x;
		});

		this.input.on('pointerdown', (pointer) => {
			
			if(ammo>0)
			{
				ammo-=1;
			    ammoText.setText('Ammo : ' + ammo);
				this.fireBullet();
			    this.bass.play();
			}
			if(ammo==0)
			{
				ammoText.setText('Ammo : ' + ammo+ '[press R to reload ]');
			}

			
		});

		this.input.keyboard.on('keydown_R', this.reloadAmmo, this);
		// Firing bullets should also work on enter / spacebar press
		/*this.inputKeys = [
			this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
			this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
		];*/
	}

	fireBullet() {
		this.laserGroup.fireBullet(this.ship.x, this.ship.y - 20);
	}
	update(time, delta) {/*
		// Loop over all keys
		this.inputKeys.forEach(key => {
			// Check if the key was just pressed, and if so -> fire the bullet
			if(Phaser.Input.Keyboard.JustDown(key)) {
				this.alienGroup.fireBullet(this.alienGroup.getFirstAlive().x, this.alienGroup.getFirstAlive().y);
			}
		});*/
		if(Math.round(time/100)%20 == 0){
			var random = Phaser.Math.Between(0, 49);
			console.log(random);
			var alienShoot = this.alienGroup.getChildren()[random];
			alienShoot.fireBullet(alienShoot.x,alienShoot.y);
		}
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
	scene: [GameScene]
};

const game = new Phaser.Game(config);