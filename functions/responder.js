'use strict'

module.exports = {
    send : send
};

function send(err, res, data){
    if(err) {
        res.status(400).send(err);
    } else {
        res.status(200).send(data);
    }
}

