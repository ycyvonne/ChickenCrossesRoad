class Player extends Basic_Component {

	constructor(context, gs, mt, stack) {
		super(context);
		this.gs = gs;
		this.mt = mt;
		this.stack = stack;

		this.curX = 0;
		this.curZ = 1;
		this.step = 1;
		this.rotateAngle = 0;

		this.lastJumpingTime = 0;
		this.jumpDuration = 100;
		this.isJumping = 0;
		this.isSquashed = false;
	}

	addInteraction(interaction) {
		this.interaction = interaction;
	}

	drawWing(graphics_state, model_transform, orientation) {
		model_transform = model_transform
								.times(this.scale(orientation, 1, 1))
	    						.times(this.translate(1, 0, 0))
	    						.times(this.scale(0.3, 0.2, 0.6));

	    this.shapes.box.draw(graphics_state, model_transform, this.white);
	}

	triggerJump(time) {
		this.lastJumpingTime = time;
		this.isJumping = 1;
	}

	squash() {
		this.isSquashed = true;
	}
	
	draw(time) {
		let model_transform = this.mt;
		let graphics_state = this.gs;

		// handle jump
		if (this.isJumping) {
			if (this.lastJumpingTime + this.jumpDuration < time) {
				this.isJumping = 0;
			}
		}
		model_transform = model_transform.times(this.translate(0, this.isJumping * 0.4, 1));

		if (this.isSquashed) {
			model_transform = model_transform.times(this.scale(1,0.1, 1));
		}

		// draw feet


		// draw body
	    model_transform = model_transform
	    					.times(this.translate(this.curX * 2, 0.6 + 0.2, -this.curZ * 2))
	    					.times(this.scale(1/1.6, 1/1.3, 1/1.6));

	   	// handle rotations
	    model_transform = model_transform.times(this.rotate(this.rotateAngle * Math.PI / 180, 0, 1, 0));
	    					
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(1, 0.6, 1));
	    this.shapes.box.draw(graphics_state, model_transform, this.white);
	    model_transform = this.stack.pop();

	    // draw wings
	    for (let orientation of [1, -1]) {
	    	this.drawWing(graphics_state, model_transform, orientation);
	    }
	    // draw tail
	    this.drawWing(graphics_state, model_transform.times(this.rotate(90 * Math.PI / 180, 0, 1, 0)), -1)

	    // draw head
	    model_transform = model_transform.times(this.translate(0, 1, -0.3));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(1, 0.7, 0.7));
	    this.shapes.box.draw(graphics_state, model_transform, this.white);
	    model_transform = this.stack.peek();

	    // draw feather on head
	    model_transform = model_transform
	    					.times(this.translate(0, 0.8, 0))
	    					.times(this.scale(0.3, 0.2, 0.5));
	    this.shapes.box.draw(graphics_state, model_transform, this.red);

	    // draw eyes
	    model_transform = this.stack.peek();
	    model_transform = model_transform
	    					.times(this.translate(0, 0.4, 0))
	    					.times(this.scale(1.1, 0.1, 0.1));
	    this.shapes.box.draw(graphics_state, model_transform, this.black);
	    

	    //draw beak
	    model_transform = this.stack.peek();
	    model_transform = model_transform
	    					.times(this.translate(0, 0, -1))
	    					.times(this.scale(0.2, 0.2, 0.3));
		this.shapes.box.draw(graphics_state, model_transform, this.red);

	    model_transform = this.stack.pop();
	}


	goForward(time) {
		this.triggerJump(time);
		this.rotateAngle = 0;
		if (!this.interaction.collisionExists(0,1)) {
			this.curZ += this.step;
			if (this.interaction.playerOnWater()) {
				console.log('water!')
			}
		}
	}

	goBackward(time) {
		this.triggerJump(time);
		this.rotateAngle = 180;
		if (!this.interaction.collisionExists(0,-1)) {
			this.curZ -= this.step;
			if (this.interaction.playerOnWater()) {
				console.log('water!')
			}
		}
	}

	goLeft(time) {
		this.triggerJump(time);
		this.rotateAngle = 90;
		if (!this.interaction.collisionExists(-1, 0)) {
			this.curX -= this.step;
			if (this.interaction.playerOnWater()) {
				console.log('water!')
			}
		}
	}

	goRight(time) {
		this.triggerJump(time);
		this.rotateAngle = 270;
		if (!this.interaction.collisionExists(1, 0)) {
			this.curX += this.step;
			if (this.interaction.playerOnWater()) {
				console.log('water!')
			}
		}
	}

}
























