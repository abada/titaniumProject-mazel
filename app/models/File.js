exports.definition = {
    config : {
        adapter : {
            type : 'parse_rest',
            collection_name : 'File',
            endpoint : 'files',
            api_key : Alloy.Globals.PARSE_API_KEY,
            app_id : Alloy.Globals.PARSE_APP_ID,
        }
    },
    extendModel : function(Model) {
        _.extend(Model.prototype, {
            'idAttribute': 'name',

            /**
             *
             */
            upload : function(filename, file, contentType, options) {

                // set sync options
                var opts = {
                    'params': '/' + filename,
                };
                // merge sync options with user options
                _.extend(opts, options);

                // call the save method (results in 'create' method)
                this.save.call(this, {
                    'contentType': contentType,
                    'blob': file,
                }, opts);

                // free up space
                delete this.blob;

            },

            /**
             *
             */
            beforeHTTPClientSend: function (method, client) {

                if (method === 'DELETE') {

                    // set master key
                    client.setRequestHeader('X-Parse-Master-Key', Alloy.Globals.PARSE_MASTER_KEY);

                    // unset API key
                    client.setRequestHeader('X-Parse-REST-API-Key', null);
                }

                // let sync adapter continue
                return false;

            }

        });

        return Model;
    },
    extendCollection : function(Collection) {
        _.extend(Collection.prototype, {
        });

        return Collection;
    }
};