/*********************************
 * Includes
 ***********************************/

function load(script) {
  document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
}

load('game_dependencies/Shapes.js');
load('game_dependencies/Graphics_Stack.js');
load('game_dependencies/Basic_Component.js');
load('game_dependencies/Transition.js');

load('game_view_components/Car.js');

load('game_view_components/terrain/Ground_Base.js');
load('game_view_components/terrain/Ground_Strip.js');
load('game_view_components/terrain/Street_Strip.js');
load('game_view_components/terrain/Water_Strip.js');
load('game_view_components/terrain/Grass_Strip.js');
load('game_view_components/terrain/Ground.js');

load('game_view_components/Player.js');
load('game_view_components/Interaction_Controller.js');

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
        camera_transform: Mat4.translation([ 0, -20, -50 ]),
        projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 )
      }
    );
      }

  reset() {
    this.ground = null;
    this.player = null;
    this.initDisplay = false;
    this.stack = new Graphics_Stack();
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

  /**
   * init objects, called only once
   */
  init_objects(graphics_state, model_transform) {
    
    this.ground = new Ground(this.context, graphics_state, model_transform, this.stack);
    this.player = new Player(this.context, graphics_state, model_transform, this.stack);

    
    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    this.ground.addStrip('street');
    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    this.ground.addStrip('street');
    this.ground.addStrip('street');
    this.ground.addStrip('street');
    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    this.ground.addStrip('grass');
    

    this.interaction = new Interaction_Controller(this, this.player, this.ground);
  }

  update_objects() {
    if (this.player)
      this.player.draw(this.t);
    if (this.ground)
      this.ground.draw(this.t);
  }

  getCameraZ() {
    // handle camera transitions
    if (!this.transition) {
      this.transition = new Transition(this.player.curZ, this.player.curZ, 1, this.t);
    }

    let cameraTransitionZ = this.transition.value(this.t);

    if (cameraTransitionZ != this.player.curZ && !this.transition.isTransitioning) {
      this.transition = new Transition(cameraTransitionZ, this.player.curZ, 250, this.t);
    }
    else if(cameraTransitionZ != this.player.curZ && this.transition.isTransitioning) {
      this.transition.updateEnd(this.player.curZ);
    }
    else if (cameraTransitionZ == this.player.curZ) {
      this.transition.isTransitioning = false;
    }
    return -this.transition.value(this.t) * 2;
  }

  /**
   * display function
   */
  display( graphics_state ) {
    this.draw_lights(graphics_state);
    this.t = graphics_state.animation_time;
    this.dt = graphics_state.animation_delta_time;

    let model_transform = Mat4.identity();

    if (!this.initDisplay) {
      this.init_objects(graphics_state, model_transform);
      this.initDisplay = true;
    }

    let cameraZ = this.getCameraZ();
    graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 30, 10 + cameraZ), Vec.of(0, 0, cameraZ), Vec.of(0, 1, 0));
    this.update_objects();
  }

  /*
   * This function of a scene sets up its keyboard shortcuts.
   */
  make_control_panel() {

    this.live_string(() => "Frame Rate: "  + this.dt);
    this.new_line();

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





















