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

	collisionExists(dx, dz) {
		let newX = this.playerCoord.x + dx;
		let newZ = this.playerCoord.z + dz;
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

	dangerExists(dx, dz) {
		let newX = this.playerCoord.x + dx;
		let newZ = this.playerCoord.z + dz;
		let dangers = this.ground.getStripDangers(newZ);
		for (let danger of dangers) {
			if (Math.abs(danger - newX) < this.collisionDelta) {
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