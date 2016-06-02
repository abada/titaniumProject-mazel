exports.baseController = "mazelController";

var _timeoutId, //timeout identifier for facebook login
    _user = Alloy.Models.instance('User');

/************
 *** INIT ***
 ************/

// add listener for first postlayout / opened event
$.loginTab.addEventListener('postlayout', onOpened);

/***************
 *** PRIVATE ***
 ***************/
function _showErrorMsg(msg) {
    // Alloy.Globals.logDebug('_showErrorMsg', msg);
    $.trigger('message', {
        type : 'error',
        error : {
            // input : null,
        },
        message : msg,
    });
}

function _clearUser() {

    // make sure we're working on a clean user model (e.g. after cancelled signup or logout)
    // clear silently to avoid validation
    Alloy.Globals.logInfo('login: clearing user');
    _user.clear({
        silent : true
    });

}

function _gotoMain () {

    // save session token in app properties
    _user.saveSessionToken();

    // open main view
    var main = Alloy.createController('main').getView(),
        win = OS_ANDROID ? $.getParentWindow() : Alloy.Globals.navWin;

    main.open();

    // hide loading animation
    $.trigger('message', {
        type : 'activity',
        show : true
    });

    // close window
    win.close();
}


/*****************
 *** LISTENERS ***
 *****************/

function onOpened() {

    $.loginTab.removeEventListener('postlayout', onOpened);
    
    if (OS_IOS) {
    	require('util').iosKeyboardNavigation([$.loginUsername.getView("content").children[0], $.loginPassword.getView("content").children[0]], Titanium.UI.RETURNKEY_NEXT);
    }

    // $.loginUsername.setValue('simne7');
    // $.loginPassword.setValue('asdf');

}

function onLogin(e) {

    Alloy.Globals.logDebug('onLogin');

    var un = $.loginUsername.getValue() || '',
        pw = $.loginPassword.getValue() || '';

    // hide error messages and clear inputs
    $.trigger('message', {
        type : 'clear'
    });

    // validate inputs
    if (un.trim() === '') {
        $.loginUsername.error();
        _showErrorMsg(L('error_not_empty'));
        return;
    }

    if (pw.trim() === '') {
        $.loginPassword.error();
        _showErrorMsg(L('error_not_empty'));
        return;
    }

    // show loading animation
    $.trigger('message', {
        type : 'activity',
        show : true
    });

    // make sure we have a clean user object
    _clearUser();

    // login user
    _user.login(un, pw, {
        error : function(model, err, options) {
            Alloy.Globals.logDebug('login error', model, err, _user);

            // hide loading animation
            $.trigger('message', {
                type : 'activity',
                show : false
            });

            // highlight erroneous input field
            switch(err.code) {

            case 101:
                // invalid login parameters

                var userDummy = Alloy.createModel('User');
			    userDummy.fetch({
			        params : {
			            where : {
			                username : un,
			            }
			        },
			        success : function(model, response, options) {
			            // Alloy.Globals.logDebug('fetch success model', response.results.length, response.results[0]);
			            // Alloy.Globals.logDebug('fetch success response', response);
			            // Alloy.Globals.logDebug('fetch success options', options);

			            if (response && response.results && response.results.length > 0) {
			            	// found user => wrong credentials
                			_showErrorMsg(L('parse_error_101'));
			            } else {
			            	// no user with given username found
			            	Alloy.Globals.logDebug('no user with given username found');

		                    Alloy.createWidget('com.mazel.messageArea').flashMessage(L('signup_username_not_found'), 'notice', 5000);

		                    // force same behaviour as if user clicked on "sign up"
		                    $.trigger('message', {
		                        type : 'signup',
		                    });
			            }

			        },
			        error : function(model, err) {
                		_showErrorMsg(err.error);
			        },
			    });

                break;
            default:
                _showErrorMsg(err.error);
            }

        },
        success : function(user) {
            Alloy.Globals.logDebug('login success', user.id);

            /*
             * cache user pic and go on to main controller
             */

            var Utils = require('util'),
                cachedUserPic = Utils.readCachedImage(user.get('pic').name);

            if (cachedUserPic) {

                // found cached version => skip
                Alloy.Globals.logInfo('found cached user pic');
                _gotoMain();

            } else {

                Alloy.Globals.logInfo('loading user pic');

                Utils.cacheRemoteImage({
                    url: user.get('pic').url,
                    filename: user.get('pic').name,
                    success: function () {
                        Alloy.Globals.logInfo('caching user pic successful');
                        _gotoMain();
                    },
                    error: function (e) {
                        Alloy.Globals.logWarn('caching user pic failed, ' + e.error);
                        _gotoMain();
                    },
                });

            }

        }
    });
}

function onLoginFacebook() {

    var authData;

    Alloy.Globals.Facebook.permissions = ['public_profile', 'email'];
    Alloy.Globals.Facebook.addEventListener('login', onFacebookCallback);

	Alloy.Globals.logDebug('onLoginFacebook', new Date().toGMTString());

    // show loading animation
    $.trigger('message', {
        type : 'activity',
        show : true,
        message : L('facebook_login_loading'),
    });

    // initialize facebook auth
    Alloy.Globals.Facebook.initialize(Alloy.Globals.FacebookTimeout);

    // start timeout
    _timeoutId = setTimeout(function() {

        // no cached session, new login needed
        Alloy.Globals.Facebook.authorize();

        // hide activity indicator shortly after opening facebook login as we don't receive a login event if user closes browser
        if (OS_IOS) {
        	setTimeout(function(){
			    $.trigger('message', {
			        type : 'activity',
			        show : false,
			    });
        	}, 1000);
        }

    }, Alloy.Globals.FacebookTimeout + 500);

}

function onForgotPassword() {
    // password reset
    // Alloy.Globals.notyet();

    $.resetEmail.blur();

    $.emailDialog.setOnClickListener(function(e) {

        if (e.cancel) {
            return;
        }

        var email = $.resetEmail.getValue(),
            dummy = Alloy.createModel('User');

        // clear error messages
        $.resetEmail.blur();
        $.resetMessageArea.clear();
        $.resetMessageArea.hide(false);

        // handle invalid field events
        dummy.on('mazel:invalidField', function(e) {

            // $.activityIndicator.hide();

            // log error message
            Alloy.Globals.logError('user invalid: ' + e.error);

            if (e.key === 'email') {
                $.resetMessageArea.errorMessage(L('parse_error_125'));
            }

        });

        // set user data
        dummy.set({
            'email' : email,
        });

        if (dummy.get('email') !== undefined) {

            // show message in loginTab! (dialog will close)
            $.trigger('message', {
                type : 'activity',
                message : 'resetting password',
            });

            dummy.requestPasswordReset({

                error : function(model, err, options) {
                    Alloy.Globals.logError('requestPasswordReset error: ' + err.error);

                    // hide loading animation
                    $.trigger('message', {
                        type : 'activity',
                        show: false,
                    });

                    // show error message
                    _showErrorMsg(err.error);

                },
                success : function(model, response) {
                    //Alloy.Globals.logDebug('logout success', model, response);

                    // hide loading animation
                    $.trigger('message', {
                        type : 'activity',
                        show: false,
                    });

                    // show message in loginTab!
                    $.trigger('message', {
                        type : 'success',
                        message : L('reset_email_success'),
                    });


                }
            });
        } else {// mail invalid

            $.resetEmail.error();

            dummy = null;

            return false;
        }

    });

    $.emailDialog.open();

}

function onFacebookCallback(e) {
    Alloy.Globals.logDebug('login cb', e);

    // resume loading animation which was potentially cancelled after timeout
    $.trigger('message', {
        type : 'activity',
        show : true,
        message : L('facebook_login_loading'),
    });

    /*
    e = {
    "type" : "login",
    "source" : {
    "canPresentOpenGraphActionDialog" : false,
    "invocationAPIs" : [{
    "namespace" : "Facebook",
    "api" : "createActivityWorker"
    }, {
    "namespace" : "Facebook",
    "api" : "createLikeButton"
    }, {
    "namespace" : "Facebook",
    "api" : "createLoginButton"
    }],
    "expirationDate" : "2015-11-03T15:42:38.476Z",
    "loggedIn" : true,
    "apiName" : "Ti.Module",
    "accessToken" : "CAAGMOx4jGnIBAJUGGtaUxQcnmT4sPZCgsIletsiIxfpOIlbprRZBH9oH9uoDyZCNJDKLrHk3zj9lshYa1DgB8C3T0u2KNtKzXSDNWkIu8gEzUjOCayk7vG4Ap2ggQjvTs6SCb9ZCRh7ManxiyZCoz3ZBc03XuKr4Nk70PrsL2FR09fR4O3tzne09ALOyCOcVjfLaQo3GJkMwZDZD",
    "__propertiesDefined__" : true,
    "bubbleParent" : true,
    "_events" : {
    "login" : {}
    },
    "canPresentShareDialog" : false,
    "uid" : "1052831924734995",
    "permissions" : ["email", "contact_email", "public_profile"]
    },
    "data" : "{\"id\":\"1052831924734995\",\"name\":\"Simon Mang\"}",
    "uid" : "1052831924734995",
    "cancelled" : false,
    "bubbles" : false,
    "success" : true,
    "code" : 0,
    "cancelBubble" : false
    };*/

    // remove login listener (else it may be called twice or unexpectedly)
    Alloy.Globals.Facebook.removeEventListener('login', onFacebookCallback);

    // clear timeout
    clearTimeout(_timeoutId);

    if (e.success) {
        Alloy.Globals.logDebug('login from uid: ' + e.uid + ', name: ' + JSON.parse(e.data).name);

        authData = {
            'facebook' : {
                'id' : e.uid,
                'access_token' : e.source.accessToken,
                'expiration_date' : e.source.expirationDate,
            }
        };

        // make sure we have a clean user object
        _clearUser();

        // save user (triggers login/signup action via parse)
        _user.save({
            'authData' : authData
        }, {
            error : function(model, response, options) {
                Alloy.Globals.logError('facebook login error: ' + response.error);

			    // hide loading animation
			    $.trigger('message', {
			        type : 'activity',
			        show : false,
			    });

                _showErrorMsg(L('error_unknown'));
            },
            success : function(u, response) {
                // Alloy.Globals.logDebug('***success***', u);
                // Alloy.Globals.logDebug('***success***', _user);
                // Alloy.Globals.logDebug('resp', response);

                // response already has authData => found linked user
                if (response.authData) {

                    // 200? => logged in
                    Alloy.Globals.logDebug('logged in');

                    // show loading animation
                    $.trigger('message', {
                        type : 'activity',
                        show : true,
                        message : L('facebook_authentication_success'),
                    });

                    /*
                     * cache user pic and go on to main controller
                     */
                    var Utils = require('util'),
                        cachedUserPic = Utils.readCachedImage(_user.get('pic').name);

                    if (cachedUserPic) {

                        // found cached version => skip
                        Alloy.Globals.logInfo('found cached user pic');
                        _gotoMain();

                    } else {

                        Alloy.Globals.logInfo('loading user pic');

                        Utils.cacheRemoteImage({
                            url: _user.get('pic').url,
                            filename: _user.get('pic').name,
                            success: function () {
                                Alloy.Globals.logInfo('caching user pic successful');
                                _gotoMain();
                            },
                            error: function (e) {
                                Alloy.Globals.logWarn('caching user pic failed, ' + e.error);
                                _gotoMain();
                            },
                        });

                    }

                } else {// no authData yet in Parse-DB => no linked user found

                    // 201? => no linked user found, sign up with given user id
                    Alloy.Globals.logDebug('no linked user found');

                    Alloy.createWidget('com.mazel.messageArea').flashMessage(L('facebook_no_linked_user_found'), 'notice');

                    // force same behaviour as if user clicked on "sign up with facebook"
                    $.trigger('message', {
                        type : 'signupFB',
                    });

                }

            },
        });

    } else if (e.cancelled) {
        // user cancelled
        Alloy.Globals.logInfo('facebook login cancelled');

	    // hide loading animation
	    $.trigger('message', {
	        type : 'activity',
	        show : false,
	    });

    } else {
        Alloy.Globals.logError(e.error);

	    // hide loading animation
	    $.trigger('message', {
	        type : 'activity',
	        show : false,
	    });

        _showErrorMsg(e.error);
    }
}