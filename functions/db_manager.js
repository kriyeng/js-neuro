var db = require('./db_connection');
var models = require('../models/models');

module.exports = {
    get : get,
    create : create,
    update : update,
    del : del
};

function get(str_model, options, callback){
    if(!models[str_model] || !models[str_model].name) return callback(new Error("Model not found or corrupted"));
    model = models[str_model];

    /*
    if(options.foreign_model && (!model.relations || !model.relations[options.foreign_model] || !models[model.relations[options.foreign_model].many_table] ) )
        return callback(new Error("Foreign Model not found or corrupted"));

    model = models[model.relations[options.foreign_model].many_table];
    */

    var query = getQuery(model, options);
    if(query.err) return callback(query.err);

    console.log(query.sql);

    db.query(query.sql, {}, function(err, rows){
        if(err || !options.filter) return callback(err, rows);

        if(query.filter.include && query.relation) rows = parseJSONIncludedFields(rows, query);

        return callback(null, rows);
    });
}

function parseJSONIncludedFields(rows, query){
    rows.forEach(function(row){
        row[query.filter.include] = JSON.parse(row[query.filter.include]);
        if(row[query.filter.include].length === 1 && row[query.filter.include][0][query.relation.many_table_id] === null){
            row[query.filter.include] = []
        }
    });
    return rows;
}

function getQuery(model, options){

    var fields = {};

    fields.columns = model.columns_mask && !options.unmasked ?
        model.columns_mask.map(function(item) {
            return model.name + "." + item
        })
        : [ model.name + ".*" ];

    try {
        var filter = options.filter ? JSON.parse(options.filter) : null;
    } catch (err){
        return { err : new Error("Wrong filter format") };
    }

    var query = {
        filter : filter,
        relation : filter && filter.include && model.relations && model.relations[filter.include] ? model.relations[filter.include] : null,
        model : model
    };

    if (query.relation) fields = getFilteredQuery(model, fields, filter, query.relation);

    fields.where = model.logic_delete && !options.show_deleted ? ` WHERE ${model.name}.deleted = 0 ` : ``;
    fields.where += options.id ? (fields.where === `` ? ` WHERE ` : ` AND `) + ` ${model.name}.${model.id} = ${options.id} ` : ``;

    if (filter && filter.where){
        var wheres = filter.where.and ? filter.where.and : [ filter.where ];
        fields.where += (fields.where === `` ? ` WHERE ` : ` AND `) + joinColumnsToWhere(wheres);
    }

    query.sql = `SELECT ${fields.columns.join(',')} FROM ${model.name} ${fields.left_join || ''} ${fields.where} ${fields.group_by || ''};`;

    return query;
}

function joinColumnsToWhere(and_columns){
    // Revise this function to protect against sql injection
    return and_columns.map(function(column){
        return Object.getOwnPropertyNames(column).map(function(key){
            return `${key} = ${column[key]}`;
        })[0];
    }).join(' AND ');

}

function getFilteredQuery(model, fields, filter, relation){

    var foreign_model = models[relation.many_table] ? models[relation.many_table] : null;
    var foreign_columns = foreign_model.columns_mask ? foreign_model.columns_mask : foreign_model.columns;

    var foreign_column_pairs = foreign_columns.map(function(column){
        return `'${column}', ${foreign_model.name}.${column}`;
    }).join(',');

    fields.columns.push(`JSON_ARRAYAGG( JSON_OBJECT( ${foreign_column_pairs} )) as ${filter.include}`);

    fields.left_join.push(` LEFT JOIN ( ${relation.table}, ${relation.many_table} ) ON ` +
        ` ( ${relation.table}.${relation.foreign_key} = ${model.name}.${relation.column} ` +
        ` AND ${relation.many_table}.${relation.many_table_id} = ${relation.table}.${relation.foreign_many_key} ` +
        ( foreign_model.logic_delete ? ` AND ${relation.table}.${foreign_model.logic_delete} = 0 )` : `)` ) );

    fields.group_by = ` GROUP BY ${model.name}.${relation.column}`;

    return fields;
}

function create(str_model, options, callback){

    if(!models[str_model] || !models[str_model].name) return callback(new Error("Model not found or corrupted"));
    var model = models[str_model];

    var required = model.required || [];

    var missing_parameters = required.reduce(function(missing, item){
        return missing || typeof options[item] === 'undefined'
    }, false);

    if(missing_parameters) return callback(new Error("Missing Parameters"));

    var columns = model.columns.filter(function(item) {
        return typeof options[item] !== 'undefined'
    });

    var parameters = columns.filter(function(item){
            return options[item].toString().indexOf('{{') < 0
        }).map(function(item){
            return options[item];
        });

    var str_query = "INSERT INTO " + model.name +
        " (" + columns.join(',') + ") VALUES " +
        " (" + columns.map(function(item){ return getValue(item, options) }).join(',') + " ) ";

    db.query(str_query, parameters, function(err, result){

        if(err) return callback(err);
        if(!result || !result.insertId) return callback(new Error("Nothing created"));

        var str_query = "SELECT * FROM " + model.name +
            " WHERE " + model.id + " = " + result.insertId + " ";

        db.query(str_query, {}, function(err, rows){
            callback(err, (rows && rows.length) ? rows[0] : {});
        });
    });
}

function update(str_model, options, callback){

    if(!models[str_model] || !models[str_model].name || !models[str_model].id || !models[str_model].columns) return callback(new Error("Model not found or corrupted"));
    var model = models[str_model];

    if(typeof options['id'] === 'undefined') return callback(new Error("Missing key_id Parameter"));

    var columns = model.columns.filter(function(item) {
        return typeof options[item] !== 'undefined'
    });

    var parameters = columns.filter(function(item){
        return options[item].toString().indexOf('{{') < 0
    }).map(function(item){
        return options[item];
    });

    var id = options['id'];
    parameters.push(id);

    var str_query = "UPDATE " + model.name + " SET " +
                    " " + columns.map(function(item){ return item + '=' + getValue(item, options) }).join(',') + " " +
                    " WHERE " + model.id + "=?;";

    console.log(str_query, parameters );

    db.query(str_query, parameters, function(err, result){

        if(err) return callback(err);

        var str_query = "SELECT * FROM " + model.name +
                        " WHERE " + model.id + "=?; ";

        db.query(str_query, [id], function(err, rows){
            callback(err, (rows || rows.length) ? rows[0] : {});
        });
    });
}

function del(str_model, options, callback){

    if(!models[str_model] || !models[str_model].name) return callback(new Error("Model not found or corrupted"));
    var model = models[str_model]

    if(typeof options['id'] === 'undefined') return callback(new Error("Missing key_id Parameter"));
    var id = options['id'];

    var str_query = model.logic_delete ? `UPDATE ${model.name} SET ${model.logic_delete} = 1 ` : `DELETE FROM ${model.name} `;
    str_query +=  ` WHERE ${model.id}=?; `;

    console.log(str_query, [id]);
    db.query(str_query, [id], callback);
}

function getValue(item, options){
    return options[item].toString().indexOf('{{') > -1 ? options[item].replace('{{','').replace('}}','') : '?'
}
