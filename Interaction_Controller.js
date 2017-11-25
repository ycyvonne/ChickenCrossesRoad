class Interaction_Controller {

	constructor(player, ground) {
		this.player = player;
		this.ground = ground;

		this.player.addInteraction(this);
	}

	collisionExists(x, z) {
		let newX = this.player.curX + x;
		let newZ = (this.player.curZ - 1) + z;

		if (newZ < 0 || Math.abs(newX) > (this.ground.l - 1) / 2) {
			return true;
		}
		let obstacles = this.ground.getStripObstacles(newZ);
		return obstacles.indexOf(newX) != -1;
	}

}