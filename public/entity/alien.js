class alienLaser extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y) {
		super(scene, x, y, 'laser');
	}
	preUpdate(time, delta) {
		super.preUpdate(time, delta);
 
		if (this.y <= 0) {
			this.setActive(false);
			this.setVisible(false);
            this.enableBody();
		}
	}
	fire(x, y) {
		this.body.reset(x, y);
		this.setActive(true);
		this.setVisible(true);
		this.setVelocityY(900);
	}
	hit(){
		this.setVisible(false);
        this.disableBody();
	}
}
export class alienLaserGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		super(scene.physics.world, scene);
		this.createMultiple({
			frameQuantity: 1,
			key: 'laser',
			active: false,
			visible: false,
			classType: alienLaser
		});
	}

	fireBullet(x, y) {
		const laser = this.getFirstDead(false);
		if(laser) {
			laser.fire(x, y);
		}
	}
}
export class Alien extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y) {
		super(scene, x, y, 'alien');
        this.play("animateAlien");
		this.alienLaser = new alienLaserGroup();
	}
}
export class AlienGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		super(scene.physics.world, scene);
		this.createMultiple({
			frameQuantity: 50,
			key: 'alien',
			active: true,
			visible: true,
			classType: Alien,
		});
	}
}