class Ground {
	constructor(context, graphics_state, model_transform, stack) {
		this.context = context;
		this.gs = graphics_state;
		this.mt = model_transform;
		this.stack = stack;
		this.l = 21;

		this.currentStripId = 0;
		this.strips = [];

		this.base = new Ground_Base(context, graphics_state, model_transform, stack, this.l);
	}

	draw(time) {
		this.base.draw(time);
		for (let strip of this.strips) {
			strip.draw(time);
		}
	}

	addStrip(type) {

		let strip = null;

		switch(type) {
			case 'grass': 
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				break;
			case 'street':
				strip = new Street_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId += 2;
				break;
			case 'water':
				strip = new Water_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				break;
			default:
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
		}

		this.strips.push(strip);
	}

	getStripObstacles(stripId) {
		if (stripId < 0 || stripId > this.currentStripId) {
			return [];
		}
		return this.strips[stripId].obstacles;
	}
}

class Ground_Base extends Basic_Component {
	constructor(context, gs, mt, stack, length) {
		super(context);
		this.gs = gs;
		this.mt = mt;
		this.stack = stack;

		this.h = 0.1;
		this.l = length;
	}

	draw(time) {
		let model_transform = this.mt;
		let graphics_state = this.gs;

	    this.stack.push(model_transform);
	    model_transform = model_transform
	                        .times(this.translate(0, 0, -100))
	                        .times(this.scale(this.l, this.h, 100))
	    this.shapes.box.draw(graphics_state, model_transform, this.grey);
	}
}

class Ground_Strip extends Basic_Component {
	constructor(context, id, gs, mt, stack) {
		super(context);
		this.id = id;
		this.gs = gs;
		this.mt = mt;
		this.stack = stack;
		this.h = 0.2;
		this.l = 21;
		this.obstacles = [];
	}
}

class Street_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.cars = new Cars(context, gs, stack);
		this.cars.addCar(0);
		// this.car = new Car(context, gs, stack, 3);
		this.w = 2;
	}

	drawStreetLine(graphics_state, model_transform, options) {
		model_transform = model_transform
							.times(this.translate(options.pos_x, 0, 0))
							.times(this.scale(2, 0.02, 0.2));
		this.shapes.box.draw(graphics_state, model_transform, this.greyLight);
	}

	drawWheel(graphics_state, model_transform, options) {

		// outer black wheel
		model_transform = model_transform
							.times(this.scale(options.flipX, 1, options.flipZ))
							.times(this.translate(1.5, 0.4, 1))
							.times(this.scale(0.4, 0.4, 0.2));
		this.shapes.box.draw(graphics_state, model_transform, this.black);

		// inner white
		model_transform = model_transform
							.times(this.translate(0, 0, 0.01))
							.times(this.scale(0.3, 0.3, 1));
		this.shapes.box.draw(graphics_state, model_transform, this.white);
	}

	draw(time) {
		let model_transform = this.mt;
		let graphics_state = this.gs;

		this.cars.draw(model_transform, time);

		// draw street lines
		model_transform = model_transform.times(this.translate(0, 0.1, -2));
		for (let x of [-16, -8, 0, 8, 16]) {
			this.drawStreetLine(graphics_state, model_transform, {
				pos_x: x
			});
		}
	}
}

class Water_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
	}

	draw() {
	}
}

class Grass_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.treeNum = null;
		this.trees = null;
		this.w = 1;
	}

	draw_tree(graphics_state, model_transform, options) {
	    const tree_trunk_th = 0.5;

	    // tree trunk
	    model_transform = model_transform.times(this.translate(20 * options.position_x, tree_trunk_th, 0));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(tree_trunk_th, tree_trunk_th, tree_trunk_th));
	    this.shapes.box.draw(graphics_state, model_transform, this.brown);

	    // tree top
	    model_transform = this.stack.pop();
	    model_transform = model_transform
	                        .times(this.translate(0, options.height + tree_trunk_th, 0))
	                        .times(this.scale(1, options.height, 1));
	    this.shapes.box.draw(graphics_state, model_transform, this.green);
	}

	initData() {
		if (!this.treeNum) {
			this.treeNum = this.getRandom(0, 2, 0);
		}

		if (!this.trees) {
			this.trees = [];
			for (let i = 0; i < this.treeNum; i++) {

				let randomX = this.getRandom(-1, 1, 1);
				this.trees.push({
					pos_x: randomX,
					height: this.getRandom(1, 2, 0)
				})
				this.obstacles.push(randomX * 10);
			}
		}
	}

	draw() {
		this.initData();

		const offset = this.id * 2;
		let model_transform = this.mt;
		let graphics_state = this.gs;

		model_transform = this.stack.peek();
	    model_transform = model_transform.times(this.translate(0, this.h, -this.w - offset));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(this.l, this.h, this.w));
	    this.shapes.box.draw(graphics_state, model_transform, this.green);
	    model_transform = this.stack.pop();

	    // for (let tree of this.trees) {
	    // 	this.draw_tree(graphics_state, model_transform, {
		   //    position_x: tree.pos_x,
		   //    height: tree.height
		   //  });
	    // }
	    
	}
}