class Basic_Component extends Scene_Component {

	constructor(context) {
		super(context);
		this.submit_shapes(context, getShapes())

		Object.assign(
	      this, { 
	      	white:  context.get_instance( Phong_Model ).material( Color.of(  1,  1,  1,  1 ), .2, 1, .7, 40 ), 
	      	black:  context.get_instance( Phong_Model ).material( Color.of(  0,  0,  0,  1 ), .2, 1, .7, 40 ), 
	        yellow: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .3,  1 ), .2, 1, .7, 40 ),  // Call material() on the Phong_Shader,
	        grey:   context.get_instance( Phong_Model ).material( Color.of( .2, .2, .2,  2 ), .2, 1,  1, 40 ),  // which returns a special-made "material" 
	        brown:  context.get_instance( Phong_Model ).material( Color.of( .2, .2, .05,  1 ), .2, 1,  1, 40 ),
	        red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, .9 ), .1, .7, 1, 40 ),  // (a JavaScript object)
	        green:  context.get_instance( Phong_Model ).material( Color.of( .25, .5,  0,  1 ), .1, .7, 1, 40 ),
	        blue:   context.get_instance( Phong_Model ).material( Color.of(  0,  0,  1, .8 ), .1, .7, 1, 40 ),
	        silver: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .8,  1 ),  0,  1, 1, 40 )
	      }
	    );
	}

	translate(x, y, z) {
		return Mat4.translation(Vec.of(x, y, z));
	}
	scale(x, y, z) {
		return Mat4.scale(Vec.of(x, y, z));
	}
	rotate(angle, x, y, z) {
		return Mat4.rotation(angle, Vec.of(x, y, z));
	}

	getRandom(high, low, roundTo) {
		let random = Math.random() * (high - low) + low;
		if (!roundTo) {
			return random;
		}
	    return parseFloat(random.toFixed(roundTo));
	}

	/**
	 * abstract method, must override
	 */
	draw() {
		throw new Exception('Must override abstract method draw() in class Basic_Component');
	}
}

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

	draw() {
		this.base.draw();
		for (let strip of this.strips) {
			strip.draw();
		}
	}

	addStrip(type) {

		let strip = null;

		switch(type) {
			case 'grass': 
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				break;
			case 'street':
				strip = new Street_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				break;
			case 'water':
				strip = new Water_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				break;
			default:
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
		}

		this.strips.push(strip);
		this.currentStripId++;
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

	draw() {
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
		this.w = 2;
	}

	draw() {

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

	    for (let tree of this.trees) {
	    	this.draw_tree(graphics_state, model_transform, {
		      position_x: tree.pos_x,
		      height: tree.height
		    });
	    }
	    
	}
}