var dbm = require('../functions/db_manager');

module.exports = {
    get : get,
    create : create,
    update : update,
    del : del
};

function get(model, options, callback){
    dbm.get(model, options, callback)
}

function create(model, options, callback){
    options.created_at = '{{ NOW() }}';
    options.updated_at = '{{ NOW() }}';

    dbm.create(model, options, callback)
}

function update(model, options, callback){
    options.updated_at = '{{ NOW() }}';

    dbm.update(model, options, callback)
}

function del(model, options, callback){

    dbm.del(model, options, callback)
}