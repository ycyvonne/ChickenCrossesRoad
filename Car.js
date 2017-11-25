class Cars {

	constructor(context, gs, stack) {
		this.context = context;
		this.gs = gs;
		this.stack = stack;
		this.cars = [];
	}

	draw(model_transform, time) {
		let numToShift = 0;
		for (let car of this.cars) {
			if (car.offScreen()) {
				numToShift++;
			}
			else {
				car.draw(model_transform, time);
			}
		}

		for (let i = 0; i < numToShift; i++) {
			this.shiftCar();
			this.addCar(time);
		}
	}

	addCar(time) {
		let car = new Car(this.context, this.gs, this.stack, 5, time);
		this.cars.push(car);
	}

	shiftCar() {
		this.cars.shift();
	}

}

class Car extends Basic_Component {

	constructor(context, gs, stack, speed, time) {
		super(context);
		this.gs = gs;
		this.stack = stack;
		this.speed = speed;
		this.translateX = 0;
		this.roadOffset = 25;

		this.constructionTime = time;
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

	offScreen() {
		return this.translateX > this.roadOffset;
	}

	draw(model_transform, time) {
		let graphics_state = this.gs;

		this.translateX = -this.roadOffset + (time - this.constructionTime) / 1000 * this.speed;

		// draw car body
		model_transform = model_transform.times(this.translate(this.translateX, 0.8, -1));
		this.stack.push(model_transform);
		model_transform = model_transform.times(this.scale(2.5, 0.5, 1));
		this.shapes.box.draw(graphics_state, model_transform, this.yellow);
		model_transform = this.stack.pop();

		// draw car hood
		model_transform = model_transform
								.times(this.translate(-0.5, 1, 0))
								.times(this.scale(1.2, 0.5, 0.7));
		this.stack.push(model_transform);
		this.shapes.box.draw(graphics_state, model_transform, this.white);

		// car hood window
		model_transform = model_transform
							.times(this.translate(0, -0.3, 0))
							.times(this.scale(0.7, 0.7, 1.01));
		this.shapes.box.draw(graphics_state, model_transform, this.black);

		// car hood top
		model_transform = this.stack.pop();
		model_transform = model_transform
								.times(this.translate(0, 1, 0))
								.times(this.scale(0.3, 0.5, 0.8));
		this.shapes.box.draw(graphics_state, model_transform, this.yellow);

		model_transform = this.stack.peek();
		model_transform = model_transform.times(this.translate(this.translateX, 0, -1));

		// draw wheels
		for (let x of [1, -1]) {
			for (let z of [1, -1]) {
				this.drawWheel(graphics_state, model_transform, {
					flipX: x,
					flipZ: z
				});
			}
		}
	}

}