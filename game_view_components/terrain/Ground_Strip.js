
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