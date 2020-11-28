var BROWSER_CHANNEL = '1';
var socket = io();

socket.on(BROWSER_CHANNEL, function (data) {
    console.log("Websocket Received: ", data);
    checkMessageReceived(data);
});

function sendSocket(channel, data){
    socket.emit(channel, data);
}

function checkMessageReceived(data){
    if(data && data['action'] && data['model']){
        EventManager.fire(data.action + '-' + data.model, data.data);
    }
}