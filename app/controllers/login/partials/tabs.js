var args = arguments[0] || {},
    tabBarArrowLeft = [];

/************
 *** INIT ***
 ************/

// add listener for first postlayout / opened event
$.tabs.addEventListener('postlayout', onOpened);


/***************
 *** PRIVATE ***
 ***************/


/**
 * Show an error message and highlight given input field
 * @param {Ti.UI.TextField} input Input field to highlight
 * @param {String} msg Message to show
 */
function _showErrorMsg(msg) {

    $.messageArea.errorMessage(msg);

}

/*****************
 *** LISTENERS ***
 *****************/

function onOpened () {

    // Alloy.Globals.logDebug('tabs postlayout', $.loginTab.rect);

    $.tabs.removeEventListener('postlayout', onOpened);

    // arrow is horizontally centered by default
    // => move it 25% to the left/right in order to center it over the tab bar buttons
    tabBarArrowLeft.push(
        - Alloy.Globals.deviceDim.width * 0.25,
        Alloy.Globals.deviceDim.width * 0.25
    );


    // set background
    // var bg = require('util').getBackgroundImage('bg_signup.jpg', $.loginTab.rect);
    // $.loginTab.setBackgroundImage(bg);
    // $.signupTab.setBackgroundImage(bg);
    // bg = null;

    onShowLoginTab();
    
    /*
    onShowSignupTab();
    $.signup.getView('signupUsername').setValue(require('util').randomString(6));
    $.signup.getView('signupMail').setValue($.signup.getView('signupUsername').getValue() + '@mazelapp.com');
    $.signup.getView('signupStart').fireEvent('click');
    */
}

function onShowLoginTab () {
    // show/hide tabs
    $.loginTab.show();
    $.signupTab.hide();

    // (de-)activate buttons
    $.addClass($.tabBarLoginButton,'tabBarButtonActive');
    $.resetClass($.tabBarSignupButton,'tabBarButton mLR');

    // move arrow
    $.tabBarArrowWrapper.animate(Ti.UI.createAnimation({
        transform: Ti.UI.create2DMatrix().translate(tabBarArrowLeft[0],0),
        duration: 100,
    }));


}


function onShowSignupTab () {
    // show/hide tabs
    $.signupTab.show();
    $.loginTab.hide();

    // (de-)activate buttons
    $.addClass($.tabBarSignupButton,'tabBarButtonActive');
    $.resetClass($.tabBarLoginButton,'tabBarButton mLR');


    // move arrow
    $.tabBarArrowWrapper.animate(Ti.UI.createAnimation({
        transform: Ti.UI.create2DMatrix().translate(tabBarArrowLeft[1],0),
        duration: 100,
    }));
}

function onMessage (msg) {

    // Alloy.Globals.logDebug('onMessage',msg);

    switch (msg.type) {
        case 'clear':
            // hide error messages and clear inputs
            $.messageArea.clear();
            $.messageArea.hide(false);
        break;
        case 'error':
            _showErrorMsg(msg.message);
        break;
        case 'success':
            $.messageArea.successMessage(msg.message);
        break;
        case 'activity':
            if (msg.show) {
                if (msg.message) {
                    $.activityIndicator.show(msg.message);
                } else {
                    $.activityIndicator.show(L('loading'));
                }
            } else {
                $.activityIndicator.hide();
            }
        break;
        case 'signupFB':
            $.signup.getView('signupStart').fireEvent('click',{
                fbSignup: true,
                noValidate: true,
            });
        break;
        case 'signup':
            $.signup.getView('signupStart').fireEvent('click',{
                noValidate: true,
            });
        break;
    }

}