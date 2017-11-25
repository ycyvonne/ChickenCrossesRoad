
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