var _avatar,
    _successCb,
    _cancelCb,
    _errorCb;

/************
 *** INIT ***
 ************/

(function constructor(args) {
    // Alloy.Globals.logDebug('avatar construct');


    // set hint text
    if (args.hintText) {
        $.label.text = args.hintText;
    }

    if (args.title) {
        $.avatarDialog.createTitle(args.title);
    }

    // add children of widget to scrollview
    if (args.avatars && args.avatars.length > 0) {

        _.each(args.avatars, function (avatar, i) {
            // Alloy.Globals.logDebug('add children', avatar.apiName, avatar);

            avatar.width = OS_IOS ? '33%' : '33.33%';
            avatar.height = Ti.UI.SIZE;
            avatar.backgroundSelectedColor = Alloy.Globals.Color.magenta;

            if (i === 0) {
                avatar.backgroundColor = Alloy.Globals.Color.magenta;
            }

            avatar.applyProperties(Alloy.Globals.createStyle({
                classes: ['avatarImage'],
            }));
            $.avatarWrapper.add(avatar);
        });

        // set image
        if (args.avatars[0].image) {
            $.image.image = args.avatars[0].image;
            _avatar = args.avatars[0].image.split('/').pop();
        }

        delete args.avatars;

    }

    _successCb = args.success;
    _cancelCb = args.cancel;
    _errorCb = args.error;

    $.avatarDialog.setOnClickListener(function(e){
        // Alloy.Globals.logDebug('avatarDialog cancel', e);
        if (e.cancel) {
           _cancelCb();
        }
    });

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

function _highlightAvatar (avatar) {

    _.each($.avatarWrapper.children, function (avatar) {
        // Alloy.Globals.logDebug('add children', avatar.apiName, avatar);
        avatar.backgroundColor = 'transparent';
    });

    avatar.backgroundColor = Alloy.Globals.Color.magenta;

}


/****************
 *** LISTENER ***
 ****************/
function onAvatarSelect (e) {

    _avatar = e.source.image.split('/').pop();
    // Alloy.Globals.logDebug('onAvatarSelect', e.source.image, _avatar);

    // highlight selected avatar
    _highlightAvatar(e.source);

    // update pic after close
    $.image.image = e.source.image;

    // close dialog on click
    $.avatarDialog.close();

    _successCb();

}

/**************
 *** PUBLIC ***
 **************/
$.open = function() {

    $.avatarDialog.open();

};

$.getValue = function() {
    return _avatar;
};

/**
 *
 * @param {String} avatar Filename of avatar icon
 */
$.setValue = function(avatar, update) {

    _avatar = avatar;

    if (update !== false) {

        var image = _.find($.avatarWrapper.children, function (child) {

            if (child.image.split('/').pop() === avatar) {

                return child;

            }

        });

        if (image) {

                // highlight selected avatar
                _highlightAvatar(image);

                // update pic after close
                $.image.image = image.image;
        }

    }

};

$.blur = _cancelCb;
