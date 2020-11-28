
var http = require('http');
var https = require('https');

var config = require('./config');
var app = require('./app');


var server = null;

if (config.express.https){
    var sslConfig = require('./ssl-config');

    var options = {
        key: sslConfig.key,
        cert: sslConfig.cert
    };

    server = https.createServer(options, app).listen(config.express.port, handleListen);
} else {
    server = http.createServer(app).listen(config.express.port, handleListen);
}

function handleListen(){
    console.log('Express server listening on port ' + config.express.port);
}

var websockets = require('./functions/websockets');
var io         = require('socket.io').listen(server);
websockets.initialize(io);
