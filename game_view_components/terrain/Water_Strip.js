class Water_Strip extends Ground_Strip {
	constructor(context, id, gs, mt, stack) {
		super(context, id, gs, mt, stack);
		this.type = 'water';
		this.w = 1;
		this.h = 0.1;

		this.material = context
        	.get_instance(Phong_Model)
        	.material(Color.of(0, 0, 0, 1), 1, 1, 1, 100, context.get_instance('/assets/water.png'))
	}

	draw(time) {
		const offset = this.id * 2;
		let model_transform = this.mt;
		let graphics_state = this.gs;

		model_transform = this.stack.peek();
	    model_transform = model_transform.times(this.translate(0, this.h, -this.w - offset));
	    this.stack.push(model_transform);
	    model_transform = model_transform.times(this.scale(this.l, this.h, this.w));
	    this.shapes.box.draw(graphics_state, model_transform, this.material);
	    model_transform = this.stack.pop();
	}
}