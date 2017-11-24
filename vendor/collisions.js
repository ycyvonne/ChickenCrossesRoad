class Body          // Store and update the properties of a 3D body that increntally moves from its previous place due to velocities.
{ constructor(               shape, material, scale, location_matrix, linear_velocity, angular_velocity, spin_axis = Vec.of(0,0,0).randomized(1).normalized(), previous_matrix = Mat4.identity() ) 
    { Object.assign( this, { shape, material, scale, location_matrix, linear_velocity, angular_velocity, spin_axis, previous_matrix } ) }
  advance( time_amount )   // Perform forward Euler to advance the linear and angular velocities one time-step.
    { for( let r=0; r<4; r++ ) for( let c=0; c<4; c++ ) this.previous_matrix[r][c] = this.location_matrix[r][c];
      var delta = Mat4.translation( this.linear_velocity.times( time_amount ) );     // Move proportionally to real time.
      this.location_matrix.pre_multiply ( delta );                     // Apply translation velocity - pre-multiply to keep translations together
      
      delta = Mat4.rotation( time_amount * this.angular_velocity, this.spin_axis );  // Move proportionally to real time.
      this.location_matrix.post_multiply( delta );                    // Apply angular velocity - post-multiply to keep rotations together
    }                     
  blend_state( alpha )  // Naively blend the coefficients of the two most recent transformation matrices.  This will produce shear matrices, a wrong result; a
  { this.drawn_location = this.location_matrix.map( (x,i) => Vec.from( this.previous_matrix[i] ).mix( x, alpha ) );  // more correct, but harder, method would be  
  }                                                                                          // to blend the rotations in the product separately as quaternions.
  check_if_colliding( b, a_inv, shape )   // Collision detection function.
  // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick to code.  Making every collision body a stretched sphere is kind 
  // of a hack, and looping through a list of discrete sphere points to see if the volumes intersect is *really* a hack (there are perfectly good analytic 
  // expressions that can test if two ellipsoids intersect without discretizing them into points).   On the other hand, for non-convex shapes you're usually going
  // to have to loop through a list of discrete tetrahedrons defining the shape anyway.
    { if ( this == b ) return false;      // Nothing collides with itself
      var T = a_inv.times( b.location_matrix ).times( Mat4.scale( b.scale ) );    // Convert sphere b to a coordinate frame where a is a unit sphere
      for( let p of shape.positions )                                        // For each vertex in that b,
      { var Tp = T.times( p.to4(1) ).to3();                     // Apply a_inv*b coordinate frame shift
        if( Tp.dot( Tp ) < 1.1 )   return true;     // Check if in that coordinate frame it penetrates the unit sphere at the origin.  Leave .1 of leeway.     
      }
      return false;
    }
}


class Simulation extends Scene_Component      // Carefully manage stepping simulation time for any scenes that subclass this one (physics simulation
{ constructor( context )                      // demos that all draw the same shapes).  Totally decouple the simulation from the frame rate.
    { super( context );
      Object.assign( this, {  time_accumulator: 0, time_scale: 1, t: 0, dt: 1/20, bodies: [], 
                              shader: context.get_instance( Phong_Model ), rgb: context.get_instance( "/assets/rgb.jpg" ), earth: context.get_instance( "/assets/earth.gif" ) } );
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ 0,0,-50 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      
      this.flying_shapes = { donut  : new Torus          ( 15, 15 ),
                             cone   : new Closed_Cone    ( 10, 10 ),
                             capped : new Capped_Cylinder(  4, 12 ),
                             ball   : new Subdivision_Sphere( 3 ),
                             cube   : new Cube(),
                             axis   : new Axis_Arrows(),
                             prism  :     new ( Capped_Cylinder   .prototype.make_flat_shaded_version() )( 10, 10 ),
                             gem    :     new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 2 ),
                             donut  :     new ( Torus             .prototype.make_flat_shaded_version() )( 20, 20 ) };
      this.submit_shapes( context, this.flying_shapes );
    }
  random_shape() { return this.shapes[ Object.keys( this.flying_shapes )[ ~~( Object.keys( this.flying_shapes ).length * Math.random() ) ] ] }
  random_material() { return this.shader.material( Color.of( .6,.6*Math.random(),.6*Math.random(),1 ), .4, 1, 1, 40, this.rgb ) }
  simulate( frame_time )                                              // Carefully advance time according to Glenn Fielder's "Fix Your Timestep" blog post.
    { frame_time = this.time_scale * frame_time;                      // This line lets us create the illusion to the simulator that the display framerate is running fast or slow.
      this.time_accumulator += Math.min( frame_time, 0.1 ) ;          // Avoid the spiral of death; limit the amount of time we will spend computing during this timestep if display lags.
      while ( Math.abs( this.time_accumulator ) >= this.dt )          // Repeatedly step the simulation until we're caught up with this frame.
      { this.update_state( this.dt );                                 // Single step of the simulation for all bodies.
        for( let b of this.bodies ) b.advance( this.dt );
          
        this.t                += Math.sign( frame_time ) * this.dt;   // Following the advice of the article, de-couple our simulation time from our frame rate.
        this.time_accumulator -= Math.sign( frame_time ) * this.dt;
      }
      let alpha = this.time_accumulator / this.dt;                    // Store an interpolation factor for how close our frame fell in between the two latest simulation time steps, so
      for( let b of this.bodies ) b.blend_state( alpha );             // we can correctly blend the two latest states and display the result.
    }
  make_control_panel()
    { this.key_triggered_button( "Speed up time",      "SHIFT+p", function() { this.time_scale *= 5 } );
      this.key_triggered_button( "Slow down time",    "p",        function() { this.time_scale /= 5 } ); this.new_line();
      this.live_string( () => { return "Time scale: "  + this.time_scale                              } ); this.new_line();
      this.live_string( () => { return "Fixed simulation time step size: "  + this.dt                 } ); this.new_line();
    }
  display( graphics_state )
    { graphics_state.lights = [ new Light( Vec.of( 7,15,20,0 ), Color.of( 1,1,1,1 ), 100000 ) ];

      for( let b of this.bodies ) b.shape.draw( graphics_state, b.drawn_location.times( Mat4.scale( b.scale ) ), b.material );   // Draw each shape at its current location.
      if( this.globals.animate ) this.simulate( graphics_state.animation_delta_time );                 // Advance the time and state of our whole simulation.
    }
  update_state( dt ) { }          // Something has to override this abstract function.
}

class Inertia_Demo extends Simulation    // Demonstration: Let random initial momentums carry bodies until they fall and bounce.
{ constructor( context ) { super( context ); this.submit_shapes( context, { square: new Square() } ); }
  update_state( dt )
    { while( this.bodies.length < 150 )   this.bodies.push( new Body( this.random_shape(), this.random_material(),      // Generate moving bodies  
               Vec.of( 1,1+Math.random(),1 ),  Mat4.translation( Vec.of(0,15,0).randomized(10) ),  Vec.of(0,-1,0).randomized(2).normalized().times(3),  Math.random() ) );
      
      for( let b of this.bodies )
      { b.linear_velocity[1] += dt * -9.8;       // Gravity on Earth, where 1 unit in world space = 1 meter.
        if( b.location_matrix[1][3] < -8 && b.linear_velocity[1] < 0 ) b.linear_velocity[1] *= -.8;   // If about to fall through floor, reverse y velocity.
      }                                          // Delete bodies that stop or stray too far away.
      this.bodies = this.bodies.filter( b => b.location_matrix.times( Vec.of( 0,0,0,1 ) ).norm() < 50 && b.linear_velocity.norm() > 2 );
    }
  display( graphics_state )                   // Just draw the ground.
    { super.display( graphics_state );
      this.shapes.square.draw( graphics_state, Mat4.translation([ 0,-10,0 ]).times( Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ) ).times( Mat4.scale([ 50,50,1 ]) ), 
                               this.shader.material( Color.of( .4,.8,.4,1 ), .4, 1, 1, 40, this.earth ) );
    }
  show_explanation( document_element )
    { document_element.innerHTML += "<p>This demo lets random initial momentums carry bodies until they fall and bounce.  It shows a good way to do incremental "
                                 +  "movements, which are crucial for making objects look like they're moving on their own instead of following a pre-determined "
                                 +  "path.  Animated objects look more real when they have inertia and obey physical laws, instead of being driven by simple "
                                 +  "sinusoids or periodic functions.</p><p>For each moving object, we need to store a model matrix somewhere that is permanent "
                                 +  "(such as inside of our class) so we can keep consulting it every frame.  As an example, for a bowling simulation, the ball "
                                 +  "and each pin would go into an array (including 11 total matrices).  We give the model transform matrix a \"velocity\" and "
                                 +  "track it over time, which is split up into linear and angular components.  Here the angular velocity is expressed as an "
                                 +  "Euler angle-axis pair so that we can scale the angular speed how we want it.</p><p>The forward Euler method is used to "
                                 +  "advance the linear and angular velocities of each shape one time-step.  The velocities are not subject to any forces here, "
                                 +  "but just a downward acceleration.  Velocities are also constrained to not take any objects under the ground plane.</p><p>"
                                 +  "This scene extends class Simulation, which carefully manages stepping simulation time for any scenes that subclass it.  It "
                                 +  "totally decouples the whole simulation from the frame rate, following the suggestions in the blog post <a "
                                 +  "href=\"https://gafferongames.com/post/fix_your_timestep/\" target=\"blank\">\"Fix Your Timestep\"</a> by Glenn Fielder.  "
                                 +  "Buttons allow you to speed up and slow down time to show that the simulation's answers do not change.</p>";
    }
}
 
class Collision_Demo extends Simulation    // Demonstration: Detect when some flying objects collide with one another, coloring them red.
{ constructor( context ) { super( context );  this.collider = new Subdivision_Sphere(1); }       // Make a simpler dummy shape for representing all 
  update_state( dt, num_bodies = 30 )                                                            // other shapes during collisions.
    { if   ( this.bodies.length > num_bodies )  this.bodies = this.bodies.splice( 0, num_bodies );                // Max of 20 bodies
      while( this.bodies.length < num_bodies )  this.bodies.push( new Body( this.random_shape(), undefined,       // Generate moving bodies  
               Vec.of( 1,5,1 ), Mat4.translation( Vec.of(0,0,0).randomized(30) ).times( Mat4.rotation( Math.PI, Vec.of( 0,0,0 ).randomized(1).normalized() ) ), 
               Vec.of( 0,0,0 ).randomized(20),  Math.random() ) );
      this.bodies = this.bodies.filter( b => ( Math.random() > .01 ) || b.linear_velocity.norm() > 1 );  // Sometimes we delete some so they can re-generate as new ones 
      
      for( let b of this.bodies )
      { var b_inv = Mat4.inverse( b.location_matrix.times( Mat4.scale( b.scale ) ) );           // Cache b's final transform
        
        var center = b.location_matrix.times( Vec.of( 0, 0, 0, 1 ) ).to3();        // Center of the body
        b.linear_velocity = b.linear_velocity.minus( center.times( dt ) );                     // Apply a small centripetal force to everything
        b.material = this.shader.material( Color.of( .5,.5,.5,1 ), .2, 1, 1, 40, this.rgb );   // Default color: white
       
        for( let c of this.bodies )                                      // Collision process starts here:
          if( b.linear_velocity.norm() > 0 && b.check_if_colliding( c, b_inv, this.collider ) )     // Send the two bodies and the collision shape
          { b.material = this.shader.material( Color.of( .5,0,0,1 ), .5, 1, 1, 40, this.rgb );        // If we get here, we collided, so turn red.
            b.linear_velocity  = Vec.of( 0,0,0 );                        // Zero out the velocity so they don't inter-penetrate any further.
            b.angular_velocity = 0;
          }
      }   
    }
  display( graphics_state )           // Draw an extra bounding sphere around each drawn shape to show the physical shape that is really being collided with.
    { super.display( graphics_state );
      for( let b of this.bodies ) this.shapes.ball.draw( graphics_state, b.drawn_location.times( Mat4.scale( b.scale.times(1.1) ) ),
                               this.shader.material( Color.of( 1,0,1,.05 ), .4, 1, 1, 40 ) );
    }
  show_explanation( document_element )
    { document_element.innerHTML += "<p>This demo detects when some flying objects collide with one another, coloring them red when they do.  For a simpler demo "
                                 +  "that shows physics-based movement without objects that hit one another, see the demo called <a "
                                 +  "href=\"https://encyclopediaofcode.glitch.me/Inertia_Demo\" target=\"blank\">Inertia_Demo</a>.</p><p>Detecting intersections "
                                 +  "between pairs of stretched out, rotated volumes can be difficult, but is made easier by being in the right coordinate space.  "
                                 +  "See <a href=\"https://piazza.com/class_profile/get_resource/j855t03rsfv1cn/jabhqq9h76f7hx\" target=\"blank\">this .pdf "
                                 +  "document</a> for an explanation of how it works in this demo.  The collision algorithm treats every shape like an ellipsoid "
                                 +  "roughly conforming to the the drawn shape, and with the same transformation matrix applied.  Here these collision volumes are "
                                 +  "drawn in translucent purple alongside the real shape so that you can see them.</p><p>This particular collision method is "
                                 +  "extremely short to code, as you can observe in the method \"check_if_colliding\" in the class called Body below.  It has "
                                 +  "problems, though.  Making every collision body a stretched sphere is a hack and doesn't handle the nuances of the actual "
                                 +  "shape being drawn, such as a cube's corners that stick out.  Looping through a list of discrete sphere points to see if the "
                                 +  "volumes intersect is *really* a hack (there are perfectly good analytic expressions that can test if two ellipsoids intersect "
                                 +  "without discretizing them into points, although they involve solving a high order polynomial).   On the other hand, for "
                                 +  "non-convex shapes a real collision method cannot be exact either, and is usually going to have to loop through a list of "
                                 +  "discrete tetrahedrons defining the shape anyway.</p><p>This scene extends class Simulation, which carefully manages "
                                 +  "stepping simulation time for any scenes that subclass it.  It totally decouples the whole simulation from the frame rate, "
                                 +  "following the suggestions in the blog post <a href=\"https://gafferongames.com/post/fix_your_timestep/\" target=\"blank\">\""
                                 +  "Fix Your Timestep\"</a> by Glenn Fielder.  Buttons allow you to speed up and slow down time to show that the simulation's "
                                 +  "answers do not change.</p>";
    }
}