(function(window) {
    'use strict'

    var threshold = 0.99;
    var signal = 0.25;
    var recovery_time = 200; //ms
    var ST_RESTING = 0,
        ST_SPIKING = 1;
    var num_branches = 9;

    var Synapse = function(options){

        var synapse = Object.create({});

        synapse.parentId = options.parent_id;
        synapse.neuron_d = options.neuron_d;
        synapse.shunting = options.shunting;
        synapse.dest_branch = options.dest_branch;

        return synapse;
    };

    var NeuronMethods = {
        synapse : synapse,
        addSynapse : addSynapse,
        spike : spike,
        shunt : shunt,
        reset : reset,
        recovery : recovery
    };

    function synapse(options){
        if(options.shunting && options.branch){
            //console.log("Neuron " + this.id + " branch " + options.branch + " shunted");
            this.axon_tree[options.branch].shunted = true;
        } else {
            this.membrane_potential += options.signal;
            //console.log("Neuron " + this.id + " received signal " + options.signal + " MP: " + this.membrane_potential);
            if (this.membrane_potential > threshold) this.spike();
        }

        // Process Recovery
        var self = this;

        if(self.recovery_timeout) clearTimeout(self.recovery_timeout);

        self.recovery_timeout = setTimeout(function(){
            self.recovery_timeout = null;
            self.recovery();
        }, recovery_time);
    }

    function addSynapse(options){
        options.parent_id = this.id;
        this.axon_tree[options.branch].synapses.push(Synapse(options));
    }

    function spike(){
        this.state = ST_SPIKING;
        EventManager.fire('neuron-state-changed', this);

        // Process Spike
        var self = this;
        this.axon_tree.forEach(function(branch, index){
            if(!branch.shunted){
                branch.synapses.forEach(function(synapse){
                    setTimeout(function(){
                        if(!branch.shunted){
                            //console.log("Spiking " + self.id + " On branch: " + index + " Shunting " + synapse.shunting);
                            branch.state = ST_SPIKING;
                            synapse.neuron_d.synapse({signal : signal, shunting : synapse.shunting, branch : synapse.dest_branch});
                        }
                    },synapse.shunting ? 0 : 50);
                });
            }
        });
    }

    function recovery(){
        this.reset();
        EventManager.fire('neuron-state-changed', this );
    }

    function shunt(options){
        if(!options.output || options.output > this.axon_tree.length) return;
        this.axon_tree[options.output].shunted = true;
    }

    function reset(options){
        //if(this.membrane_potential>0) console.log("Neuron " + this.id + " restored MP");
        this.membrane_potential = 0;
        this.state = ST_RESTING;
        this.axon_tree.forEach(function(branch){
            if(options && options.clear_synapses) branch.synapses = [];
            branch.shunted = false;
            branch.state = ST_RESTING;
        });
    }

    window.Neuron = function(options){
        var neuron = Object.create(NeuronMethods);

        neuron.id = options.id;
        neuron.region = options.region;
        neuron.position = options.position;
        neuron.state = ST_RESTING;
        neuron.membrane_potential = 0;
        neuron.axon_tree = [];
        neuron.recovery_timeout = null;

        for (var i=0; i<num_branches; i++) {
            neuron.axon_tree.push({
                state: ST_RESTING,
                shunted: false,
                synapses: [],
            });
        }

        return neuron;
    }

})(window);