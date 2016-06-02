
/************
 *** INIT ***
 ************/

$.flirtPreferencesPart.getView('activityIndicator').show();
$.flirtPreferences.addEventListener('postlayout', onOpened);

/***************
 *** PRIVATE ***
 ***************/

/*****************
 *** LISTENERS ***
 *****************/

function onSuccess() {

    // $.flirtPreferences.close();
    Alloy.Globals.logDebug('onSuccess');
    $.flirtPreferencesPart.getView('messageArea').successMessage(L('preferences_update_successful'), true);

}

function onCloseWindow() {

    $.flirtPreferences.close();

}

function onSavePreferences() {

    $.flirtPreferencesPart.getView('saveButton').fireEvent('click');

}

function onOpened() {

    $.flirtPreferences.removeEventListener('postlayout', onOpened);
    

    // query user flirt preferences
    var userMatchingPreference = Alloy.createModel('UserMatchingPreference');
    userMatchingPreference.fetch({
        params : {
            where : {
                user : {
                    __type : "Pointer",
                    className : "_User",
                    objectId :  Alloy.Models.instance('User').id,
                }
            }
        },
        success : function(model, response, options) {
            // Alloy.Globals.logDebug('fetch success model', response.results.length, response.results[0]);
            // Alloy.Globals.logDebug('fetch success response', response);
            // Alloy.Globals.logDebug('fetch success options', options);

            $.flirtPreferencesPart.getView('activityIndicator').hide();

            if (response.results.length > 0) {

                var flirtPreferences = response.results[0];
                delete flirtPreferences.where;

                var inst = Alloy.Models.instance('UserMatchingPreference');
                inst.set(flirtPreferences);

                if (flirtPreferences.gender) {
                    $.flirtPreferencesPart.getView('gender').setValue(flirtPreferences.gender);
                }

                if (flirtPreferences.ageFrom && flirtPreferences.ageTo) {
                    $.flirtPreferencesPart.getView('ageRange').setValue({
                        from: flirtPreferences.ageFrom,
                        to: flirtPreferences.ageTo,
                    });
        
    				// $.flirtPreferencesPart.getView('ageRange').open();
                }

                if (flirtPreferences.distance) {
                    $.flirtPreferencesPart.getView('distance').setValue(flirtPreferences.distance);
                }


            }

        },
        error : function(model, err) {
            Alloy.Globals.logError('fetch preferences error: ' + err.error);

            $.flirtPreferencesPart.getView('messageArea').errorMessage(err.error);
            $.flirtPreferencesPart.getView('activityIndicator').hide();

        },
    });

    
    var bg = require('util').getBackgroundImage('bg_signup.jpg', $.flirtPreferencesPart.getView('scrollView').rect);
    $.flirtPreferencesPart.getView('scrollView').setBackgroundImage(bg);
    bg = null;
        
}