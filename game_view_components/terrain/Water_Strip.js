class Water_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.type = 'water';
		this.w = 1;
		this.h = 0.1;

		this.initialDelay = this.getRandom(0, 1, 3);

		this.material = context
        	.get_instance(Phong_Model)
        	.material(Color.of(0, 0, 0, 1), 1, 1, 1, 100, context.get_instance('/assets/water.png'));
        this.material = this.blue;
	}

	get safety() {
		let s = [];
		for (let lily of this.lilyPads) {
			s.push(lily.pos_x)
		}
		return s;
	}

	drawLilyPad(graphics_state, model_transform, options) {

		model_transform = model_transform
								.times(this.translate(options.pos_x * 2, 0, 0))
								.times(this.scale(1/Math.sqrt(2), 0.2, 1/Math.sqrt(2)))
								.times(this.rotate(45 * Math.PI / 180, 0, 1, 0))
								.times(this.rotate(20 * (Math.sin(options.time / 1000) * this.initialDelay) * Math.PI / 180, 0, 1, 0))
		this.shapes.box.draw(graphics_state, model_transform, this.green);

		this.stack.push(model_transform);
		model_transform = model_transform
							.times(this.translate(0.2, 0, -0.2))
							.times(this.scale(0.8, 1.01, 0.8));

		this.shapes.box.draw(graphics_state, model_transform, this.greenDark);

		model_transform = this.stack.peek();
		model_transform = model_transform
							.times(this.translate(0.4, 0, -0.4))
							.times(this.scale(0.6, 1.02, 0.6));

		this.shapes.box.draw(graphics_state, model_transform, this.green);

		model_transform = this.stack.peek();
		model_transform = model_transform
							.times(this.translate(0.6, 0, -0.6))
							.times(this.scale(0.4, 1.03, 0.4));

		this.shapes.box.draw(graphics_state, model_transform, this.greenDark);
		this.stack.pop();
	}

	initData() {
		if (!this.lilyPadNum) {
			this.lilyPadNum = this.getRandom(1, 5, 0);
		}

		if (!this.lilyPads) {
			this.lilyPads = [];
			for (let i = 0; i < this.lilyPadNum; i++) {
				let randomX = this.getRandom(-5, 5, 0);
				this.lilyPads.push({
					pos_x: randomX
				});
			}
		}
	}

	draw(time) {
		const offset = this.id * 2;
		let model_transform = this.mt;
		let graphics_state = this.gs;

		this.initData();
		
		model_transform = this.stack.peek();
	    model_transform = model_transform.times(this.translate(0, this.h, -this.w - offset));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(this.l, this.h, this.w));
	    this.shapes.box.draw(graphics_state, model_transform, this.material);
	    model_transform = this.stack.pop();

	    for (let lily of this.lilyPads) {
	    	this.drawLilyPad(graphics_state, model_transform, {
		    	pos_x: lily.pos_x,
		    	time: time
		    });
	    }
	    
	}
}