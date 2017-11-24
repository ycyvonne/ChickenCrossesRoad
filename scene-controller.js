"use strict"    
  window.onload = function init()        // ********************* THE ENTRY POINT OF THE WHOLE PROGRAM STARTS HERE ********************* 
    { window.contexts = {};                                                            // A global variable, "contexts".  Browsers support up to 16 WebGL contexts per page.
      
      const scenes  = [ "Movement_Controls", "Global_Info_Table", "Main_Scene" ]; // Register some scenes to the "Canvas_Manager" object -- which WebGL calls
                                                                                       // upon every time a draw / keyboard / mouse event happens.  
      
      if( eval( "typeof " + scenes[0] ) !== "undefined" )
      { document.getElementById( "canvases" ).appendChild( Object.assign( document.createElement( "canvas" ), { id: "main_canvas", width: 800, height: 600 } ) );
        contexts[ "main_canvas" ] = new Canvas_Manager( "main_canvas", Color.of( 0,0,0,1 ), scenes );   // Manage the WebGL canvas.  Second parameter sets background color.
        for( let c in contexts ) contexts[ c ].render();     // Call render() for each WebGL context on this page.  Then render() will re-queue itself for more calls.
        
        Code_Manager.display_code( eval( scenes[0] ) );                                  // Display the code for our demo on the page, starting with the first scene in the list.
        for( let list of [ core_dependencies, all_dependencies ] )
        document.querySelector( "#class_list" ).rows[2].appendChild( Object.assign( document.createElement( "td" ), { 
          innerHTML: list.reduce( (acc, x) => acc += "<a href='javascript:void(0);' onclick='Code_Manager.display_code(" + x + ")'>" + x + "</a><br>", "" ) } ) );        
        document.getElementsByName( "main_demo_link" )[0].innerHTML = "<a href='javascript:void(0);' onclick='Code_Manager.display_code(" + scenes[0] + ")'>" + scenes[0] + "</a><br>";
        document.querySelector("#code_display").innerHTML = "Below is the code for the demo that's running:<br>&nbsp;<br>" + document.querySelector("#code_display").innerHTML;             
      }
      
      document.querySelector("#edit_button").addEventListener('click', () => {
        code_panel.style.display=class_list.style.display='none'; new_demo_source_code.style.display='block'; 
        document.getElementsByName( 'new_demo_code' )[0].value=code_display.dataset.displayed.toString() } )
      const form = document.forms.namedItem("new_demo_source_code");
      form.addEventListener('submit', function(event) 
        { if( document.getElementsByName( "finished" )[0].checked )
            alert( "Your demo will be submitted.  If approved, you will start being asked for a password to make any further updates to it.  This password "
                 + "will appear right now, below the submit button, and then (assuming submission worked) it will never appear again.  Write it down." );
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/submit-demo?Unapproved", true);
          xhr.responseType = "json";
          xhr.onload = function(event) 
          { if (xhr.status != 200) { document.querySelector("#submit_result").textContent = "Error " + xhr.status + " when trying to upload."; return }
            document.querySelector("#submit_result").textContent = this.response.message;
            // if( this.response.hide_finished_checkbox ) { document.getElementsByName( "finished" )[0].checked = false; expert_panel.style.display = "none" }
            if( this.response.show_password  ) document.getElementsByName( "password" )[0] .style.display = "inline";
            if( this.response.show_overwrite ) document.querySelector( "#overwrite_panel" ).style.display = "inline";
          };
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send( JSON.stringify( Array.from( form.elements ).reduce( ( accum, elem ) => 
            { if( elem.value && !( ['checkbox', 'radio'].includes(elem.type) && !elem.checked ) ) accum[elem.name] = elem.value; return accum }, {} ) ) );
          event.preventDefault();
        }, false);      
    }

// Below is the demo you will see when you run the program!    
  
class Tutorial_Animation extends Scene_Component  // An example of a Scene_Component that our class Canvas_Manager can manage.  Like most, this one draws 3D shapes.
{ constructor( context )
    { super( context );
      var shapes = { 'triangle'        : new Triangle(),                            // At the beginning of our program, instantiate all shapes we plan to use,
                     'strip'           : new Square(),                              // each with only one instance in the graphics card's memory.
                     'bad_tetrahedron' : new Tetrahedron( false ),                  // For example we would only create one "cube" blueprint in the GPU, but then 
                     'tetrahedron'     : new Tetrahedron( true ),                   // re-use it many times per call to display to get multiple cubes in the scene.
                     'windmill'        : new Windmill( 10 ) };
      this.submit_shapes( context, shapes );
      
       // Place the camera, which is stored in a scratchpad for globals.  Secondly, setup the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ 0, 0,-25 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      
      // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
      // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
      Object.assign( this, { purplePlastic: context.get_instance( Phong_Model  ).material( Color.of( .9,.5,.9, 1 ), .4, .4, .8, 40 ),
                             greyPlastic  : context.get_instance( Phong_Model  ).material( Color.of( .5,.5,.5, 1 ), .4, .8, .4, 20 ),   // Smaller exponent means 
                             blueGlass    : context.get_instance( Phong_Model  ).material( Color.of( .5,.5, 1,.2 ), .4, .8, .4, 40 ),   // a bigger shiny spot.
                             fire         : context.get_instance( Funny_Shader ).material(),
                             stars        : context.get_instance( Phong_Model  ).material( Color.of( 0,0,1,1 ), .5, .5, .5, 40, context.get_instance( "assets/stars.png" ) ) } );                             
    }
  display( graphics_state )
    { var model_transform = Mat4.identity();             // We begin with a brand new model_transform every frame.
      
      // *** Lights: *** Values of vector or point lights over time.  Two different lights *per shape* supported by Phong_Shader; more requires changing a number in the vertex 
      graphics_state.lights = [ new Light( Vec.of(  30,  30,  34, 1 ), Color.of( 0, .4, 0, 1 ), 100000 ),      // shader.  Arguments to construct a Light(): Light source position
                                new Light( Vec.of( -10, -20, -14, 0 ), Color.of( 1, 1, .3, 1 ), 100    ) ];    // or vector (homogeneous coordinates), color, and size.  
      
      model_transform.post_multiply( Mat4.translation([ 0, 5, 0 ]) );
      this.shapes.triangle       .draw( graphics_state, model_transform, this.stars );
      
      model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
      this.shapes.strip          .draw( graphics_state, model_transform, this.greyPlastic   );
      
      var t = graphics_state.animation_time/1000,   tilt_spin   = Mat4.rotation( 12*t, Vec.of(          .1,          .8,             .1 ) ),
                                                    funny_orbit = Mat4.rotation(  2*t, Vec.of( Math.cos(t), Math.sin(t), .7*Math.cos(t) ) );

      // Many shapes can share influence of the same pair of lights, but they don't have to.  All the following shapes will use these lights instead of the above ones.
      graphics_state.lights = [ new Light( tilt_spin.times( Vec.of(  30,  30,  34, 1 ) ), Color.of( 0, .4, 0, 1 ), 100000               ),
                                new Light( tilt_spin.times( Vec.of( -10, -20, -14, 0 ) ), Color.of( 1, 1, .3, 1 ), 100*Math.cos( t/10 ) ) ];
                                
      model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
      this.shapes.tetrahedron    .draw( graphics_state, model_transform.times( funny_orbit ), this.purplePlastic );
      
      model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
      this.shapes.bad_tetrahedron.draw( graphics_state, model_transform.times( funny_orbit ), this.greyPlastic   );
      
      model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
      this.shapes.windmill       .draw( graphics_state, model_transform.times( tilt_spin ),   this.purplePlastic );
      model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
      this.shapes.windmill       .draw( graphics_state, model_transform,                      this.fire          );
      model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
      this.shapes.windmill       .draw( graphics_state, model_transform,                      this.blueGlass     );
    }
}
class Surfaces_Demo extends Scene_Component
{ constructor( context )
    { super( context );
    
      let square_array = Vec.cast( [ 1,0,-1 ], [ 0,1,-1 ], [ -1,0,-1 ], [ 0,-1,-1 ], [ 1,0,-1 ] ),               // Some helper arrays of points located along
            star_array = Array(19).fill( Vec.of( 1,0,-1 ) ), circle_array = Array(40).fill( Vec.of( 1,0,-1 ) );  // curves.  We'll extrude these into surfaces.
      circle_array = circle_array.map( (x,i,a) => Mat4.rotation( i/(a.length-1) * 2*Math.PI, Vec.of( 0,0,1 ) ).times( x.to4(1) ).to3() );
      star_array   =   star_array.map( (x,i,a) => Mat4.rotation( i/(a.length-1) * 2*Math.PI, Vec.of( 0,0,1 ) ).times( Mat4.translation([ (i%2)/2,0,0 ]) ).times( x.to4(1) ).to3() );
      
      let sin_rows_func       =      i  => { return Vec.of( .5 + Math.sin(777*i)/4, 2-4*i, 0 ) },                                   // Different callbacks for telling Grid_Patch 
          sin_columns_func    = ( j,p ) => { return Mat4.translation([ Math.sin(777*j)/4,0,4/30    ]).times( p.to4(1) ).to3() },    // how it chould advance to the next row/column.  
          rotate_columns_func = ( j,p ) => { return Mat4.rotation( .1*j*Math.PI, Vec.of( 0,1,0 )    ).times( p.to4(1) ).to3() },
          sample_square_func  =      i  => { return Grid_Patch.sample_array( square_array, i ) },
          sample_star_func    =      i  => { return Grid_Patch.sample_array( star_array,   i ) },
          sample_circle_func  =      i  => { return Grid_Patch.sample_array( circle_array, i ) },          
          sample_two_arrays   = (j,p,i) => { return Mat4.translation([0,0,2*j]).times( sample_star_func(i).mix( sample_circle_func(i), j ).to4(1) ).to3() },
          sample_two_arrays2  = (j,p,i) => { return Mat4.rotation( .5*j*Math.PI, Vec.of( 1,1,1 ) ).times( 
                                                    Mat4.translation([0,0,2*j]).times( sample_star_func(i).mix( sample_square_func(i), j ).to4(1) ) ).to3() },
          line_rows_func      = ( i,p ) => { return p ? Mat4.translation([0,i/50,0]).times( p.to4(1) ).to3() :  Vec.of( .01,-.05,-.1 ) },
          transform_cols_func = (j,p,i) => { return Mat4.rotation( Math.PI/8, Vec.of( 0,0,1 ) ).times( Mat4.scale([ 1.1,1.1,1.1 ])).times( Mat4.translation([ 0,0,.005 ]))
                                                      .times( p.to4(1) ).to3() };
      var shapes = { good_sphere : new Subdivision_Sphere( 4 ),                                           // A sphere made of nearly equilateral triangles / no singularities
                     vase        : new Grid_Patch( 30, 30, sin_rows_func, rotate_columns_func,   [[0,1],[0,1]] ),
                     box         : new Cube(),
                     ghost       : new Grid_Patch( 36, 10, sample_star_func, sample_two_arrays,  [[0,1],[0,1]] ),
                     shell       : new Grid_Patch( 10, 40, line_rows_func, transform_cols_func,  [[0,5],[0,1]] ),
                     waves       : new Grid_Patch( 30, 30, sin_rows_func, sin_columns_func,      [[0,1],[0,1]] ),
                     shell2      : new Grid_Patch( 30, 30, sample_star_func, sample_two_arrays2, [[0,1],[0,1]] ),
                     tube        : new Cylindrical_Tube  ( 10, 10, [[0,1],[0,1]] ),
                     open_cone   : new Cone_Tip          (  3, 10, [[0,1],[0,1]] ),
                     donut       : new Torus             ( 15, 15 ),
                     gem2        : new ( Torus             .prototype.make_flat_shaded_version() )( 20, 20 ),
                     bad_sphere  : new Grid_Sphere       ( 10, 10 ),                                            // A sphere made of rows and columns, with singularities
                     septagon    : new Regular_2D_Polygon(  2,  7 ),
                     cone        : new Closed_Cone       ( 4, 20, [[0,1],[0,1]] ),                       // Cone.  Useful.
                     capped      : new Capped_Cylinder   ( 4, 12, [[0,1],[0,1]] ),                       // Cylinder.  Also useful.
                     axis        : new Axis_Arrows(),                                                    // Axis.  Draw them often to check your current basis.
                     prism       : new ( Capped_Cylinder   .prototype.make_flat_shaded_version() )( 10, 10, [[0,1],[0,1]] ),
                     gem         : new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(  2     ),
                     swept_curve : new Surface_Of_Revolution( 10, 10, [ ...Vec.cast( [2, 0, -1], [1, 0, 0], [1, 0, 1], [0, 0, 2] ) ], [ [ 0, 1 ], [ 0, 7 ] ], Math.PI/3 ),
                   };
      this.submit_shapes( context, shapes );
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ -2,2,-15 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      Object.assign( this, { shader: context.get_instance( Fake_Bump_Map ), textures: [], gallery: false, patch_only: false, revolution_only: false } );
      for( let filename of [ "/assets/rgb.jpg", "/assets/stars.png", "/assets/earth.gif", "/assets/text.png" ] ) this.textures.push( context.get_instance( filename ) ); this.textures.push( undefined );
    }
  display( graphics_state )
    { 
      let model_transform = Mat4.identity(), t = graphics_state.animation_time / 1000;
      graphics_state.lights = [ new Light( Vec.of( 1,1,0, 0 ).normalized(), Color.of(  1, .5, .5, 1 ), 100000000 ),
                                new Light( Vec.of( 0,1,0, 0 ).normalized(), Color.of( .5,  1, .5, 1 ), 100000000 ) ];
                                  
      for( var i = 0; i < 5; i++ )           // Draw some moving worm-like sequences of shapes.  Keep the matrix state from the previous one to draw the next one attached at the end.                                
      { let j = i;
        for( let key in this.shapes )
        { j++;
          if( this.patch_only      &&    this.shapes[ key ].constructor.name != "Grid_Patch"   ) continue;    // Filter some shapes out when those buttons have been pressed.
          if( this.revolution_only && !( this.shapes[ key ] instanceof Surface_Of_Revolution ) ) continue;
          
          let funny_function_of_time = t/5 + j*j*Math.cos( t/10 )/50,
                     random_material = this.shader.material( Color.of( (j % 6)/10, (j % 5)/10, (j % 4)/10, 1 ), .4, 1, 1, 40, this.textures[0] )
              
          model_transform.post_multiply( Mat4.rotation( funny_function_of_time, Vec.of(j%3 == 0, j%3 == 1, j%3 == 2) ) );   // Irregular motion
          if( this.gallery ) model_transform.pre_multiply ( Mat4.translation([ 3, 0,0 ]) );   // Gallery mode:  Switch the rotation/translation order to line up the shapes.
          else               model_transform.post_multiply( Mat4.translation([ 0,-3,0 ]) );
          this.shapes[ key ].draw( graphics_state, model_transform, random_material );        //  Draw the current shape in the list    
        }
        model_transform.post_multiply( Mat4.rotation( .5, Vec.of(0, 0, 1) ) );
      }      
    }
  make_control_panel()   // This function of a scene sets up its keyboard shortcuts.
    { this.key_triggered_button( "Next Texture",                   "t", function() { this.textures.push( this.textures.shift() )    },  "red" ); this.new_line();
      this.key_triggered_button( "Gallery View",                   "g", function() { this.gallery ^= 1;                             }, "blue" ); this.new_line();
      this.key_triggered_button( "Revolution Surfaces Only", "shift+S", function() { this.revolution_only = 1; this.patch_only = 0; }         ); this.new_line();
      this.key_triggered_button( "Custom Patches Only",      "shift+C", function() { this.revolution_only = 0; this.patch_only = 1; }         ); this.new_line();
      this.key_triggered_button( "All Shapes",               "shift+A", function() { this.revolution_only = 0; this.patch_only = 0; }         );
    }
  show_explanation( document_element )
    { document_element.innerHTML += "Welcome to the Surfaces Demo!  This is a demonstration of how to make a diverse set of shapes using the least amount of code. <br>"
                                 +  "Use the movement controls below to explore the scene.  You may find it easier to do this in gallery mode, entered by pressing "
                                 +  "g or the blue button below.  Press t to cycle through the loaded texture images.<br>"
                                 +  "A cone and cylinder are among the simplest and most useful new shapes.  Also available is a set of axis arrows that can be drawn anytime "
                                 +  "that you want to check where and how long your current coordinate axes are.  Draw it in a neutral color with the \"rgb.jpg\" "
                                 +  "texture image and the axes will become identifiable by color - XYZ maps to red, green, blue.<br>"
                                 +  "Most of these shapes are made using tiny code due to the help of two classes:  Grid_Patch and Surface_Of_Revolution (a special case "
                                 +  "of Grid_Patch).  Grid_Patch works by generating a tesselation of triangles arranged in rows and columns, and produes a deformed grid "
                                 +  "by doing user-defined steps to reach the next row or column. <br>"
                                 +  "All of these shapes are generated as a single vertex array each.  Building them that way, even with shapes like the axis arrows that "
                                 +  "are compounded together out of many shapes, speeds up your graphics program considerably.";
    }
}