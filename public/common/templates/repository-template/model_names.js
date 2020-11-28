(function(window) {
    "use strict";

    var model_names = [];

    // Define the public methods and properties
    var ModelNames = {
        initialize : initialize,
        loadModelNames : loadModelNames,
        refreshModelNames : loadModelNames,
        getModelNamesByType : getModelNamesByType,
        getModelNamesByOperador : getModelNamesByOperador,
        getModelNameById : getModelNameById
    };

    function initialize(callback){
        loadModelNames(function(err){
            callback(err);
        });

        EventManager.subscribe('model_name-updated', updateModelName);
        EventManager.subscribe('model_names-refreshed', refreshModelNames);
    }

    function loadModelNames(callback){
        Api.getModelNames(function(err, data){
            if(err) return callback ? callback(err) : null;

            model_names = data.rows;
            if(callback) callback(null);
        });
    }

    function refreshModelNames(){
        loadModelNames(function(){
            EventManager.fire('model_names-refresh-service-list');
        });
    }

    function updateModelName(event){
        if(event.model_names){
            event.model_names.forEach(function(item){
                switch(event.action) {
                    case 'updated':
                        var model_name_index = getModelNameIndexById(item.id_model_name);
                        if (typeof model_name_index !== 'undefined') {
                            model_names[model_name_index] = $.extend({}, item);
                        }
                        break;

                    case 'new':
                        model_names.push($.extend({}, item));
                        break;

                    case 'deleted':
                        var model_name_index = getModelNameIndexById(item.id_model_name);
                        if (typeof model_name_index !== 'undefined') {
                            model_names.splice(model_name_index,1);
                        }
                        break;
                }
            });
        }
    }

    function getModelNameById(id_model_names){
        if(!id_model_names) return null;

        return model_names.find(function(item){
            return item.id_model_names == id_model_names;
        })
    }

    function getModelNameIndexById(id_model_names){
        if(!id_model_names) return null;

        return model_names.findIndex(function(item){
            return item.id_model_names == id_model_names;
        })
    }

    window.ModelNames = ModelNames;
})(window);