let cached_shapes = null;

function getShapes() {
  
  if( cached_shapes ) return cached_shapes;
  
  
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
    var shapes = { 
      good_sphere : new Subdivision_Sphere( 4 ),                                           // A sphere made of nearly equilateral triangles / no singularities
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
      pyramid     : new Pyramid()
    };
    
  cached_shapes = shapes;
  return shapes;
}