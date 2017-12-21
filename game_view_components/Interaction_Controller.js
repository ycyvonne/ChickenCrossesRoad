class Interaction_Controller {

	constructor(scene, player, ground) {
		this.scene = scene;
		this.player = player;
		this.ground = ground;
		this.highestScore = 0;
		this.currentScore = 0;

		this.collisionDelta = 0.2;
		this.player.addInteraction(this);
		this.ground.addInteraction(this);
		this.gameIsOver = false;
	}

	get playerCoord() {
		return {
			x: this.player.curX,
			z: this.player.curZ - 1
		}
	}

	reset() {
		this.scene.reset();
	}

	decrementScore() {
		this.currentScore--;
	}

	incrementScore() {
		this.currentScore++;
		if (this.currentScore > this.highestScore) {
			this.highestScore = this.currentScore;
			document.querySelector('.score').innerHTML = this.highestScore;

			if (this.highestScore >= 5) {
				document.querySelector('.instructions').classList.add('hide');
			}
		}
	}

	gameOver() {
		if (!this.gameIsOver) {

			this.gameIsOver = true;
			this.scene.disableGame();

			setTimeout(() => {
				document.querySelector('.game-over').classList.add('show');
				document.querySelector('.high-score').innerHTML = this.highestScore;
				document.querySelector('.score').innerHTML = 0;
			}, 500);
			
			setTimeout(() => {
				this.reset()
			}, 1500);
		}
	}

	generateGround() {
		const stagger = 10;
		if (this.highestScore % stagger == 0 && this.ground.tryToGenerateMore(stagger)) {
			this.ground.addInteraction(this);
		}
	}

	collisionExists(dx, dz) {
		let newX = this.playerCoord.x + dx;
		let newZ = this.playerCoord.z + dz;

		if (newZ < 0 || Math.abs(newX) > (this.ground.l - 1) / 2) {
			return true;g
		}

		let obstacles = this.ground.getStripObstacles(newZ);
		// console.log('obstacles', obstacles)
		// console.log('z', newZ)
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

	playerOnWater(z) {
		if (typeof z == 'undefined') {
			z = this.playerCoord.z;
		}

		let type = this.ground.getType(z);
		if (type == 'water') {
			return true;
		}
		return false;
	}

	isSafe(dx, dz) {
		let newX = this.playerCoord.x + dx;
		let newZ = this.playerCoord.z + dz;

		if (!this.playerOnWater(newZ)) {
			return true;
		}

		let safety = this.ground.getSafety(newZ);
		return safety.indexOf(newX) != -1;
	}

	squashPlayer() {
		this.player.squash();
	}

}