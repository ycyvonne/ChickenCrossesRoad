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

	getStripDangers(stripId) {
		if (stripId < 0 || stripId > this.currentStripId) {
			return [];
		}
		return this.strips[stripId].dangers;
	}

	getType(stripId) {
		if (stripId < 0 || stripId > this.currentStripId) {
			return '';
		}
		return this.strips[stripId].type;
	}
}