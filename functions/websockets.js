// Web sockets interaction with displays

var websocket;

exports.channels = channels = {
    BROWSER_CHANNEL : '1'
};

var open_sockets;

exports.initialize = function(io){

    open_sockets = io.sockets;

    io.on('connection', function (socket) {
        websocket = socket;
    });
};

exports.sendWebSocket = function(channel, data){
    if(open_sockets) open_sockets.emit(channel, data);
};