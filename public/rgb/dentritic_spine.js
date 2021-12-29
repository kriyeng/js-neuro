// Dentritic Spine definition

(function(window) {
    'use strict';

    var default_ca_concentration = 0.1;
    var DSpineMethods = {
        propagate: propagate,
        receiveBackprop: receiveBackprop
    };
    window.DSpine = function(options){
        var d_spine = Object.create(DSpineMethods);
        d_spine.calcium = default_ca_concentration;
        return d_spine;
    };

})(window);