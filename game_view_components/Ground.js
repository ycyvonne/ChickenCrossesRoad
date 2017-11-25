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
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
	}

	draw(time) {
		this.base.draw(time);
		for (let strip of this.strips) {
			strip.draw(time);
		}
	}

	addInteraction(interaction) {
		for (let strip of this.strips) {
			if (strip.type == 'street') {
				strip.addInteraction(interaction);
			}
		}
	}

	addStrip(type) {

		let strip = null;

		switch(type) {
			case 'start':
				strip = new Grass_Strip_Start(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				break;
			case 'grass': 
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				break;
			case 'street':
				strip = new Street_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId += 2;

				// shallow copy
				let firstStrip = Object.assign( Object.create( Object.getPrototypeOf(strip)), strip)
				firstStrip.street = 0;
				strip.street = 1;

				this.strips.push(firstStrip);				
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

	getType(stripId) {
		if (stripId < 0 || stripId > this.currentStripId) {
			return '';
		}
		return this.strips[stripId].type;
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
		this.o = []
	}

	get obstacles() {
		return this.o;
	}

	addInteraction(interaction) {
		this.interaction = interaction;
	}
}

class Street_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.type = 'street';
		this.cars = new Cars(context, gs, stack);
		this.cars.addCar(0, {
			street: 0
		});
		this.cars.addCar(0, {
			street: 1
		});
		this.w = 2;
	}

	setStreet(i) {
		this.street = i;
	}

	get obstacles() {
		if (!this.street) {
			this.street = 0;
		}
		return this.cars.getObstacles(this.street);
	}

	drawStreetLine(graphics_state, model_transform, options) {
		model_transform = model_transform
							.times(this.translate(options.pos_x, 0, 0))
							.times(this.scale(2, 0.02, 0.2));
		this.shapes.box.draw(graphics_state, model_transform, this.greyLight);
	}

	draw(time) {
		let model_transform = this.mt;
		let graphics_state = this.gs;

		if (this.interaction.collisionExists(0,0)) {
			this.interaction.squashPlayer();
		}

		model_transform = model_transform.times(this.translate(0,0,this.id * -2));

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
		this.type = 'water';
		this.w = 1;
		this.h = 0.1;
	}

	draw(time) {
		const offset = this.id * 2;
		let model_transform = this.mt;
		let graphics_state = this.gs;

		model_transform = this.stack.peek();
	    model_transform = model_transform.times(this.translate(0, this.h, -this.w - offset));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(this.l, this.h, this.w));
	    this.shapes.box.draw(graphics_state, model_transform, this.blue);
	    model_transform = this.stack.pop();
	}
}

class Grass_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.type = 'grass';
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
				this.o.push(randomX * 10);
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

	    for (let tree of this.trees) {
	    	this.draw_tree(graphics_state, model_transform, {
		      position_x: tree.pos_x,
		      height: tree.height
		    });
	    }
	    
	}
}

class Grass_Strip_Start extends Grass_Strip {

	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
	}

	get obstacles() {
		return [];
	}

	draw() {
		const offset = this.id * 2;
		let model_transform = this.mt;
		let graphics_state = this.gs;

		model_transform = this.stack.peek();
	    model_transform = model_transform.times(this.translate(0, this.h, -this.w - offset));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(this.l, this.h, this.w));
	    this.shapes.box.draw(graphics_state, model_transform, this.green);
	    model_transform = this.stack.pop();
	}

}