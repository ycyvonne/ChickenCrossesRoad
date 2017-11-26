class Cars {

	constructor(context, gs, stack) {
		this.context = context;
		this.gs = gs;
		this.stack = stack;
		this.cars = [];
	}

	getDangers(street) {
		let dangers = [];
		for (let car of this.cars) {
			if (car.street == street) {
				dangers.push(...car.dangers);
			}
		}
		return dangers;
	}

	draw(model_transform, time) {
		let carOffScreenIndex = -1;

		for (const [index, car] of this.cars.entries()) {
			if (car.offScreen()) {
				carOffScreenIndex = index;
			}
			else {
				car.draw(model_transform, time);
			}
		}

		if (carOffScreenIndex != -1) {
			let car = this.cars[carOffScreenIndex];
			let speed = car.speed;
			let street = car.street;
			this.removeCar(carOffScreenIndex);
			this.addCar(time, {
				speed, street
			})
		}
	}

	addCar(time, options) {
		let car = new Car(this.context, this.gs, this.stack, time, options.street);
		this.cars.push(car);
	}

	removeCar(index) {
		this.cars.splice(index, 1)
	}

}

class Car extends Basic_Component {

	constructor(context, gs, stack, time, street) {
		super(context);
		this.gs = gs;
		this.stack = stack;
		this.roadOffset = 25;
		this.translateX = -this.roadOffset;
		this.street = street;

		this.speed = this.getRandom(5, 8, 0);
		this.constructionTime = time;
	}

	get dangers(){
		let min = this.translateX - 2;
		let max = this.translateX + 3.5;
		let increment = 0.2;
		let d = [];

		for (let i = min; i < max; i += increment) {
			d.push(i);
		}
		return d;
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
		this.translateZ = -1 - 2 * this.street;

		model_transform = model_transform
							.times(this.translate(this.translateX,0.8,this.translateZ))
							.times(this.scale(1,1,0.8));
		let old = model_transform;

		// draw car body
		// model_transform = model_transform.times(this.translate(, 0.8, this.translateZ));
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

		model_transform = old;
		model_transform = model_transform.times(this.translate(0, -0.8, 0));

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