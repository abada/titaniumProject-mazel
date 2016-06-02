var Utils = require('util'),
    Map = require('ti.map'),
    _tiles = {
        // account details
        'username' : null,
        'email' : null,
        'password' : null,
        // profile details
        'pic': null,
        'avatar' : null,
        'quote' : null,
        'firstName' : null,
        'job' : null,
        'gender' : null,
        'birthday' : null,
        'location' : null,
    },
    _alreadyUploadedUserPic = null,
    args = arguments[0] || {};

/************
 *** INIT ***
 ************/

// add listener for first postlayout / opened event
$.profile.addEventListener('postlayout', onOpened);

// TODO parallax background

/*
 * include user account section (via xml => height of scrollview to large)
 */
_account = Alloy.createController('profile/partials/account');
$.accountHook.add(_account.getView());

_tiles['username'] = _account.getView('username');
_tiles['email'] = _account.getView('email');
_tiles['password'] = _account.getView('password');

// pre-fill data
_tiles['username'].setValue(args.username || '');
_tiles['email'].setValue(args.email || '');


/*
 * include user profile section
 */
_profile = Alloy.createController('profile/partials/profile');
$.profileHook.add(_profile.getView());

_tiles['pic'] = _profile.getView('pic');
_tiles['avatar'] = _profile.getView('avatar');
_tiles['quote'] = _profile.getView('quote');
_tiles['firstName'] = _profile.getView('firstName');
_tiles['job'] = _profile.getView('job');
_tiles['gender'] = _profile.getView('gender');
_tiles['birthday'] = _profile.getView('birthday');
_tiles['location'] = _profile.getView('location');

// set gender options
_tiles['gender'].setOptions(_.omit(Alloy.Models.instance('User').getGenderOptions(), 'both'));

// set default date (25 years from now), but do not update the input text
var today = new Date(),
	d = new Date(String.format(
        	"%d-%s%d-%s%dT00:00:00Z", 
        	today.getFullYear(), 
        	today.getMonth() + 1 < 10 ? '0' : '', 
        	today.getMonth() + 1, 
        	today.getDate() < 10 ? '0' : '', 
        	today.getDate()));
    
_tiles['birthday'].setValue(d, false);

// if logged in via facebook (facebook signup)
// => pre-fill fields

if (Alloy.Globals.Facebook.loggedIn) {
    Alloy.Globals.Facebook.requestWithGraphPath('me', {
        fields : 'age_range,name,email,first_name,last_name,gender'
    }, 'GET', function(e) {
        // "{\"id\":\"1052831924734995\",\"last_name\":\"Mang\",\"gender\":\"male\",\"first_name\":\"Simon\",\"email\":\"simon.mang@gmx.de\",\"age_range\":{\"min\":21},\"name\":\"Simon Mang\"}"

        if (e.success) {
            var data = JSON.parse(e.result);
            // _tiles['username'].setValue(data.first_name);
            _tiles['firstName'].setValue(data.first_name);
            _tiles['email'].setValue(data.email);
            _tiles['gender'].setValue(data.gender);

        } else if (e.error) {
            Alloy.Globals.logError(e.error);
            _handleErrorMsg(null, e.error);
        } else {
            Alloy.Globals.logDebug('Unknown response');
        }
    });
}

if (OS_IOS) {
	require('util').iosKeyboardNavigation([
		_tiles["username"].getView("content").children[0], 
		_tiles["email"].getView("content").children[0],
		_tiles["password"].getView("content").children[0],
		_tiles["quote"].getView("content").children[0],
		_tiles["firstName"].getView("content").children[0],
		_tiles["job"].getView("content").children[0],
		_tiles["gender"].getView("content").children[0].children[0]//there is awrapper around text
	], Titanium.UI.RETURNKEY_NEXT);
}

/***************
 *** PRIVATE ***
 ***************/

/**
 *
 */
function _handleErrorMsg(key, msg) {

    var pos,
        input = _tiles[key + ''];
    msg = (msg !== undefined) ? msg : L('unknown_error');

    // show message
    _showErrorMsg(input, msg);

}

/**
 * Show an error message and highlight given tile
 * @param {com.mazel.tile} tile Tile widget
 * @param {String} msg Message to show
 */
function _showErrorMsg(tile, msg) {

    $.messageArea.errorMessage(msg);

    if (tile) {
        tile.error();
    }

    // scroll to message
    // TODO: scroll exactly to top of input field
    // pos = input.convertPointToView({
    // x : 0,
    // y : 0
    // }, $.scrollView);
    // $.scrollView.scrollTo(0, pos.y);

}


function _saveUser (user) {
    
    $.activityIndicator.show(L('profile_creating_account'));
    
    // saving triggers sync (POST)
    user.save({}, {
        error : function(model, err, options) {
            Alloy.Globals.logDebug('profile error', model, err, options);

            // hide activity indicator
            $.activityIndicator.hide();

            // highlight erroneous input field
            switch(err.code) {

            case 200:
                // missing username, should not occur
                _showErrorMsg(_tiles['username'], L('parse_error_200'));
                break;
            case 201:
                // missing password, should not occur
                _showErrorMsg(_tiles['password'], L('parse_error_201'));
                break;
            case 202:
                // username already taken
                _showErrorMsg(_tiles['username'], String.format(L('parse_error_202'), _tiles['username'].getValue()));
                break;
            case 203:
                // email already taken
                _showErrorMsg(_tiles['email'], String.format(L('parse_error_203'), _tiles['email'].getValue()));
                break;
            default:
                _showErrorMsg(null, err.error);

            }

        },
        success : function(model, response) {
            Alloy.Globals.logDebug('profile success', model, response);

            // remove listener
            user.off('mazel:invalidField');

            // save session token
            user.saveSessionToken();

            // go to matching preferences
            var prefs = Alloy.createController('signup/preferences').getView();

            if (OS_ANDROID) {
                prefs.open();
            } else {
                Alloy.Globals.navWin.openWindow(prefs, {
                    animated : false,
                });
            }

            // do not call onClose listener who would destroy user
            $.profile.removeEventListener('close', onClose);
            $.profile.close();

            // close login window as well (is null on iOS)
            if (args.loginWin) {
                args.loginWin.close();
            }

        }
    });
    
}

/*****************
 *** LISTENERS ***
 *****************/

function onSaveProfile() {

    // show activity indicator
    $.activityIndicator.show();

    // hide error messages and clear inputs
    $.messageArea.clear();
    $.messageArea.hide(false);

    // auto hide keyboard
    // if (OS_ANDROID) {
    // Ti.UI.Android.hideSoftKeyboard();
    // } else if (OS_IOS) {
    // //TODO test
    // }

    _.each(_tiles, function(tile, key) {
        Alloy.Globals.logDebug('tile', key);
        tile.blur();
    });

    // we want birthday to be at midnight
    // Alloy.Globals.logDebug('birthday',_tiles['birthday'].getValue());
    var birthday = new Date(_tiles['birthday'].getValue()),
        birthdayISO = String.format(
        	"%d-%s%d-%s%dT00:00:00Z", 
        	birthday.getFullYear(), 
        	birthday.getMonth() + 1 < 10 ? '0' : '', 
        	birthday.getMonth() + 1, 
        	birthday.getDate() < 10 ? '0' : '', 
        	birthday.getDate());

    // get user instance (may have been already instantiated by facebook login procedure)
    var user = Alloy.Models.instance('User');
    Alloy.Globals.logDebug('user', user);
    

    // set user data
    user.set({
        username : _tiles['username'].getValue(),
        password : _tiles['password'].getValue(),
        email : _tiles['email'].getValue(),
        firstName : _tiles['firstName'].getValue(),
        lastName : null,
        job : _tiles['job'].getValue(),
        address : _tiles['location'].getValue().address,
        coords : {
            '__type' : 'GeoPoint',
            'latitude' : _tiles['location'].getValue().latitude,
            'longitude' : _tiles['location'].getValue().longitude,
        },
        gender : _tiles['gender'].getValue(),
        birthday : {
            '__type' : 'Date',
            'iso' : birthdayISO,
        },
        quote : _tiles['quote'].getValue(),
        avatar : _tiles['avatar'].getValue(),
    }, {
        silent : true,// do not validate immediately, else we had to check if set() returns false, easier to validate manually by calling isValid()
    });

    // handle invalid field events
    user.on('mazel:invalidField', function(e) {

        $.activityIndicator.hide();

        // log error message
        Alloy.Globals.logError('user invalid: ' + e.error);

        // highlight erroneous input field
        _handleErrorMsg(e.key, e.error);

    });

    // TODO confirm user address if lat/lon equals NSA HQ

    // check if user data is valid
    if (!user.isValid()) {
        return;
    }

    var pic = _tiles['pic'].getValue();
    if (!pic.blob) {

        $.activityIndicator.hide();
        _showErrorMsg(_tiles['pic'], L('error_not_empty'));
        return;

    }
    
    // if pic was already uploaded and user did not change it in the meantime
    if (_alreadyUploadedUserPic && _alreadyUploadedUserPic.length === pic.blob.length) {
        
        _saveUser(user);        
        
    } else {
        
        $.activityIndicator.show(L('profile_uploading_pic'));
        
        // pic was already uploaded but user changed it
        if (_alreadyUploadedUserPic && _alreadyUploadedUserPic.length !== pic.blob.length) {
            
            // delete old file
            var f = Alloy.createModel('File',{
                name: _alreadyUploadedUserPic.name,
            });
            f.destroy({
                success: function () {
                    Alloy.Globals.logInfo('pic deleted success');
                },
                error: function (err) {
                    // well, at least we tried it
                    Alloy.Globals.logError('pic deleted error: ' + JSON.stringify(err));
                }
            });
            
        }
        

        // Alloy.Globals.logDebug('blob ', pic.mime, pic.name);
        var f = Alloy.createModel('File');
    
        f.upload(pic.name, pic.blob, pic.mime, {
            success : function(model, response, options) {
                // Alloy.Globals.logDebug('file success', model, response, options);
                // Alloy.Globals.logDebug('file ', response.name);
    
                // cache user pic
                Utils.writeCachedImage(response.name, pic.blob);
                            
                // cache image information
                _alreadyUploadedUserPic = {
                    'name' : response.name,
                    'url' : response.url,  
                    'length': pic.blob.length,              
                };            
                
                // free up resources
                delete pic;
        
                user.set('pic', {
                    '__type' : 'File',
                    'name' : response.name,
                    'url' : response.url,
                }, {
                    silent : true
                });
    
                _saveUser(user);
    
            },
            error : function(model, error, options) {
                $.activityIndicator.hide();
                Alloy.Globals.logError('file upload error: ' + error.error);
                _showErrorMsg(_tiles['pic'], L('error_unknown'));
            },
        });        
        
        
    }


}

function onOpened() {
    // Alloy.Globals.logDebug('profile onOpened');

    $.profile.removeEventListener('postlayout', onOpened);

    // scroll to top
    $.scrollView.scrollTo(0, 0);
    
    
    // set background
    // var bg = Utils.getBackgroundImage('bg_signup.jpg', $.scrollView.rect);
    // $.scrollView.setBackgroundImage(bg);
    // bg = null;

    /*
     _tiles['firstName'].setValue('firstname');
     _tiles['job'].setValue('job');
     _tiles['quote'].setValue('job');
     _tiles['password'].setValue('asdf');
     onSaveProfile();
     */
}

function onClose() {

    Alloy.Globals.logDebug('profile onClose');

    // do some housekeeping
    // delete already created user if signup is closed
    // this is necessary to remove empty user objects after signup was started from facebook signup (no linked user found)
    var user = Alloy.Models.instance('User');
    if (!user.isNew()) {
        user.destroy({
            error : function(model, response, options) {
                Alloy.Globals.logError('destroying temp user failed: ' + response.error);
            },
            success : function(user) {
                Alloy.Globals.logInfo('destroyed temporary user: ' + user.id);
            }
        });
        user.clear({
            silent : true
        });
    }

}

function onDoClose() {
    $.profile.close();
}
