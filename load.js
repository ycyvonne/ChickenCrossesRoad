(function(){
  function load(script) {
    document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
  }

  load("vendor/tinywebgl-ucla.js");
  load("vendor/dependencies.js");
  load("vendor/surfaces.js");
  load("vendor/collisions.js");

  load("main.js");
  load("scene-controller.js");


})();