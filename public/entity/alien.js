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
		this.setVelocityY(300);
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
			frameQuantity: 5,
			key: 'laser',
			active: false,
			visible: false,
			classType: alienLaser
		});
	}
}
export class Alien extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y) {
		super(scene, x, y, 'alien');
        this.play("animateAlien");
		this.alienLaser = new alienLaserGroup(scene);
	}

	fireBullet(x,y){
		const laser = this.alienLaser.getFirstDead(true);
		if(laser) {
			laser.fire(x, y);
		}
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