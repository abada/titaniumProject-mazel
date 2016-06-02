
// Override the Backbone.sync method with the following
module.exports.sync = function(method, model, options) {

    //Alloy.Globals.logDebug('sync I', method, options, model);
    var payload = model.toJSON(),
        url = getURL(model.config.adapter, method, options),
        error;

    if (options.payload !== undefined) {
        _.extend(payload, options.payload);
    }
    // Alloy.Globals.logDebug('sync II', method, payload, options, options.payload);


    switch(method) {

    // This case is called by the Model.fetch and Collection.fetch methods to retrieve data.
    case 'read':
        // Use the idAttribute property in case the model ID is set to something else besides 'id'
        if (payload[model.idAttribute]) {
            // If we have an ID, fetch only one document
            // http_request('GET', BASE_URL + payload[model.idAttribute], null, callback);
            error = 'ERROR: not implemented yet';
        } else {
            // if not, fetch all documents
            http_request('GET', url, payload, callback, model);
        }
        break;

    // This case is called by the Model.save and Collection.create methods
    // to initialize a model if the IDs are not set.
    case 'create':

        http_request('POST', url, payload, callback, model);

        break;

    // This case is called by the Model.destroy method to delete the model from storage.
    case 'delete':
        if (payload[model.idAttribute]) {
            http_request('DELETE', url + '/' + payload[model.idAttribute], payload, callback, model);
         } else {
            error = 'ERROR: Model does not have an ID!';
         }
        break;

    // This case is called by the Model.save and Collection.create methods
    // to update a model if they have IDs set.
    case 'update':
        if (model.id) {
            http_request('PUT', url + '/' + model.id , payload, callback, model);
        } else {
            error = 'ERROR: Model does not have an ID!';
        }
        break;

    default :
        error = 'ERROR: Sync method not recognized!';
    };

    if (error) {
        Ti.API.error(error);
        options.error(model, error, options);
        model.trigger('error');
    }

    // Simple default callback function for HTTP request operations.
    function callback(error, response) {
        var res;
        if (response) {
            try {
                res = JSON.parse(response);
            } catch (e) {
                Alloy.Globals.logWarn('parsing response failed: ' + e.message + '('+response+')');
                res = {
                    error: response,
                };
            }         
        }
        
        if (error) {
            // Calls the default Backbone error callback
            // and invokes a custom callback if options.error was defined.
            if (res) {
                var err = res.error || error,
                    code = res.code ? ' (' + res.code + ')' : '';

                Ti.API.error('ERROR: ' + err + code);
                options.error(model, res, options);
            } else {
                Ti.API.error('ERROR: ' + error);
                options.error(model, {error: L('error_no_connection')}, options);
            }
            model.trigger('error');
        } else {
            // Calls the default Backbone success callback
            // and invokes a custom callback if options.success was defined.
            if (res && res.key) {
                // Get only the model(s)
                res = res[res.key];
            }
            options.success(res, response, options);
        }
    };
};

// Helper function for creating an HTTP request
function http_request(method, url, payload, callback, model) {
    var client = Ti.Network.createHTTPClient({
        onload : function(e) {
            if (callback) {
                /*
                 var resource = this.getResponseHeader('Location') || null;
                 if (resource) {
                 // Arrow applications do not return a payload response for non-GET methods.
                 // Need to retrieve the model to pass to Backbone APIs
                 resource = resource.slice(resource.lastIndexOf('/') + 1);
                 http_request('GET', BASE_URL + resource, null, callback);
                 } else {
                 */
                callback(null, this.responseText);
                // }
            }
        },
        onerror : function(e) {
            // Alloy.Globals.logDebug('onerror',e, this.responseText, callback);
            if (callback) {
                callback(e.error, this.responseText);
            }
        },
        timeout : 30000//30s
    });

    Alloy.Globals.logDebug('http_request', method, url, JSON.stringify(payload));

    client.open(method, url);

    // set authentication information
    client.setRequestHeader('X-Parse-Application-Id', model.config.adapter.app_id);
    client.setRequestHeader('X-Parse-REST-API-Key', model.config.adapter.api_key);

    // do we have a session token?
    if (payload.sessionToken) {
        client.setRequestHeader('X-Parse-Session-Token', payload.sessionToken);
        delete payload.sessionToken;
    }


    client.setRequestHeader('Accept', 'application/json');
    client.setRequestHeader('Content-Type', 'application/json');

    // provide hook for setting/unsetting headers etc.
    if (typeof model.beforeHTTPClientSend === 'function') {
        // return if method gives true (user decided to send himself)
        if (model.beforeHTTPClientSend(method, client)){
            return;
        }
    }

    // is it a file?
    if (payload.blob) {
        if (payload.contentType) {
            client.setRequestHeader('Content-Type', payload.contentType);
        } else {
            client.setRequestHeader('Content-Type', 'text/plain');
        }

        client.send(payload.blob);

    } else {

        if (method === 'GET') {
            client.send();
        } else {
            client.send(JSON.stringify(payload));
        }

    }



};

function getURL(adapter, method, options) {
    //Alloy.Globals.logDebug('getURL',method, options);
    if (options) {

        // build query string
        if (options.params !== undefined) {
            if ( typeof options.params === 'object') {
                var first = true,
                    s = '';
                for (var i in options.params) {
                    // TODO stringify if params[i] is object

                    if (typeof options.params[i] === 'object') {
                        options.params[i] = JSON.stringify(options.params[i]);
                    }

                    if (first) {
                        s += '?' + i + '=' + options.params[i];
                        first = false;
                    } else {
                        s += '&' + i + '=' + options.params[i];
                    }
                }
                options.params = s;
            }
        } else {
            options.params = '';
        }
        // console.log(options.params);

/*
        // delete classPath for users endpoint
        if (options.endpoint === 'users/') {
            options.classPath = '';
        }

        // check classPath option
        if (options.classPath === undefined) {
            // options.classPath = adapter.collection_name + '/';
            options.classPath = '';
        } else if (options.classPath === '') {
            // don't do anything
            // user obviously does not want to provide an endpoint
        } else {
            // append slash in case the endpoint does not contain one at the end already
            if (options.classPath.substr(-1) !== '/') {
                options.classPath += '/';
            }
        }
*/

        // check endpoint option
        if (options.endpoint === undefined) {
            options.endpoint = adapter.endpoint;
        } else if (options.endpoint === '') {
            // don't do anything
            // user obviously does not want to provide an endpoint
        } else {
            // append slash in case the endpoint does not contain one at the end already
            // if no params are given no slash is needed
            // if (options.endpoint.substr(-1) !== '/' && options.params !== '') {
                // options.endpoint += '/';
            // }
        }

        return 'https://api.parse.com/1/' + options.endpoint + options.params;

    }

    // return 'https://api.parse.com/1/' + (adapter.endpoint || 'classes') + '/' + (adapter.collection_name || 'TestObject') + '/';
    return 'https://api.parse.com/1/' + (adapter.endpoint || 'classes/TestObject') ;

}