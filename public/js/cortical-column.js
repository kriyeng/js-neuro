(function(window) {
    'use strict'

    var ST_RESTING = 0,
        ST_DEPOLARISING = 1,
        ST_RISING = 2,
        ST_FALLING = 3;
    // ST_UNDERSHOOT = 4;

    var time_multiplyier = 5;
    var TM_DEPOL = 10 * time_multiplyier,
        TM_RISING = 50 * time_multiplyier,
        TM_FALLING = 70 * time_multiplyier;
    // TM_UNDERSHOOT = 30

    function CColumn(level, index, next_level){

        var ccolumn  = Object.create(methods);
        ccolumn.level = level;
        ccolumn.index = index;
        ccolumn.next_level = next_level;

        ccolumn.layers = [
            { id : 'L0', key : 'idx_' + index + 'Lv' + level + 'L0', state : ST_RESTING },
            { id : 'L1', key : 'idx_' + index + 'Lv' + level + 'L1', state : ST_RESTING },
            { id : 'L2', key : 'idx_' + index + 'Lv' + level + 'L2', state : ST_RESTING },
            { id : 'L3', key : 'idx_' + index + 'Lv' + level + 'L3', state : ST_RESTING },
            { id : 'L4', key : 'idx_' + index + 'Lv' + level + 'L4', state : ST_RESTING },
            { id : 'L5', key : 'idx_' + index + 'Lv' + level + 'L5', state : ST_RESTING },
            { id : 'L6', key : 'idx_' + index + 'Lv' + level + 'L6', state : ST_RESTING }
        ];

        return ccolumn;
    }

    var methods = {
        L4Dendrites : L4Dendrites,
        L2Dendrites : L2Dendrites,
        L3Dendrites : L3Dendrites,
    };

    function depolarize(layer, callback){
        setLayerState(layer, ST_DEPOLARISING);
        setTimeout(function(){
            callback();
        }, TM_DEPOL)
    }

    function spike(column, layer, dest_column, destinations){
        setLayerState(column.layers[layer], ST_RISING);
        setTimeout(function(){
            setLayerState(column.layers[layer], ST_FALLING);

            setTimeout(function(){
                setLayerState(column.layers[layer], ST_RESTING);
            }, TM_FALLING);

            setTimeout(function(){
                for( var i=0, total = destinations.length; i < total; i++){
                    destinations[i].call(dest_column, column, layer);
                }
            },0);
        }, TM_RISING)
    }

    function setLayerState(layer, state){
        layer.state = state;
        EventManager.fire('layer-state-changed', { key : layer.key, state : layer.state });
    }

    function L4Dendrites(origin_column, origin_layer){
        var column = this;
        if(column.layers[4].state === ST_RESTING ) {
            depolarize(column.layers[4], function(){
                spike(column, 4, column, [column.L2Dendrites, column.L3Dendrites]); // Ww could set this array dynamically. As soon as new connections are done, new callback will be stablished
            });
        }
    }

    function L2Dendrites(origin_column, origin_layer, callback){
        var column = this;
        if(origin_column===column && origin_layer === 4 && column.layers[2].state === ST_RESTING){
            depolarize(column.layers[2], function(){

                if(column.next_level === 'output') {
                    spike(column, 2, window, [Network.spikeOuput]);
                } else {
                    var destination_column = Network.getLevels()[column.next_level].columns[column.index];
                    spike(column, 2, destination_column, [destination_column.L4Dendrites]);
                }
            });
        }
    }

    function L3Dendrites(origin_column, origin_layer, callback){
        var column = this;
        if(origin_column===column && origin_layer === 4 && column.layers[3].state === ST_RESTING){
            depolarize(column.layers[3], function(){
                spike(column, 3, null, []);
            });
        }
    }

    window.CColumn = CColumn

})(window);