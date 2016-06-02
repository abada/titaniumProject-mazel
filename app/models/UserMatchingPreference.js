exports.definition = {
	config: {
		adapter: {
			type: 'parse_rest',
			endpoint: 'classes/UserMatchingPreference',
			collection_name: 'UserMatchingPreference',
			api_key: Alloy.Globals.PARSE_API_KEY,
			app_id: Alloy.Globals.PARSE_APP_ID,
		}
	},
    extendModel: function(Model) {
        _.extend(Model.prototype, {

            'idAttribute': 'objectId',

            /**
             * Validate the member fields. Called by isValid()
             * @return {String} Error message
             */
            validate: function (attrs) {
    	        //TODO validate UserMatchingPreference (range, gender, age [from <= to - step])
            },


        });

        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {

        });

        return Collection;
    }
};