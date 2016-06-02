var Utils = require('util'),
    Map = require('ti.map'),
    user = Alloy.Models.instance('User');
_tiles = {
    // profile details
    'pic' : null,
    'avatar' : null,
    'quote' : null,
    'firstName' : null,
    'job' : null,
    'gender' : null,
    'birthday' : null,
    'location' : null,
},
args = arguments[0] || {};

/************
 *** INIT ***
 ************/

// add listener for first postlayout / opened event
$.win.addEventListener('postlayout', onOpened);

$.win.addEventListener('mazel:updateActionbar', function(e){
    // Alloy.Globals.logDebug('index mazel:updateActionbar');

    // var activity = globals.tabs.getActivity();
    e.activity.onCreateOptionsMenu = function(e) {
        var menuItem = e.menu.add({
            title : "Save",
            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
            icon : Ti.Android.R.drawable.ic_menu_save,
        });
        menuItem.addEventListener("click", onSaveProfile);

        menuItem = e.menu.add({
            title : L('window_title_flirt_preferences'),
            showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
            itemId: 0,
        });
        menuItem.addEventListener("click", onSubmenuClick);

        menuItem = e.menu.add({
            title : L('window_title_settings'),
            showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
            itemId: 1,
        });
        menuItem.addEventListener("click", onSubmenuClick);
    };
    e.activity.invalidateOptionsMenu();


});

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

// set avatar
if (user.get('avatar')) {
    _tiles['avatar'].setValue(user.get('avatar'));
}

// set quote
if (user.get('quote')) {
    _tiles['quote'].setValue(user.get('quote'));
}

// set firstName
if (user.get('firstName')) {
    _tiles['firstName'].setValue(user.get('firstName'));
}

// set job
if (user.get('job')) {
    _tiles['job'].setValue(user.get('job'));
}

// set gender options
_tiles['gender'].setOptions(_.omit(user.getGenderOptions(), 'both'));

if (user.get('gender')) {
    _tiles['gender'].setValue(user.get('gender'));
}

// set birthday
if (user.get('birthday')) {
    _tiles['birthday'].setValue(new Date(user.get('birthday').iso));
}

// set location
if (user.get('coords')) {
    var loc = user.get('coords');
    loc.address = user.get('address');
    _tiles['location'].setValue(loc);
}


if (OS_IOS) {
	require('util').iosKeyboardNavigation([
		_tiles["quote"].getView("content").children[0],
		_tiles["firstName"].getView("content").children[0],
		_tiles["job"].getView("content").children[0],
		_tiles["gender"].getView("content").children[0].children[0]//there is a wrapper around text
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


function _saveProfile () {

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

                    // hide activity indicator
                    $.activityIndicator.hide();

                    // show success message (hide it automatically)
                    $.messageArea.successMessage(L('profile_update_successful'), true);

                }
            });
}

/*****************
 *** LISTENERS ***
 *****************/

function onSaveProfile() {
    // Alloy.Globals.logDebug('onSaveProfile');

    // show activity indicator
    $.activityIndicator.show(L('saving'));

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
        // Alloy.Globals.logDebug('tile', key);
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
    // Alloy.Globals.logDebug('user', user);

    // set user data
    user.set({
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

    // check if pic was updated
    var oldPic = Utils.readCachedImage(user.get('pic').name);
    if (pic.blob.length !== oldPic.length) {

        $.activityIndicator.show(L('profile_uploading_pic'));

        Alloy.Globals.logDebug('pic updated');

        // delete old file
        var f = Alloy.createModel('File',{
            name: user.get('pic').name,
        });
        f.destroy({
            success: function () {
                Alloy.Globals.logInfo('pic deleted success');
            },
            error: function (err) {
                Alloy.Globals.logError('pic deleted error: ' + JSON.stringify(err));
            }
        });

        // "update" file (upload new one)
        f = Alloy.createModel('File');
        f.upload(pic.name, pic.blob, pic.mime, {
            success : function(model, response, options) {
                // Alloy.Globals.logDebug('file success', model, response, options);
                // Alloy.Globals.logDebug('file ', response.name);

                $.activityIndicator.show(L('saving'));

                // update user with new filename
                user.set('pic', {
                    '__type' : 'File',
                    'name' : response.name,
                }, {
                    silent : true
                });

                // save user profile
                _saveProfile();

            },
            error : function(model, error, options) {
                $.activityIndicator.hide();
                Alloy.Globals.logError('file upload error: ' + error.error);
                _showErrorMsg(_tiles['pic'], L('error_unknown'));
            },
        });

        f = null;
        pic = null;

    } else {

        // save profile
        _saveProfile();

    }


}

function onOpened() {

    $.win.removeEventListener('postlayout', onOpened);

    // scroll to top
    $.scrollView.scrollTo(0, 0);

    // set background
    var bg = Utils.getBackgroundImage('bg_profile.jpg', $.scrollView.rect);
    $.scrollView.setBackgroundImage(bg);
    bg = null;

    // set pic
    Alloy.Globals.logDebug('user pic', user.get('pic').name);
    var cachedUserPic = Utils.readCachedImage(user.get('pic').name);
    if (cachedUserPic) {
        // give time to image view to receive rect (height) dimensions
        setTimeout(function () {

            _tiles['pic'].setValue({
                blob : cachedUserPic,
                mime : cachedUserPic.mimeType,
                name : user.get('pic').name,
            });

            delete cachedUserPic;

        }, 500);
    }

    /*
     _tiles['firstName'].setValue('firstname');
     _tiles['job'].setValue('job');
     _tiles['quote'].setValue('job');
     _tiles['password'].setValue('asdf');
     onSaveProfile();
     */
}

function onClose() {

    // Alloy.Globals.logDebug('profile onClose');

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
    $.win.close();
}


/*
 * popover functionality is iOS only
 */
function onShowMenuPopover (e) {

    $.popoverDialog.show();

}

function onSubmenuClick (e) {

    var index = OS_ANDROID ? e.source.itemId : e.index;
    Alloy.Globals.logDebug('submenu click', index, e);

    if (index === 0) {//flirt prefs

        // open flirt pref window
        if (OS_ANDROID) {
            Alloy.createController('profile/flirtPreferences').getView().open();
        } else {
            Alloy.Globals.navWin.activeTab.open(Alloy.createController('profile/flirtPreferences').getView());
        }

    } else if (index === 1) {//settings

        // open settings
        if (OS_ANDROID) {
            Alloy.createController('settings',{
                'tabGroup': $.win.parent.parent,
            }).getView().open();
        } else {
            Alloy.Globals.navWin.activeTab.open(Alloy.createController('settings',{
                'tabGroup': Alloy.Globals.navWin,
            }).getView());
        }


    } else {//cancel

    }


}
