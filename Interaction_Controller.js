class Interaction_Controller {

	constructor(player, ground) {
		this.player = player;
		this.ground = ground;

		this.player.addInteraction(this);
	}

	collisionExists(x, z) {
		let newX = this.player.curX + x;
		let newZ = (this.player.curZ - 1) + z;
		let obstacles = this.ground.getStripObstacles(newZ);

		console.log('delta x', x)
		console.log('delta z', z)

		console.log('currentX', this.player.curX)
		console.log('newX', newX)

		console.log('currentZ', this.player.curZ - 1)
		console.log('newZ', newZ)

		console.log('obstacles', obstacles)

		return obstacles.indexOf(newX) != -1;
	}

}