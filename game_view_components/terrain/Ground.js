class Ground extends Basic_Component {
	constructor(context, graphics_state, model_transform, stack) {
		super(context);
		this.context = context;
		this.gs = graphics_state;
		this.mt = model_transform;
		this.stack = stack;
		this.l = 21;

		this.currentStripId = 0;
		this.strips = [];

		this.numRemovedStrips = 0;
		this.numMaxStrips = 30;
		this.currentNumberOfStrips = 0;

		this.base = new Ground_Base(context, graphics_state, model_transform, stack, this.l);

		// 12 initial, always the same
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('start');
		this.addStrip('grass');
		this.addStrip('grass');
		this.addStrip('grass');
		this.addStrip('grass');
		this.addStrip('water');

		// 8 more, random
		this.addStrips(18);
	}


	draw(time) {
		this.base.draw(time);
		for (let strip of this.strips) {
			strip.draw(time);
		}
	}

	addInteraction(interaction) {
		this.interaction = interaction;
		for (let strip of this.strips) {
			if (strip.type == 'street' && strip.interaction == null) {
				strip.addInteraction(interaction);
			}
		}
	}

	tryToGenerateMore(n) {
		this.addStrips(n);
		this.removeStrips(n);
		return true;
	}

	addStrips(n) {
		for(let i = 0; i < n; i++) {
			this.addStripToEnd();
		}
	}

	removeStrips(n) {
		for(let i = 0; i < n; i++) {
			this.removeStripFromStart();
		}
	}

	addStripToEnd() {
		let types = ['grass', 'grass', 'grass', 'street', 'street', 'water'];
		let random = this.getRandom(0, 5, 0);
		this.addStrip(types[random]);
	}

	removeStripFromStart() {
		if (this.strips.length > 0) {
			this.strips.shift();
			this.numRemovedStrips++;
			this.currentNumberOfStrips--;
		} 
	}

	addStrip(type) {

		let strip = null;

		switch(type) {
			case 'start':
				strip = new Grass_Strip_Start(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				this.currentNumberOfStrips++;
				break;
			case 'grass': 
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				this.currentNumberOfStrips++;
				break;
			case 'street':
				strip = new Street_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId += 2;
				this.currentNumberOfStrips += 2;

				// shallow copy
				let firstStrip = Object.assign( Object.create( Object.getPrototypeOf(strip)), strip)
				firstStrip.street = 0;
				strip.street = 1;

				if (this.interaction) {
					firstStrip.addInteraction(this.interaction);
					strip.addInteraction(this.interaction);
				}
				
				this.strips.push(firstStrip);				
				break;
			case 'water':
				strip = new Water_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				this.currentNumberOfStrips++;
				break;
			default:
				strip = new Grass_Strip(this.context, this.currentStripId, this.gs, this.mt, this.stack);
				this.currentStripId++;
				this.currentNumberOfStrips++;
		}

		this.strips.push(strip);
	}

	getStripObstacles(stripId) {
		stripId -= this.numRemovedStrips;
		if (stripId < 0 || stripId > this.currentStripId) {
			return [];
		}

		return this.strips[stripId].obstacles;
	}

	getStripDangers(stripId) {
		stripId -= this.numRemovedStrips;
		if (stripId < 0 || stripId > this.currentStripId) {
			return [];
		}
		return this.strips[stripId].dangers;
	}

	getSafety(stripId) {
		stripId -= this.numRemovedStrips;
		if (stripId < 0 || stripId > this.currentStripId) {
			return [];
		}
		return this.strips[stripId].safety;
	}

	getType(stripId) {
		stripId -= this.numRemovedStrips;
		if (stripId < 0 || stripId > this.currentStripId) {
			return '';
		}
		return this.strips[stripId].type;
	}
}