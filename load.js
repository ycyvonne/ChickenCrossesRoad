(function(){
  function load(script) {
    document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
  }

  load("vendor/tinywebgl-ucla.js");
  load("vendor/dependencies.js");
  load("vendor/surfaces.js");

  load("main.js");
  load("scene.js");

})();