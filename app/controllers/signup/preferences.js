
/************
 *** INIT ***
 ************/

$.preferences.addEventListener ('postlayout', onOpened);

/***************
 *** PRIVATE ***
 ***************/


/*****************
 *** LISTENERS ***
 *****************/

function onOpened () {
    
    $.preferences.removeEventListener ('postlayout', onOpened);

    // var bg = require('util').getBackgroundImage('bg_signup.jpg', $.flirtPreferencesPart.getView('scrollView').rect);
    // $.flirtPreferencesPart.getView('scrollView').setBackgroundImage(bg);
    // bg = null;
    
}


/**
 * Handle cancel/back event. Show a dialog confirming if user wants to stay here or really cancel the preference setup
 * @param {Event} e
 */
function onBeforeClose (e) {

    var dialog = Ti.UI.createAlertDialog({
        cancel: 0,
        buttonNames: [L('btn_cancel'), L('btn_ok')],
        message: L('signup_cancel_preferences_confirm'),
        title: L('btn_cancel')
    });

    dialog.addEventListener('click',function (e) {
        if (e.index === e.source.cancel) {
            Ti.API.info('The cancel button was clicked');
        } else {

            // go to main screen
            var main = Alloy.createController('main').getView();
            main.open();

            $.preferences.close();
        }
    });

    dialog.show();

    return false;
}

function onSuccess () {

    // go to main screen
    var main = Alloy.createController('main').getView();
    main.open();

    $.preferences.close();

}

function onSavePreferences () {

    $.flirtPreferencesPart.getView('saveButton').fireEvent('click');

}
