class Basic_Component extends Scene_Component {

	constructor(context) {
		super(context);
		this.submit_shapes(context, getShapes())

		Object.assign(
	      this, { 
	      	white:  context.get_instance( Phong_Model ).material( Color.of(  1,  1,  1,  1 ), .2, 1, .7, 40 ), 
	      	black:  context.get_instance( Phong_Model ).material( Color.of(  0,  0,  0,  1 ), .2, 1, .7, 40 ), 
	        yellow: context.get_instance( Phong_Model ).material( Color.of( .7, .7, .3,  1 ), .2, 1, .7, 40 ),  // Call material() on the Phong_Shader,
	        grey:   context.get_instance( Phong_Model ).material( Color.of( .2, .2, .2,  2 ), .2, 1,  1, 40 ),  // which returns a special-made "material" 
	        greyLight:  context.get_instance( Phong_Model ).material( Color.of(  0.4,  0.4,  0.4,  1 ), .2, 1, .7, 40 ), 
	        brown:  context.get_instance( Phong_Model ).material( Color.of( .2, .2, .05,  1 ), .2, 1,  1, 40 ),
	        red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, .9 ), .1, .7, 1, 40 ),  // (a JavaScript object)
	        green:  context.get_instance( Phong_Model ).material( Color.of( .3, .6,  .3,  1 ), .1, .7, 1, 40 ),
	        greenDark:  context.get_instance( Phong_Model ).material( Color.of( .1, .5,  .1,  1 ), .1, .7, 1, 40 ),
	        blue:   context.get_instance( Phong_Model ).material( Color.of(  0.3,  0.3,  0.9, .8 ), .1, .7, 1, 40 ),
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

	getRandom(low, high, roundTo) {
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