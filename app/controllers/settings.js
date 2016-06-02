var _account,
    _user = Alloy.Models.instance('User');
_tiles = {
    // account details
    'username' : null,
    'email' : null,
    'password' : null,
},
_tabGroup = arguments[0].tabGroup;

/************
 *** INIT ***
 ************/

$.settings.addEventListener ('postlayout', onOpened);

/*
 * include user profile section
 */
_account = Alloy.createController('profile/partials/account');
$.accountHook.add(_account.getView());

// collect tiles
_tiles['username'] = _account.getView('username');
_tiles['email'] = _account.getView('email');
_tiles['password'] = _account.getView('password');

// set username
if (_user.get('username')) {
    _tiles['username'].setValue(_user.get('username'));
    _tiles['username'].labelize();
}

// set email
if (_user.get('email')) {
    _tiles['email'].setValue(_user.get('email'));
}

_account = null;

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

}

/*****************
 *** LISTENERS ***
 *****************/
function onOpenLegal() {
    Alloy.Globals.notyet();
}

function onLogoutUser() {

    // show activity indicator
    $.activityIndicator.show(L('logging_out'));

    _user.logout({

        error : function(model, err, options) {
            Alloy.Globals.logError('logout error: ' + err.error);

            $.activityIndicator.hide();

            // show error message (hide it automatically)
            $.messageArea.errorMessage(L('error_unknown'));

        },
        success : function(model, response) {
            Alloy.Globals.logDebug('logout success', model, response, _user);

            // clear session token
            _user.clear({silent: true});

            // open settings
            Alloy.createController('login/login').getView().open();

            // close open windows
            $.settings.close();
            _tabGroup.close();

            $.activityIndicator.hide();
        }
    });

}

function onSaveAccount() {

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
        tile.blur();
    });

    // set user data
    _user.set({
        email : _tiles['email'].getValue(),
    }, {
        silent : true,// do not validate immediately, else we had to check if set() returns false, easier to validate manually by calling isValid()
    });

    if (_tiles['password'].getValue().trim().length > 0) {
        _user.set({
            password : _tiles['password'].getValue().trim(),
        }, {
            silent : true,// do not validate immediately, else we had to check if set() returns false, easier to validate manually by calling isValid()
        });
    }

    // handle invalid field events
    _user.on('mazel:invalidField', function(e) {

        $.activityIndicator.hide();

        // log error message
        Alloy.Globals.logError('user invalid: ' + e.error);

        // highlight erroneous input field
        _handleErrorMsg(e.key, e.error);

    });

    // check if user data is valid
    if (!_user.isValid()) {
        return;
    }

    // saving triggers sync (POST)
    _user.save({}, {
        error : function(model, err, options) {
            Alloy.Globals.logDebug('settings account error', model, err, options);

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
            Alloy.Globals.logDebug('settings account success', model, response);

            // remove listener
            _user.off('mazel:invalidField');

            // save session token
            _user.saveSessionToken();

            // hide activity indicator
            $.activityIndicator.hide();

            // show success message (hide it automatically)
            $.messageArea.successMessage(L('profile_update_successful'), true);

        }
    });

}

function onCloseWindow () {

    _tabGroup = null;
    _tiles = null;

    $.settings.close();
}

// TODO provide possibility to link existing account to FB


function onOpened () {
        
    $.settings.removeEventListener ('postlayout', onOpened);
     
    var bg = require('util').getBackgroundImage('bg_signup.jpg', $.scrollView.rect);
    $.scrollView.setBackgroundImage(bg);
    bg = null;
}
