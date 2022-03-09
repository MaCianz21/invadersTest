import {Laser,LaserGroup} from './entity/laser.js';
import {Alien,AlienGroup} from './entity/alien.js';

var score = 0;
var scoreText;
var ammo = 7;
var ammoText;
var life = 2;
var lifeText;
var timeText;
var timedEvent;
function removeAlien(alien,laser){
	var explosion = this.sound.add('explosion');	
	alien.disableBody(true,true);
	laser.hit();
	explosion.play();
	score += 10;
	scoreText.setText('Score: ' + score);
}

function reduceLife(ship,laser){
	
	life -= 1;
	scoreText.setText('Life: ' + score+'/2');
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
	}

	create() {
		
		this.bass = this.sound.add('bass');
		timedEvent = this.time.delayedCall(100000);
		scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFFF' });
		ammoText = this.add.text(16, 46, 'Ammo : 7', { fontSize: '32px', fill: '#FFFF' });
		lifeText = this.add.text(16, 76, 'Life : 2/2', { fontSize: '32px', fill: '#FFFF' });
		timeText = this.add.text(16, 106);
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
			var ammoEffect = this.sound.add('ammo');	
			ammoEffect.play();
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
				var outAmmoEffect = this.sound.add('outAmmo');	
			    outAmmoEffect.play();
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
	update(time, delta) {
		if(timedEvent.getProgress().toString().substr(0, 4)<0.60)
		{
			lifeText.setText('Time: ' + timedEvent.getProgress().toString().substr(0, 4));
		}
		if(timedEvent.getProgress().toString().substr(0, 4)==0.60)
		{
			lifeText.setText('Time: ' + 1.00);
			game.destroy(true);
		}
		/*
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