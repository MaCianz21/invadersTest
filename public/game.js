class Laser extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y) {
		super(scene, x, y, 'laser');
	}
	preUpdate(time, delta) {
		super.preUpdate(time, delta);
 
		if (this.y <= 0) {
			this.setActive(false);
			this.setVisible(false);
		}
	}
	fire(x, y) {
		this.body.reset(x, y);

		this.setActive(true);
		this.setVisible(true);

		this.setVelocityY(-900);
	}
	hit(){
		this.setActive(false);
		this.setVisible(false);
	}
}

class LaserGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		super(scene.physics.world, scene);
		this.createMultiple({
			frameQuantity: 30,
			key: 'laser',
			active: false,
			visible: false,
			classType: Laser
		});
	}

	fireBullet(x, y) {
		const laser = this.getFirstDead(false);
		if(laser) {
			laser.fire(x, y);
		}
	}
	getLaser(){
		return this.getFirstAlive(false);
	}
}
function removeAlien(alien,laser){
	alien.disableBody(true,true);
	laser.hit();
}/*
class AlienGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		super(scene.physics.world, scene);
		this.createMultiple({
			frameQuantity: 30,
			key: 'laser',
			active: false,
			visible: true,
			classType: Alien
		});
	}
}*/
class GameScene extends Phaser.Scene
{
	constructor() {
		super("GameScene");
		this.ship;
		this.alien;
		this.laserGroup;
		this.inputKeys;
	}

	preload() {
		this.load.image('laser', './assets/laserBlue.png');
		this.load.image('ship', './assets/ship.png');
		this.load.spritesheet("alien","./assets/alien.png",{frameWidth: 48,frameHeight: 32});
	}

	create() {
		this.anims.create({
			key: "animateAlien",
			frames: this.anims.generateFrameNumbers("alien"),
			frameRate: 2,
			repeat: -1,
		});
		this.laserGroup = new LaserGroup(this);
		//this.alienGroup = new AlienGroup(this);
		
		this.addAliens();
		this.addShip();
		this.addEvents();
		this.physics.add.collider(this.alien,this.laserGroup,removeAlien,null, this);
	}
	addAliens(){
		const centerX = this.cameras.main.width / 2;
		const bottom = 100;
		this.alien = this.physics.add.sprite(centerX,bottom, 'alien').play("animateAlien");
	}

	addShip() {
		const centerX = this.cameras.main.width / 2;
		const bottom = this.cameras.main.height;
		this.ship = this.physics.add.sprite(centerX, bottom - 90, 'ship');
		this.ship.setCollideWorldBounds(true);
	}

	addEvents() {
		// Moving the mouse should move the ship
		this.input.on('pointermove', (pointer) => {
			this.ship.x = pointer.x;
		});

		// Clicking the mouse should fire a bullet
		this.input.on('pointerdown', (pointer) => {
			this.fireBullet();
		});

		// Firing bullets should also work on enter / spacebar press
		this.inputKeys = [
			this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
			this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
		];
	}

	fireBullet() {
		this.laserGroup.fireBullet(this.ship.x, this.ship.y - 20);
	}

	update() {
		// Loop over all keys
		this.inputKeys.forEach(key => {
			// Check if the key was just pressed, and if so -> fire the bullet
			if(Phaser.Input.Keyboard.JustDown(key)) {
				this.fireBullet();
			}
		});

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
    height: 600
  } ,
	scene: [GameScene]
};

const game = new Phaser.Game(config);
