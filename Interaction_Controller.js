class Interaction_Controller {

	constructor(player, ground) {
		this.player = player;
		this.ground = ground;

		this.player.addInteraction(this);
	}

	collisionExists(x, z) {
		let newX = this.player.curX + x;
		let newZ = (this.player.curZ - 1) + z;

		console.log('newX', newX)
		console.log('newZ', newZ)

		if (newZ < 0 || Math.abs(newX) > (this.ground.l - 1) / 2) {
			return true;
			console.log('return early')
		}
		let obstacles = this.ground.getStripObstacles(newZ);
		console.log('obstacles', obstacles)
		return obstacles.indexOf(newX) != -1;
	}

}