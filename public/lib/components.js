(function(window) {
  "use strict";
  var components = {
    loadComponents: loadComponents
  };

  function loadComponents(callback) {
    var $components_container = $("#components");

    if (!$components_container.length) {
      console.error(
        "Components.js: There's no container defined for components. Missing #complements element"
      );
      return;
    }

    var $components = $(".component");
    var loaded = 0;
    for (var i = 0, total = $components.length; i < total; i++) {
      if ($components[i].attributes["comp-include"]) {
        $.get($components[i].attributes["comp-include"].value, function(data) {
          $components_container.append(data);
          loaded++;
          if (loaded === total) {
            if (callback) callback();
          }
        });
      }
    }
    //console.log($components);
  }

  window.comp = components;
})(window);
