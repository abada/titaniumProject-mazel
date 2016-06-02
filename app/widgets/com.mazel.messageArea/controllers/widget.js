var animation = require('alloy/animation'),
    linkedInput,
    _args,
    _autoHideId = 0,
    _autoHideTimeout = 3000;


/************
 *** INIT ***
 ************/

(function constructor (args) {

    _args = args;
    $.wrapper.addEventListener('postlayout', onOpened);

})(arguments[0] || {});


/***************
 *** PRIVATE ***
 ***************/
function _highlightInput (input) {

    // TODO find nice background color
    input.setBackgroundColor('#3800');
    if (typeof input.blur === 'function') input.blur();

    animation.shake(input);

    // listener
    function l () {
        if (linkedInput) _clearInput(linkedInput);
        r();
    }

    // remove listener
    function r () {
        input.removeEventListener('focus', l);
    }

    input.addEventListener('focus',l);

}

function _clearInput (input) {
    input.setBackgroundColor('#fff');
}

function _message (type, msg, input, autoHide) {

    clearTimeout(_autoHideTimeout);

    $.message.text = msg;

    switch (type) {
        case 'error':

            Alloy.Globals.logError('errorMessage: ' + msg);

            $.wrapper.backgroundColor = $.errorColor;
            $.message.color = '#fff';            
            $.icon.image = '/images/ico_error.png';

            $.wrapper.show();
            animation.flash($.wrapper);

            if (input) {
                // cache input (for later clearing)
                linkedInput = input;
                // highlight input field
                _highlightInput(linkedInput);
            }

        break;
        case 'warning':

            $.wrapper.backgroundColor = $.warningColor;
            $.message.color = '#fff';            
            $.icon.image = '/images/ico_warning.png';

            $.wrapper.show();
            animation.flash($.wrapper);

        break;
        case 'success':

            $.wrapper.backgroundColor = $.successColor;
            $.message.color = '#fff';            
            $.icon.image = '/images/ico_success.png';

            $.wrapper.top = -1 * $.wrapper.rect.height;
            $.wrapper.show();
            $.wrapper.animate(Titanium.UI.createAnimation({
                top: 0,
                duration: 200,
            }));

        break;
        default:

            $.wrapper.backgroundColor = $.noticeColor;
            $.message.color = '#fff';            
            $.icon.image = '/images/ico_notice.png';

            $.wrapper.top = -1 * $.wrapper.rect.height;
            $.wrapper.show();
            $.wrapper.animate(Titanium.UI.createAnimation({
                top: 0,
                duration: 200,
            }));
            break;




    }

    if (autoHide === true || _.isNumber(autoHide)) {
        _autoHideId = setTimeout(function(){$.hide();}, _.isNumber(autoHide) ? autoHide : _autoHideTimeout);
    }

};

/****************
 *** LISTENER ***
 ****************/
function onCloseArea (e) {

    $.hide();

}

function onOpened (e) {

    $.wrapper.removeEventListener('postlayout', onOpened);

    // handle stored flash message
    var flashMsg = Ti.App.Properties.getObject('com.mazel.messageArea.flashMessage', null);
    Alloy.Globals.logDebug('flash', flashMsg);
    if (flashMsg !== null) {

		if (flashMsg.addressee !== undefined && flashMsg.addressee !== _args.id) {
			// not your job!
			return; 
		}

        // remove flash message
        Ti.App.Properties.setObject('com.mazel.messageArea.flashMessage', null);

        // display message
        _message(flashMsg.type, flashMsg.msg, null, flashMsg.autoHide);

    }

}


/**************
 *** PUBLIC ***
 **************/
$.errorColor = Alloy.Globals.messageArea && Alloy.Globals.messageArea.errorColor ? Alloy.Globals.messageArea.errorColor : '#a800';
$.warningColor = Alloy.Globals.messageArea && Alloy.Globals.messageArea.warningColor ? Alloy.Globals.messageArea.warningColor : '#ad70';
$.noticeColor = Alloy.Globals.messageArea && Alloy.Globals.messageArea.noticeColor ? Alloy.Globals.messageArea.noticeColor : '#a008';
$.successColor = Alloy.Globals.messageArea && Alloy.Globals.messageArea.successColor ? Alloy.Globals.messageArea.successColor : '#a080';


$.errorMessage = function (msg, input, autoHide) {
    _message('error', msg, input, autoHide);
};

$.warningMessage = function (msg, autoHide) {
    _message('warning', msg, null, autoHide);
};

$.noticeMessage = function (msg, autoHide) {
    _message('notice', msg, null, autoHide);
};

$.successMessage = function (msg, autoHide) {
    _message('success', msg, null, autoHide);
};

$.hide = function (anim) {

    if (anim === false) {
        $.wrapper.hide();
    } else {
        animation.fadeOut($.wrapper, 500);
    }

};

$.clear = function () {

    if (linkedInput) {
        _clearInput(linkedInput);
    }

};

/**
 * Flash message like in some web languages. Does not display the message immediately but the next time the widget is rendered (even after restarting the app)
 * @param {String} msg Message to display
 * @param {Number} type Type of message (error, notice, warning)
 * @param {Number}/{Boolean} autoHide Whether the message should be hidden after a timeout. 
 * @param {String} addressee ID of widget which should take care of the message. If unspecified the first widget rendered after this call will take care of it.
 */
$.flashMessage = function (msg, type, autoHide, addressee) {

    Ti.App.Properties.setObject('com.mazel.messageArea.flashMessage', {
        'type': type,
        'msg': msg,
        'autoHide': autoHide,        
        'addressee': addressee,        
    });

};



