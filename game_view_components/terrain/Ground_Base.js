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