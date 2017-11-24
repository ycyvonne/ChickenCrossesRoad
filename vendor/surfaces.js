class Grid_Patch extends Shape                          // A deformed grid of rows and columns. A tesselation of triangles connects the points, by generating a certain 
{  constructor( rows, columns, next_row_function, next_column_function, texture_coord_range = [ [ 0, rows ], [ 0, columns ] ]  )      // predictable pattern of indices.
    { super();                                                                     // Two callbacks allow you to dynamically define how to reach the next row or column.
      let points = [];
      for( let r = 0; r <= rows; r++ ) 
      { points.push( new Array( columns+1 ) );                                                  // Allocate a 2D array
        points[ r ][ 0 ] = next_row_function( r/rows, points[ r-1 ] && points[ r-1 ][ 0 ] );    // Use next_row_function to generate the start point of each row.
      }                                                                                         //   Include the previous point if it existed.      
      for(   let r = 0; r <= rows;    r++ )
        for( let c = 0; c <= columns; c++ )
        { if( c > 0 ) points[r][ c ] = next_column_function( c/columns, points[r][ c-1 ], r/rows );           // From those, use next_column function to generate the remaining points.
      
          this.positions.push( points[r][ c ] );        
          const a1 = c/columns, a2 = r/rows, x_range = texture_coord_range[0], y_range = texture_coord_range[1];
          this.texture_coords.push( Vec.of( ( a1 )*x_range[1] + ( 1-a1 )*x_range[0], ( a2 )*y_range[1] + ( 1-a2 )*y_range[0] ) );    // Interpolate texture coords from a range.
        }
      for(   let r = 0; r <= rows;    r++ )                                                   // Generate normals by averaging the cross products of all defined neighbor pairs.
        for( let c = 0; c <= columns; c++ )
        { let curr = points[r][c], neighbors = new Array(4), normal = Vec.of( 0,0,0 );          
          for( let [ i, dir ] of [ [ -1,0 ], [ 0,1 ], [ 1,0 ], [ 0,-1 ] ].entries() )         // Store each neighbor by rotational order.
            neighbors[i] = points[ r + dir[1] ] && points[ r + dir[1] ][ c + dir[0] ];        // Leave "undefined" in the array wherever we hit a boundary.
          
          for( let i = 0; i < 4; i++ )                                                        // Cross pairs of neighbors, proceeding the same rotational direction through the pairs.
            if( neighbors[i] && neighbors[ (i+1)%4 ] ) normal = normal.plus( neighbors[i].minus( curr ).cross( neighbors[ (i+1)%4 ].minus( curr ) ) );          
          normal.normalize();                                                                 // Normalize the sum to get the average vector.
          
          if( normal.every( x => x == x ) && normal.norm() > .01 )  this.normals.push( Vec.from( normal ) );    // Store the normal if it's valid (not NaN or zero length)
          else                                                      this.normals.push( Vec.of( 0,0,1 )    );    // Otherwise use a default.
        }
      for( let i = 0; i < this.normals.length; i++ )
      { if( this.normals[i].norm() > 0 ) break;
        this.normals[i] = first_valid_normal;
      }        
        
      for( var h = 0; h < rows; h++ )             // Generate a sequence like this (if #columns is 10):  "1 11 0  11 1 12  2 12 1  12 2 13  3 13 2  13 3 14  4 14 3..." 
        for( var i = 0; i < 2 * columns; i++ )
          for( var j = 0; j < 3; j++ )
            this.indices.push( h * ( columns + 1 ) + columns * ( ( i + ( j % 2 ) ) % 2 ) + ( ~~( ( j % 3 ) / 2 ) ? 
                                   ( ~~( i / 2 ) + 2 * ( i % 2 ) )  :  ( ~~( i / 2 ) + 1 ) ) );
    }
  static sample_array( array, ratio )                                           // Optional.  In an array of points, intepolate the pair of points that our progress ratio falls between.
    { const frac = ratio * ( array.length - 1 ), alpha = frac - Math.floor( frac );
      return array[ Math.floor( frac ) ].mix( array[ Math.ceil( frac ) ], alpha );
    }
}
  
class Surface_Of_Revolution extends Grid_Patch
  // SURFACE OF REVOLUTION: Produce a curved "sheet" of triangles with rows and columns.  Begin with an input array of points, defining a 1D path curving through 3D space -- 
  // now let each point be a row.  Sweep that whole curve around the Z axis in equal steps, stopping and storing new points along the way; let each step be a column.  Now we
  // have a flexible "generalized cylinder" spanning an area until total_curvature_angle.  
{ constructor( rows, columns, points, texture_coord_range, total_curvature_angle = 2*Math.PI )
    { super( rows, columns, i => Grid_Patch.sample_array( points, i ), (j,p) => Mat4.rotation( total_curvature_angle/columns, Vec.of( 0,0,1 ) ).times(p.to4(1)).to3(), texture_coord_range );
    }
}    
  
class Regular_2D_Polygon extends Surface_Of_Revolution  // Approximates a flat disk / circle
  { constructor( rows, columns ) { super( rows, columns, [ ...Vec.cast( [0, 0, 0], [1, 0, 0] ) ] ); 
                                   this.normals = this.normals.map( x => Vec.of( 0,0,1 ) );
                                   this.texture_coords.forEach( (x, i, a) => a[i] = this.positions[i].map( x => x/2 + .5 ).slice(0,2) ); } }
  
class Cylindrical_Tube extends Surface_Of_Revolution    // An open tube shape with equally sized sections, pointing down Z locally.    
  { constructor( rows, columns, texture_range ) { super( rows, columns, [ ...Vec.cast( [1, 0, .5], [1, 0, -.5] ) ], texture_range ); } }

class Cone_Tip extends Surface_Of_Revolution            // Note:  Curves that touch the Z axis degenerate from squares into triangles as they sweep around
  { constructor( rows, columns, texture_range ) { super( rows, columns, [ ...Vec.cast( [0, 0, 1],  [1, 0, -1]  ) ], texture_range ); } }

class Torus extends Shape
  { constructor( rows, columns, texture_range )  
      { super();      
        let circle_points = Array( rows ).fill( Vec.of( .5,0,0 ) );   
        circle_points = circle_points.map( (x,i,a) => Mat4.rotation( i/(a.length-1) * 2*Math.PI, Vec.of( 0,-1,0 ) ).times( x.to4(1) ).to3() );
        circle_points = circle_points.map( (x,i,a) => Mat4.translation([ -.75,0,0 ]).times( x.to4(1) ).to3() );
      
        Surface_Of_Revolution.prototype.insert_transformed_copy_into( this, [ rows, columns, circle_points, texture_range ] );         
      } }
      
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super();            
        let semi_circle_points = Array( rows ).fill( Vec.of( 0,0,1 ) );
        semi_circle_points = semi_circle_points.map( (x,i,a) => Mat4.rotation( i/(a.length-1) * Math.PI, Vec.of( 0,1,0 ) ).times( x.to4(1) ).to3() );
        
        Surface_Of_Revolution.prototype.insert_transformed_copy_into( this, [ rows, columns, semi_circle_points, texture_range ] );     
      } }
      
class Closed_Cone extends Shape     // Combine a cone tip and a regular polygon to make a closed cone.
  { constructor( rows, columns, texture_range ) 
      { super();
        Cone_Tip          .prototype.insert_transformed_copy_into( this, [ rows, columns, texture_range ]);    
        Regular_2D_Polygon.prototype.insert_transformed_copy_into( this, [ 1, columns ], Mat4.rotation( Math.PI, Vec.of(0, 1, 0) ).times( Mat4.translation([ 0, 0, 1 ]) ) ); } }

class Rounded_Closed_Cone extends Surface_Of_Revolution   // An alternative without two separate sections
  { constructor( rows, columns, texture_range ) { super( rows, columns, [ ...Vec.cast( [0, 0, 1], [1, 0, -1], [0, 0, -1] ) ], texture_range ) ; } }

class Capped_Cylinder extends Shape   // Combine a tube and two regular polygons to make a closed cylinder.  Flat shade this to make a prism, where #columns = #sides.
  { constructor( rows, columns, texture_range )
      { super();
        Cylindrical_Tube  .prototype.insert_transformed_copy_into( this, [ rows, columns, texture_range ] );
        Regular_2D_Polygon.prototype.insert_transformed_copy_into( this, [ 1, columns ],                                             Mat4.translation([ 0, 0, .5 ]) );
        Regular_2D_Polygon.prototype.insert_transformed_copy_into( this, [ 1, columns ], Mat4.rotation( Math.PI, Vec.of(0, 1, 0) ).times( Mat4.translation([ 0, 0, .5 ]) ) ); } }
  
class Rounded_Capped_Cylinder extends Surface_Of_Revolution   // An alternative without three separate sections
  { constructor ( rows, columns, texture_range ) { super( rows, columns, [ ...Vec.cast( [0, 0, .5], [1, 0, .5], [1, 0, -.5], [0, 0, -.5] ) ], texture_range ); } } 
  
class Axis_Arrows extends Shape   // An axis set made out of a lot of various primitives.
{ constructor()
    { super();
      var stack = [];       
      Subdivision_Sphere.prototype.insert_transformed_copy_into( this, [ 3 ], Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ).times( Mat4.scale([ .25, .25, .25 ]) ) );
      this.drawOneAxis( Mat4.identity(),                                                            [[  0 ,.33 ], [ 0,1 ]] );
      this.drawOneAxis( Mat4.rotation(-Math.PI/2, Vec.of(1,0,0)).times( Mat4.scale([  1, -1, 1 ])), [[ .34,.66 ], [ 0,1 ]] );
      this.drawOneAxis( Mat4.rotation( Math.PI/2, Vec.of(0,1,0)).times( Mat4.scale([ -1,  1, 1 ])), [[ .67, 1  ], [ 0,1 ]] ); 
    }
  drawOneAxis( transform, tex )    // Use a different texture coordinate range for each of the three axes, so they show up differently.
    { Closed_Cone     .prototype.insert_transformed_copy_into( this, [ 4, 10, tex ], transform.times( Mat4.translation([   0,   0,  2 ]) ).times( Mat4.scale([ .25, .25, .25 ]) ), 0 );
      Cube            .prototype.insert_transformed_copy_into( this, [ ],            transform.times( Mat4.translation([ .95, .95, .45]) ).times( Mat4.scale([ .05, .05, .45 ]) ), 0 );
      Cube            .prototype.insert_transformed_copy_into( this, [ ],            transform.times( Mat4.translation([ .95,   0, .5 ]) ).times( Mat4.scale([ .05, .05, .4  ]) ), 0 );
      Cube            .prototype.insert_transformed_copy_into( this, [ ],            transform.times( Mat4.translation([   0, .95, .5 ]) ).times( Mat4.scale([ .05, .05, .4  ]) ), 0 );
      Cylindrical_Tube.prototype.insert_transformed_copy_into( this, [ 7, 7,  tex ], transform.times( Mat4.translation([   0,   0,  1 ]) ).times( Mat4.scale([  .1,  .1,  2  ]) ), 0 );
    }
}

class Fake_Bump_Map extends Phong_Model  // Overrides Phong_Model except for one thing                  
{ fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        uniform sampler2D texture;          //  Like real bump mapping, but with no separate file for the bump map (instead we'll
        void main()                         //  re-use the colors of the original picture file to disturb the normal vectors)
        {
          if( GOURAUD || COLOR_NORMALS )    // Bypass Smooth "Phong" shading if, as in Gouraud case, we already have final colors to smear (interpolate) across vertices.
          {
            gl_FragColor = VERTEX_COLOR;
            return;
          }                                 // Calculate Smooth "Phong" Shading (not to be confused with the Phong Reflection Model).  As opposed to Gouraud Shading.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Use texturing as well
          vec3 bumped_N  = normalize( N + tex_color.rgb - .5*vec3(1,1,1) );           // Slightly disturb normals based on sampling the same texture
          gl_FragColor      = tex_color * ( USE_TEXTURE ? ambient : 0.0 ) + vec4( shapeColor.xyz * ambient, USE_TEXTURE ? shapeColor.w * tex_color.w : shapeColor.w ) ;
          gl_FragColor.xyz += phong_model_lights( bumped_N );
        }`;
    }
}
  
