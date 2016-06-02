

/************
 *** INIT ***
 ************/

Ti.App.Properties.setBool('isMatch', true);

$.index.addEventListener('postlayout', onOpened);

// open loading splash
if (OS_ANDROID) {
    $.index.open({
        activityEnterAnimation : Ti.Android.R.anim.fade_in,
        activityExitAnimation : Ti.Android.R.anim.fade_out
    });
} else {
    $.index.open();
}

/***************
 *** PRIVATE ***
 ***************/


function _autoLogin() {

    // check if user is already logged in
    var user = Alloy.Models.instance('User');
    if (user.hasSessionToken()) {

        Alloy.Globals.logInfo('retrieving current user');
        // get user object
        user.loadMe({
            error : function(model, err, options) {
                Alloy.Globals.logError('loadMe error: ' + err.error);
                // TODO show error!?

                if (err.code === 209) {//invalid session token
                    user.saveSessionToken(null);
                }

                // open login view
                _gotoLogin();

            },
            success : function(user) {

                // Alloy.Globals.logDebug('user', user.get('pic'));

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

    } else {

        // open login view
        _gotoLogin();

    }

}

function _gotoLogin() {
    Alloy.Globals.logInfo('open login view');

    var timeout = 5000 - (_.now() - Alloy.Globals.startTime);
    Alloy.Globals.logDebug('timeout', timeout);
    setTimeout(function () {
	    var login = Alloy.createController('login/login').getView();
	    login.open();

	    // stop heartbeat animation
		$.hb.stop();

	    // close index view
	    $.index.close();
    }, 10000 - (_.now() - Alloy.Globals.startTime));

    setTimeout(function () {
    	$.hb.updateMessage(L("splash_loading_message_1"));
    }, timeout / 2);

}

function _gotoMain() {
    Alloy.Globals.logInfo('open main view');

    var timeout = 5000 - (_.now() - Alloy.Globals.startTime);
    Alloy.Globals.logDebug('timeout', timeout);
    setTimeout(function () {

	    var main = Alloy.createController('main').getView();
	    // stop heartbeat animation
	    main.addEventListener("open", _stopHeartbeat);
	    main.open();


	    // close index view
	    $.index.close();
    }, timeout);

}

function _stopHeartbeat() {
	$.hb.stop();
}

/*****************
 *** LISTENERS ***
 *****************/

function onOpened() {

    $.index.removeEventListener('postlayout', onOpened);

	// start heartbeat animation
	$.hb.start();

    // make this function available globally
    Alloy.Globals.createStyle = $.createStyle;

    // TODO initiate global vars
    var Utils = require('util');
	Ti.API.info(Utils.count);
	Alloy.Globals.PARSE_API_KEY = Utils.xorEncode(Utils.chars2String(Alloy.Globals.PARSE_API_KEY_CHARS1.concat([81,80,101,107,62,85,113,44,113,48,93,65,91,98,3,91,67])), Alloy.CFG.PARSE_API_KEY_PASS);
    Alloy.Globals.PARSE_MASTER_KEY = Utils.xorEncode(Utils.chars2String(Alloy.Globals.PARSE_MASTER_KEY_CHARS1.concat([21,77,84,40,28,65,114,85,89,88,85,112,60,106,117,82,71,95])), Alloy.CFG.PARSE_MASTER_KEY_PASS);

    Alloy.Globals.deviceDim = {
        width: Ti.Platform.displayCaps.platformWidth,
        height: Ti.Platform.displayCaps.platformHeight,
        density: Ti.Platform.displayCaps.density,
        densityFactor: (Ti.Platform.osname === "android") ? Ti.Platform.displayCaps.logicalDensityFactor : 1
    };


    /*
    var client = Ti.Network.createHTTPClient({
        onload : function(e) {
            console.log(this.responseText);
        },
        onerror : function(e) {
            console.log('onerror ' + JSON.stringify(e));
        },
        timeout : 50000//30s
    });

    client.open('GET', 'https://api.parse.com/1/login?username=simne7&password=asdf');

    // set authentication information
    client.setRequestHeader('X-Parse-Application-Id', Alloy.Globals.PARSE_APP_ID);
    client.setRequestHeader('X-Parse-REST-API-Key', Alloy.Globals.PARSE_API_KEY);

    client.setRequestHeader('Accept', 'application/json');
    client.setRequestHeader('Content-Type', 'application/json');

    client.send();
    */

    _autoLogin();
    // setTimeout(function() {
    // }, 3000);

}
