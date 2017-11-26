
class Grass_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.type = 'grass';
		this.treeNum = null;
		this.trees = null;
		this.w = 1;

		let random = this.getRandom(1, 4, 0);

		// this.treeMaterial = context
  //       	.get_instance(Phong_Model)
  //       	.material(Color.of(0, 0, 0, 1), 1, 1, 1, 100, context.get_instance('/assets/tree-' + random + '.jpg'));

  //       this.rockMaterial = context
  //       	.get_instance(Phong_Model)
  //       	.material(Color.of(0, 0, 0, 1), 1, 1, 1, 100, context.get_instance('/assets/rock.png'))

        this.treeMaterial = this.green;
        this.rockMaterial = this.grey;
	}

	draw_rock(graphics_state, model_transform, options) {
		model_transform = model_transform.times(this.translate(options.position_x * 2, 1, 0))
	    this.shapes.pyramid.draw(graphics_state, model_transform, this.rockMaterial);
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
	    this.shapes.box.draw(graphics_state, model_transform, this.treeMaterial);
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

		if (!this.rockNum) {
			this.rockNum = this.getRandom(0, 2, 0);
		}

		if (!this.rocks) {
			this.rocks = [];
			for (let i = 0; i < this.rockNum; i++) {

				let randomX = this.getRandom(-10, 10, 0);

				while (this.o.indexOf(randomX) != -1) {
					randomX = this.getRandom(-10, 10, 0);
				}
				this.rocks.push({
					pos_x: randomX,
				})
				this.o.push(randomX);
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

	    for (let rock of this.rocks) {
	    	this.draw_rock(graphics_state, model_transform, {
		      position_x: rock.pos_x,
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