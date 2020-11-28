var Repository = require('./generic-repository');
var Responder = require('../functions/responder');
var websocket = require('../functions/websockets');

module.exports = {
    get : get,
    getByIdRelations : getByIdRelations,
    getById : getById,
    findOne : findOne,
    create : create,
    update : update,
    del : del
};

function get(model){
    return function get(req, res) {

        var options = req.query;

        Repository.get(model, options, function getCB(err, data) {
            Responder.send(err, res, data);
        })
    }
}

function getByIdRelations(model){
    return function getByIdRelations(req, res) {

        var options = req.query;
        options.relation_id = req.params.id;
        options.foreign_model = req.url.substr(req.url.lastIndexOf('/')+1);

        Repository.get(model, options, function getCB(err, data) {
            Responder.send(err, res, data);
        })
    }
}

function getById(model){
    return function getById(req, res) {

        var options = req.query;
        options.id = req.params.id;

        Repository.get(model, options, function getByIdCB(err, data) {
            Responder.send(err, res, data && data.length ? data[0] : {});
        })
    }
}

function findOne(model){
    return function findOne(req, res) {

        var options = req.query;

        Repository.get(model, options, function getFindOne(err, data) {
            Responder.send(err, res, data && data.length ? data[0] : {});
        })
    }
}

function create(model) {
    return function create(req, res) {

        var options = req.body;

        Repository.create(model, options, function createCB(err, data) {
            Responder.send(err, res, data);

            if(!err && data && data.length){
                var notification = {
                    action : 'new',
                    model : model,
                    data : data
                };
                websocket.sendWebSocket(websocket.channels.BROWSER_CHANNEL, notification);
            }
        })
    }
}

function update(model) {
    return function update(req, res) {

        var options = req.body;
        options.id = req.params.id;

        Repository.update(model, options, function updateCB(err, data) {
            Responder.send(err, res, data);

            if(!err && data && data.length){
                var notification = {
                    action : 'update',
                    model : model,
                    data : data
                };
                websocket.sendWebSocket(websocket.channels.BROWSER_CHANNEL, notification);
            }
        })
    }
}

function del(model) {
    return function del(req, res) {
        var options = {};
        options.id = req.params.id;

        Repository.del(model, options, function delCB(err, data) {
            Responder.send(err, res, data);

            if(!err && data && data.affectedRows > 0){
                var notification = {
                    action : 'del',
                    model : model,
                    data : { id : options.id }
                };
                websocket.sendWebSocket(websocket.channels.BROWSER_CHANNEL, notification);
            }
        })
    }
}
