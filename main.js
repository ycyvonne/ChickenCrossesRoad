/*********************************
 * Includes
 ***********************************/

function load(script) {
  document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
}

load('shapes.js');
load('Graphics_Stack.js');
load('Ground.js');
load('Player.js');
load('Interaction_Controller.js');

/*********************************
 * Constants
 ***********************************/

const CONSTANTS = {
  textures: [ "/assets/rgb.jpg", "/assets/stars.png", "/assets/earth.gif", "/assets/text.png" ]
}


/*********************************
 * Main Scene
 ***********************************/

class Main_Scene extends Scene_Component {

  translate(x, y, z) {
    return Mat4.translation(Vec.of(x, y, z));
  }
  scale(x, y, z) {
    return Mat4.scale(Vec.of(x, y, z));
  }
  rotate(angle, x, y, z) {
    return Mat4.rotation(angle, Vec.of(x, y, z));
  }
  
  /**
   * submits shapes, sets the graphic state, saves the textures
   */
  constructor(context) { 
    super(context);
    this.submit_shapes(context, getShapes())
    this.context = context;
    this.initDisplay = false;
    this.stack = new Graphics_Stack();

    Object.assign(
      context.globals.graphics_state, {
        camera_transform: Mat4.translation([ 0,-10,-40 ]),
        projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 )
      }
    );

    Object.assign(
      this, { 
        shader: context.get_instance( Fake_Bump_Map ),
        textures: [],
        gallery: false,
        patch_only: false,
        revolution_only: false,
        yellow: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .3,  1 ), .2, 1, .7, 40 ),  // Call material() on the Phong_Shader,
        grey:   context.get_instance( Phong_Model ).material( Color.of( .2, .2, .2,  2 ), .2, 1,  1, 40 ),  // which returns a special-made "material" 
        brown:  context.get_instance( Phong_Model ).material( Color.of( .2, .2, .05,  1 ), .2, 1,  1, 40 ),
        red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, .9 ), .1, .7, 1, 40 ),  // (a JavaScript object)
        green:  context.get_instance( Phong_Model ).material( Color.of( .25, .5,  0,  1 ), .1, .7, 1, 40 ),
        blue:   context.get_instance( Phong_Model ).material( Color.of(  0,  0,  1, .8 ), .1, .7, 1, 40 ),
        silver: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .8,  1 ),  0,  1, 1, 40 )
      }
    );
    
  }

  /**
   * draws lights
   */
  draw_lights(graphics_state) {
    graphics_state.lights = [
      new Light( Vec.of( 1,1,2, 0 ).normalized(), Color.of( 0.5, 0.5, 0.5,  1 ), 100000000 ),
      new Light( Vec.of( 0,1,0, 0 ).normalized(), Color.of( 0.5,  0.5, 0.5, 1 ), 100000000 )
    ];
  }

  draw_ground(graphics_state, model_transform) {
    const street_h = 0.1;

    this.stack.push(model_transform);
    model_transform = model_transform
                        .times(this.translate(0, 0, -100))
                        .times(this.scale(20, street_h, 100))
    this.shapes.box.draw(graphics_state, model_transform, this.grey);
  }

  /**
   * init objects, called only once
   */
  init_objects(graphics_state, model_transform) {
    
    this.ground = new Ground(this.context, graphics_state, model_transform, this.stack);
    this.player = new Player(this.context, graphics_state, model_transform, this.stack);

    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    // this.ground.addStrip('street');

    this.interaction = new Interaction_Controller(this.player, this.ground);
  }

  update_objects() {
    this.player.draw(this.t);
    this.ground.draw(this.t);
  }

  /**
   * display function
   */
  display( graphics_state ) {
    this.draw_lights(graphics_state);
    this.t = graphics_state.animation_time;

    let model_transform = Mat4.identity();

    Mat4.look_at(Vec.of(0, 20, 0), Vec.of(0,0,0), Vec.of(0, 1, 0));

    if (!this.initDisplay) {
      this.init_objects(graphics_state, model_transform);
      this.initDisplay = true;
    }

    this.update_objects();
  }

  /*
   * This function of a scene sets up its keyboard shortcuts.
   */
  make_control_panel() {

    this.key_triggered_button("Go forward", "w", () => {
      this.player.goForward(this.t);
    }, "red");
    this.new_line();

    this.key_triggered_button("Go backward", "s", () => {
      this.player.goBackward(this.t);
    }, "red");
    this.new_line();

    this.key_triggered_button("Go right", "d", () => {
      this.player.goRight(this.t);
    }, "red");
    this.new_line();

    this.key_triggered_button("Go left", "a", () => {
      this.player.goLeft(this.t);
    }, "red");
    this.new_line();

  }

}





















