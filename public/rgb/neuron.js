(function(window) {
    'use strict'

    var NeuronMethods = {
        get_mp : get_mp
    };

    window.Neuron = function(options){
        var neuron = Object.create(NeuronMethods);

        neuron.id = options.id;
        neuron.d_tree = DTree(options);
        neuron.soma = Soma();
        neuron.a_terminals = Axon(options);

        return neuron;
    };

})(window);