class Interaction_Controller {

	constructor(scene, player, ground) {
		this.scene = scene;
		this.player = player;
		this.ground = ground;

		this.collisionDelta = 0.2;
		this.player.addInteraction(this);
		this.ground.addInteraction(this);
	}

	get playerCoord() {
		return {
			x: this.player.curX,
			z: this.player.curZ - 1
		}
	}

	collisionExists(x, z) {
		let newX = this.playerCoord.x + x;
		let newZ = this.playerCoord.z + z;
		if (newZ < 0 || Math.abs(newX) > (this.ground.l - 1) / 2) {
			return true;
		}

		let obstacles = this.ground.getStripObstacles(newZ);
		for (let obstacle of obstacles) {
			if (Math.abs(obstacle - newX) < this.collisionDelta) {
				return true;
			}
		}
		return false;
	}

	playerOnWater() {
		let type = this.ground.getType(this.playerCoord.z);
		if (type == 'water') {
			this.scene.gameOver();
			return true;
		}
		return false;
	}

	squashPlayer() {
		this.player.squash();
	}

}