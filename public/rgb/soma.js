// Soma definition

(function(window) {
    'use strict';

    var default_membrane_potential = -0.2;
    var threshold = 0.30;
    var recovery_time = 200; //ms

    var SomaMethods = {
        spike : spike,
        propagateToAxon : propagateToAxon,
        propagateToDendrites : propagateToDendrites,
        getMP : getMP
    };
    window.Soma = function(options){
        var soma = Object.create(SomaMethods);
        soma.mp = default_membrane_potential;

        return soma;
    };

})(window);