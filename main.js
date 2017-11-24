/*********************************
 * Includes
 ***********************************/

function load(script) {
  document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
}

load('shapes.js')

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
  
  /**
   * submits shapes, sets the graphic state, saves the textures
   */
  constructor(context) { 
    super(context);
    this.submit_shapes(context, getShapes())

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
        brown:  context.get_instance( Phong_Model ).material( Color.of( .3, .3, .1,  1 ), .2, 1,  1, 40 ),  // which returns a special-made "material" 
        red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, .9 ), .1, .7, 1, 40 ),  // (a JavaScript object)
        green:  context.get_instance( Phong_Model ).material( Color.of(  0, .5,  0,  1 ), .1, .7, 1, 40 ),
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
      new Light( Vec.of( 1,1,0, 0 ).normalized(), Color.of(  1, .5, .5, 1 ), 100000000 ),
      new Light( Vec.of( 0,1,0, 0 ).normalized(), Color.of( .5,  1, .5, 1 ), 100000000 )
    ];
  }

  /**
   * display function
   */
  display( graphics_state ) {
    this.draw_lights(graphics_state);

    let model_transform = Mat4.identity();
    let t = graphics_state.animation_time / 1000;

    this.shapes.box.draw(graphics_state, Mat4.scale([15,.1,15]), this.green);   
  }

  /*
   * This function of a scene sets up its keyboard shortcuts.
   */
  make_control_panel() {
    this.key_triggered_button("Go forward", "w", () => {
      console.log('going forward')
    }, "red");
    this.new_line();
  }

}





















