// Dentritic tree definition

(function(window) {
    'use strict';

    var DT_STATE_NORMAL=0, DT_STATE_SHUNTED = 1;
    var DTreeMethods = {
        propagate: propagate,
        receiveBackprop: receiveBackprop,
        propagateBackprop : propagateBackprop
    };
    window.DTree = function(options){
        var d_tree = Object.create(DTreeMethods);
        d_tree.state = DT_STATE_NORMAL;
        d_tree.branches = [];
        for (var i=0, total=options.d_branches; i<total; i++){
            d_tree.branches.push(DSpine())
        }
        return d_tree;
    };

})(window);