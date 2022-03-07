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