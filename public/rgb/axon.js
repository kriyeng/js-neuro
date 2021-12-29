// Dentritic tree definition

(function(window) {
    'use strict';

    var AxonMethods = {
        spike: spike
    };

    window.Axon = function(options){
        var axon = Object.create(AxonMethods);
        axon.terminals = [];
        for (var i=0, total=options.a_terminals; i<total; i++){
            axon.terminals.push(ATerminal())
        }
        return axon;
    };

})(window);