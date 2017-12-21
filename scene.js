"use strict"    
window.onload = function init()        // ********************* THE ENTRY POINT OF THE WHOLE PROGRAM STARTS HERE ********************* 
{ window.contexts = {};                                                            // A global variable, "contexts".  Browsers support up to 16 WebGL contexts per page.
  
  const scenes  = ["Main_Scene" ]; // Register some scenes to the "Canvas_Manager" object -- which WebGL calls
                                                                                   // upon every time a draw / keyboard / mouse event happens.  
  
  if( eval( "typeof " + scenes[0] ) !== "undefined" )
  { document.getElementById( "canvases" ).appendChild( Object.assign( document.createElement( "canvas" ), { id: "main_canvas", width: 800, height: 600 } ) );
    contexts[ "main_canvas" ] = new Canvas_Manager( "main_canvas", Color.of( 0,0,0,1 ), scenes );   // Manage the WebGL canvas.  Second parameter sets background color.
    for( let c in contexts ) contexts[ c ].render();     // Call render() for each WebGL context on this page.  Then render() will re-queue itself for more calls.         
  }     
}