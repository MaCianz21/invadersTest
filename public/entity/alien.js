class alienLaser extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y) {
		super(scene, x, y, 'laserAlien');
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
		this.setVelocityY(300);
	}
	hit(){
		this.setVisible(false);
		this.setActive(false);
        this.disableBody();
		this.setVelocityY(0);
	}
}
export class AlienLaserGroup extends Phaser.Physics.Arcade.Group
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
	fireBullet(x,y){
		const laser = this.getFirstDead(true);
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