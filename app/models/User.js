exports.definition = {
    config : {
        adapter : {
            type : 'parse_rest',
            collection_name : 'User',
            endpoint : 'users',
            api_key : Alloy.Globals.PARSE_API_KEY,
            app_id : Alloy.Globals.PARSE_APP_ID,
        }
    },
    extendModel : function(Model) {
        _.extend(Model.prototype, {
            'idAttribute': 'objectId',
            /**
             * Login the user identified with the given username and the given password
             * @param {String} username User's username
             * @param {String} password User's password
             * @param {Object} options Optional options, like error/success handlers
             */
            login : function(username, password, options) {

                // prevent options from being undefined
                options = options || {};

                // set sync options
                var opts = {
                    endpoint : 'login',
                    params: {
                        'username': username,
                        'password': password,
                    }
                };
                // merge sync options with user options
                _.extend(opts, options);

                // this.set('username', username);

                // call the fetch method (results in 'read' method)
                // Alloy.Globals.logDebug('login else', this, opts);
                this.fetch.call(this, opts);

            },
            /**
             * Load information of current user
             * @param {Object} options Optional options, like error/success handlers
             */
            loadMe: function (options) {

                // prevent options from being undefined
                options = options || {};

                // set sync options
                var opts = {
                    endpoint : 'users/me',
                };
                // merge sync options with user options
                _.extend(opts, options);

                this.set('sessionToken', Ti.App.Properties.getString('sessionToken', null));

                // call the fetch method (results in 'read' method)
                // Alloy.Globals.logDebug('login else', this, opts);
                this.fetch.call(this, opts);

            },
            /**
             * Logout the current user
             * @param {Object} options Optional options, like error/success handlers
             */
            logout : function(options) {

                Alloy.Globals.logDebug('options', options);
                // prevent options from being undefined
                options = options || {};

                // set sync options
                var opts = {
                    endpoint : 'logout',
                };
                // merge sync options with user options
                opts = _.extend(opts, options);

                var token = this.get('sessionToken');
                // clear user, else a PUT request with all user data would be made
                this.clear({silent: true,});
                // delete persistant session token
                this.saveSessionToken(null);

                Alloy.Globals.logDebug('session I', this.get('sessionToken'));

                // call the save method (results in 'create' method)
                this.save.call(this, {
                    sessionToken: token,
                }, opts);

            },

            /**
             * initiate password reset
             */
            requestPasswordReset: function (options) {

                // prevent options from being undefined
                options = options || {};

                // set sync options
                var opts = {
                    endpoint : 'requestPasswordReset',
                };
                // merge sync options with user options
                opts = _.extend(opts, options);

                // call the save method (results in 'create' method)
                this.save.call(this, {}, opts);

            },

            /**
             * Check if session token exits
             * @return {bool} True, if session token is not null
             */
            hasSessionToken : function() {
                return Ti.App.Properties.getString('sessionToken', null) !== null;
            },
            /**
             * Set session token
             * @param {String} Token Optional. The session token to be set. If not set the session token field of the current user is used.
             */
            saveSessionToken : function(token) {
                if (token === undefined) {
                    token = this.get('sessionToken');
                }

                Ti.App.Properties.setString('sessionToken', token);
            },
            /**
             * Validate the member fields. Called by isValid()
             * @return {String} Error message
             */
            validate : function(attrs) {
                for (var key in attrs) {
                    var value = attrs[key],
                        error = null;

                    // trim values by default
                    value = typeof value === 'String' ? value.trim() : value;

                    switch (key) {
                    case 'username':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('parse_error_200');
                        }
                        //IDEA unique
                        break;
                    case 'password':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('parse_error_201');
                        }
                        //IDEA letters, numbers and special chars (?)
                        break;
                    case 'email':
                        // not empty + valid mail address
                        if (value === undefined || value.length === 0 || !(new RegExp('^[^@]+@([^@\.]+\.)+[^@\.]+$').test(value))) {
                            error = L('parse_error_125');
                        }
                        //IDEA unique
                        break;
                    case 'firstName':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('error_not_empty');
                        }
                        break;
                    case 'job':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('error_not_empty');
                        }
                        break;
                    case 'address':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('error_not_empty');
                        }
                        break;
                    case 'gender':
                        // not empty
                        if (value === undefined) {
                            error = L('error_not_empty');
                            break;
                        }

                        // one of male, female, other
                        if (_.indexOf(_.keys(this.getGenderOptions()), value) < 0) {
                            error = String.format(L('error_value_not_expected'),value+'');
                        }
                        break;
                    case 'birthday':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('error_not_empty');
                        }
                        //FIXME (!!!) at least X years old
                        break;
                    case 'avatar':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('error_not_empty');
                        }
                        break;
                    case 'quote':
                        // not empty
                        if (value === undefined || value.length === 0) {
                            error = L('error_not_empty');
                        }
                        break;
                    }

                    if (error !== null) {

                        // trigger custom error
                        this.trigger('mazel:invalidField', {
                            key : key,
                            value : value,
                            error : error
                        });

                        return error;

                    }

                }
            },

            /**
             * Get all available gender options
             */
            getGenderOptions: function () {
                return {
                    'female': L('female'),
                    'male': L('male'),
                    'both': L('both'),
                };
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