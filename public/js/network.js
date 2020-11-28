(function(window) {
    'use strict'

    var TM_RESET_OUTPUT = 500;

    var Network = {
        initialize : initialize,
        getInputs : getInputs,
        getOutputs : getOutputs,
        getLevels : getLevels,
        setInputSpike : setInputSpike,
        spikeOuput : spikeOuput
    };

    var c_length = 0;
    var lv_length = 0;

    var levels = [];
    var inputs = {
        columns : []
    };
    var outputs = {
        columns : []
    };

    function initialize(level_length, column_length){
        lv_length = level_length;
        c_length = column_length;

        for (var col=0; col < c_length; col++){
            for (var lv=0; lv < lv_length; lv++){
                if(typeof levels[lv] === 'undefined'){
                    levels[lv] = {}
                    levels[lv].index = lv;
                    levels[lv].level = lv + 1;

                    levels[lv].columns = [];

                }
                levels[lv].columns[col] = CColumn(lv + 1, col, lv === lv_length - 1 ? 'output' : lv + 1);
            }
            inputs.columns[col] = { id : col, key : 'In_' + col, value : 0 };
            outputs.columns[col] = { id : col, key : 'Out_' + col, value : 0 };
        }
        console.log(inputs.columns);
        console.log(levels);
        console.log(outputs.columns);
    }

    function setInputSpike(index){
        var in_layer = inputs.columns[index];
        setState(in_layer, 2);

        setTimeout(function(){
            setState(in_layer, 0)
        }, TM_RESET_OUTPUT)

        levels[0].columns[index].L4Dendrites('input');
    }

    function spikeOuput(column, layer){
        var out = outputs.columns[column.index];
        setState(out, 2);

        setTimeout(function(){
            setState(out, 0)
        }, TM_RESET_OUTPUT)
    }

    function setState(field, state){
        field.value = state;
        field.state = state;
        EventManager.fire('layer-state-changed', { key : field.key, state : state });
    }

    function getInputs(){
        return inputs;
    }

    function getOutputs(){
        return outputs;
    }

    function getLevels(){
        return levels;
    }


    window.Network = Network;

})(window);