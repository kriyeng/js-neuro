(function(window) {
    'use strict'

    var T = {
        id : 'T',
        name: 'time-neurons',
        neurons: []
    };

    var I = {
        id : 'I',
        name: 'inhibitor-neuron',
        neurons: []
    };

    var V = {
        id: 'V',
        name: 'value-neurons',
        neurons: []
    };

    var num_time_neurons = 4;

    var Network = {
        initialize : initialize,
        input : input,
        getRegions : getRegions,
        getOuputs : getOuputs,
        askFor : askFor
    };

    function initialize(){
        for (var i=0; i < num_time_neurons; i++){
            T.neurons.push(Neuron({id : T.name + "-" + i, region : 'T', position: i}));
        }
        Network.T = T;

        /*
        for (var i=0; i < num_time_neurons; i++){
            I.neurons.push(Neuron({id : I.name + "-" + i, region : 'I', position: i}));
        }
        Network.I = I;
        */
        I.neurons.push(Neuron({id : I.name + "-" + 0, region : 'I', position: 0}));
        Network.I = I;

        configureTimingShuntings();
        configureInhibitorsShuntings();

        for (var i=0; i < num_time_neurons; i++){
            V.neurons.push(Neuron({id : V.name + "-" + i, region : 'V', position: i}));
        }
        Network.V = V;
    }

    function configureTimingShuntings(){
        var shuntings = [null, [0, 1, 2, 3], [0, 1, 4, 5], [0, 2, 4, 6] ];
        var id_shunting = 0;

        T.neurons.forEach(function(neuron_o, index_o){
            T.neurons.forEach(function(neuron_d, index_d){

                if(index_o === index_d) {
                    id_shunting++;
                } else {
                    shuntings[id_shunting].forEach(function(branch_number){
                        neuron_o.addSynapse({
                            branch : 0,
                            shunting : true,
                            dest_branch : branch_number+1,
                            neuron_d : neuron_d
                        });
                    });
                }
                console.log(id_shunting, index_o, index_d)
            })

            neuron_o.addSynapse({
                branch : 0,
                shunting : true,
                dest_branch : index_o,
                neuron_d : I.neurons[0]
            });
        });
    }


    function configureInhibitorsShuntings(){
        var shuntings = [null, [4, 5, 6, 7], [2, 3, 6, 7], [1, 3, 5, 7] ];
        var id_shunting = 0;

        /*
        I.neurons.forEach(function(neuron_o, index_o){
            T.neurons.forEach(function(neuron_d, index_d){
                if(index_o === index_d) {
                    id_shunting++;
                } else {
                    shuntings[id_shunting].forEach(function(branch_number){
                        neuron_o.addSynapse({
                            branch : 0,
                            shunting : true,
                            dest_branch : branch_number+1,
                            neuron_d : neuron_d
                        });
                    });
                }
            })
        });
        */
        for(var index_o = 0; index_o<4; index_o++) {
            T.neurons.forEach(function (neuron_d, index_d) {
                if (index_o === index_d) {
                    id_shunting++;
                } else {
                    shuntings[id_shunting].forEach(function (branch_number) {
                        I.neurons[0].addSynapse({
                            branch: index_o,
                            shunting: true,
                            dest_branch: branch_number + 1,
                            neuron_d: neuron_d
                        });
                    });
                }
            })
        }
    }

    function input(options){
        Network[options.region].neurons.forEach(function(neuron, index){
            if(options.input[index] === '1') neuron.synapse({ signal : 1 }); // We make neuron spike directly because is an input
        });
        if(options.training) {
            setTimeout(function () {
                learn();
            }, 100);
        }
    }

    function askFor(item){
        for(var i=0; i<5; i++){
            setTimeout(function(){
                input({ region : "T", input : (item).toString(2).padStart(4,'0') });
                input({ region : "I", input : (1).toString(2).padStart(1,'0') });
            }, i*100);
        }
    }

    function learn(){
        Network.V.neurons.forEach(function(neuron_v, index_v){
            if(neuron_v.state === 1){
                //console.log("Neuron V: " + index_v + " Spiking");
                Network.T.neurons.forEach(function(neuron_t, index_t){
                    if(neuron_t.state === 1){
                        //console.log("Neuron T: " + index_t + " Spiking");
                        neuron_t.axon_tree.forEach(function(branch, index_b){
                            if (index_b > 0 && !branch.shunted) {
                                var synapse_exists = false;
                                for (var i = 0, total = branch.synapses.length; i<total; i++){
                                    if (branch.synapses[i].neuron_d === neuron_v){
                                        synapse_exists = true;
                                        break;
                                    }
                                }
                                if(!synapse_exists) {
                                    neuron_t.addSynapse({
                                        branch: index_b,
                                        shunting: false,
                                        neuron_d: neuron_v
                                    });
                                    console.log("Neuron T: " + index_t + " created a new synapse to neuron " + neuron_v.id);
                                }
                            }
                        });
                    }
                });
            }
        })
    }

    function getRegions(){
        return [ I, T, V ];
    }

    function getOuputs(options){
        return Network[options.region].neurons.map(function(neuron) { return neuron.state.toString() });
    }


    window.Network = Network;

})(window);
