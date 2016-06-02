exports.baseController = "mazelController";

var args = arguments[0] || {};

/************
 *** INIT ***
 ************/

if (OS_IOS) {
	var Utils = require('util');
	Ti.API.info(Utils.count);
	Utils.iosKeyboardNavigation([$.signupUsername.getView("content").children[0], $.signupMail.getView("content").children[0]], Titanium.UI.RETURNKEY_NEXT);
}
    
/***************
 *** PRIVATE ***
 ***************/

/**
 *
 */
function _showErrorMsg(msg) {
    $.trigger('message', {
        type : 'error',
        error : {
            //input : input,
        },
        message : msg,
    });
}

/*****************
 *** LISTENERS ***
 *****************/

function onStartSignupFacebook() {

    var authData;

    // show loading animation
    $.trigger('message', {
        type : 'activity',
        show : true,
        message : L('facebook_login_loading'),
    });

    // clear OAuth data
    Alloy.Globals.Facebook.logout();
    delete Alloy.Globals.Facebook;
    Alloy.Globals.Facebook = require('facebook');

    Alloy.Globals.Facebook.permissions = ['public_profile', 'email'];
    Alloy.Globals.Facebook.addEventListener('login', onFacebookLogin);

    // do not even look for a cached session as initialize() would do
    // force new authorization
    Alloy.Globals.Facebook.initialize(Alloy.Globals.FacebookTimeout);
    Alloy.Globals.Facebook.authorize();

}

function onStartSignup(e) {
    
    var un = $.signupUsername.getValue() || '',
        em = $.signupMail.getValue() || '';

    // hide error messages and clear inputs
    $.trigger('message', {
        type : 'clear'
    });

    // validate inputs (only if not facebook signup)
    if (un.trim() === '' && e.noValidate !== true) {
        $.signupUsername.error();
        _showErrorMsg(L('error_not_empty'));
        return;
    }

    if (em.trim() === '' && e.noValidate !== true) { 
        $.signupMail.error();
        _showErrorMsg(L('error_not_empty'));
        return;
    }

    // clear OAuth data if not facebook signup to prevent pre-fill from wrong user
    if (e.fbSignup !== true) {
        Alloy.Globals.Facebook.logout();
        delete Alloy.Globals.Facebook;
        Alloy.Globals.Facebook = require('facebook');
    }

    // show loading animation
    $.trigger('message', {
        type : 'activity',
        show : true
    });

    // open signup
    var signup = Alloy.createController('signup/profile', {
        username : un,
        email : em,
        loginWin: OS_ANDROID ? $.getParentWindow() : null,
    }).getView();

    // listen on close event
    signup.addEventListener('close', function() {
        // Alloy.Globals.logDebug('login -> close signup');
        $.trigger('message', {
            type : 'activity',
            show : false
        });
    });

    if (OS_ANDROID) {
        signup.open();
    } else {
        Alloy.Globals.navWin.openWindow(signup, {
            animated : false,
        });
    }

}

function onFacebookLogin (e) {

    Alloy.Globals.Facebook.removeEventListener('login', onFacebookLogin);


        if (e.success) {
            // Alloy.Globals.logDebug('login from uid: ' + e.uid + ', name: ' + JSON.parse(e.data).name);

            authData = {
                'facebook' : {
                    'id' : e.uid,
                    'access_token' : e.source.accessToken,
                    'expiration_date' : e.source.expirationDate,
                }
            };

            // log in with authData
            var user = Alloy.Models.instance('User');
            user.save({
                'authData' : authData
            }, {
                error : function(a, b, c) {
                    Alloy.Globals.logError('facebook login error', a, b, c);
                    _showErrorMsg(L('error_unknown'));
                },
                success : function(user, response) {
                    Alloy.Globals.logDebug('***success***', user);

                    // start signup
                    onStartSignup({
                        fbSignup: true,//force FB reset
                        noValidate: true,//prevent email check
                    });

                },
            });

        } else if (e.cancelled) {
            // user cancelled
            Alloy.Globals.logInfo('facebook login cancelled');
        } else {
            Alloy.Globals.logError(e.error);
            _showErrorMsg(e.error);
        }
}
