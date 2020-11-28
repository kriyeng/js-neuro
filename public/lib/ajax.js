( function(window) {

    'use strict';
    var Ajax = {
        get : get,
        post : post
    };

    function get(url, data, header, callback) {

        if(typeof header === 'function'){
            callback = header;
            header = null;
        }

        if(typeof data === 'function'){
            callback = data;
            data = null;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + (data ? '?' + dataToUrl(data) : ''));
        xhr.onload = function () {
            // Status 200  or Android status 0 but with responseText
            if ( (xhr.status === 200 || (xhr.responseURL.indexOf('file:///storage/') > -1 && xhr.status === 0 && xhr.responseText)) && xhr.readyState ===  4) {
                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch(e){
                    response = '' + xhr.responseText;
                }
                callback(null, response);
            }
            else {
                callback(new Error('Request failed.  Returned status of ' + xhr.status));
            }
        };
        xhr.onerror = function (e) {
            if(callback){
                callback(new Error(xhr.statusText));
                callback = null;
            }
        };

        xhr.ontimeout = function (e) {
            if(callback){
                callback(new Error("Connection Timeout"));
                callback = null;
            }
        };

        try {
            xhr.send(null);
        } catch(e){
            if(callback){
                callback(new Error("Error connecting Server"));
                callback = null;
            }
        }
    }

    function post(url, data, callback) {

        if(typeof data === 'function'){
            callback = data;
            data = null;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            // Status 200  or Android status 0 but with responseText
            if ( (xhr.status === 200 || (xhr.responseURL.indexOf('file:///storage/') > -1 && xhr.status === 0 && xhr.responseText)) && xhr.readyState ===  4  ) {
                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch(e){
                    response = '' + xhr.responseText;
                }
                callback(null, response);
            }
            else {
                if(xhr.status !== 200) callback(new Error('Request failed.  Returned status of ' + xhr.status));
            }
        };
        xhr.onerror = function (e) {
            callback(new Error(xhr.statusText));
        };

        xhr.send(data);
    }

    function dataToUrl(object) {
        var encodedString = '';
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (encodedString.length > 0) {
                    encodedString += '&';
                }
                encodedString += encodeURI(prop + '=' + object[prop]);
            }
        }
        return encodedString;
    }

    window.Ajax = Ajax;

})(window);