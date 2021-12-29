// Axon Terminal definition

(function(window) {
    'use strict';

    var ATerminalMethods = {
        releaseNT : releaseNT
    };
    window.ATerminal = function(options){
        var a_terminal = Object.create(ATerminalMethods);
        return a_terminal;
    };

})(window);