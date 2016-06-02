    var _animation = require('alloy/animation'),
    _input,
    _args, _image;

/************
 *** INIT ***
 ************/

(function constructor(args) {

    _args = args;

    var exclude = ['image', 'contentType', 'hint', 'value', 'children', 'steps', 'ticks', 'step', 'ageFrom', 'ageTo', 'text', 'isButton'];
    $.tile.applyProperties( _.omit(args, exclude) );

    $.tile.addEventListener('postlayout', onOpened);

    // set left image
    if (args.image) {
        $.leftImage.image = args.image;
    }

    // Alloy.Globals.logDebug('tile type', args.contentType, args.hint);
    switch (args.contentType) {
    case 'input':
    case 'password':
    case 'email':

        _input = _createInput(args.value, args.hint, args.contentType);
        $.content.add(_input);

        break;
    case 'textarea':

        _input = _createTextarea(args.value, args.hint);
        $.content.add(_input);

        // we need to set a fix height
        $.tile.height = '100dp';
        $.leftImageWrapper.top = 0;

        break;
    case 'select':

        _input = _createSelect(args.hint, args.title);
        $.content.add(_input.getView());

        break;
    case 'location':

        _input = _createLocationPicker(args.hint, args.title);
        $.content.add(_input.getView());

        break;
    case 'date':

        _input = _createDatePicker(args.hint, args.title);
        $.content.add(_input.getView());

        break;
    case 'image':

        $.tile.height = '150dp';
        $.leftImageWrapper.hide();
        $.content.left = 0;

        _input = _createImagePicker(args.hint, args.image);
        $.content.add(_input.getView());

        break;
    case 'avatar':

        $.tile.height = '150dp';
        $.leftImageWrapper.hide();
        $.content.left = 0;

        _input = _createAvatarPicker(args.hint, args.title, args.children);
        $.content.add(_input.getView());

        break;
    case 'slider':

        _input = _createSlider(args.hint, args.steps, args.ticks, args.step);
        $.content.add(_input.getView());

    break;
    case 'ageRange':

        _input = _createAgeRangePicker(args.hint, args.ageFrom, args.ageTo);
        $.content.add(_input.getView());

    break;
    case 'label':

        _input = _createLabel(args.text);
        $.content.add(_input);

        // is button?
        if (args.isButton === 'true') {

            $.tile.addEventListener('click', function (e) {
                $.trigger('click', e);
            });

            $.tile.addEventListener('touchstart',function(){
                $.tile.backgroundColor = '#feee';
            });
            $.tile.addEventListener('touchend',function(){
                $.tile.backgroundColor = '#dfff';
            });

            $.rightImage.image = '/images/ico_arrow_right_grey.png';
            $.rightImageWrapper.show();

        }

    break;
    case 'custom':

        // hide image wrapper
        $.leftImageWrapper.width = 0;
        // left align content
        $.content.left= 0;

        if (args.height) {
            $.tile.height = args.height;
        }

        // add children of widget to dialog view
        if (args.children) {
            _.each(args.children, function (child) {
                //Alloy.Globals.logDebug('add children', child.apiName, child);
                $.content.add(child);
            });
            // delete children property
            delete args.children;
        }

    break;
    default:
    //TODO Widget.createController(args.contentType, args), baseController with getValue, setValue, focus/blur, labelize callback for success, cancel, error, update
    }
    
    

    // hide statusBar
    _animation.fadeOut($.statusBar, 0);

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

function _createInput(value, hint, type, args) {

    var isPassword = typeof type === 'undefined' ? false : type === 'password',
        isEmail = typeof type === 'undefined' ? false : type === 'email',
        input = Ti.UI.createTextField({
	        'value' : value,
	        'hintText' : hint,
	        'passwordMask' : isPassword,
	        'keyboardType' : isEmail ? Titanium.UI.KEYBOARD_EMAIL : Titanium.UI.KEYBOARD_DEFAULT,
	        'width' : Ti.UI.FILL,
	        // 'height' : Ti.UI.FILL,
	    }),
        classes = ['tileInput'];

    if (isPassword) {
        classes.push('tilePasswordInput');
    }

    input.applyProperties(Alloy.Globals.createStyle({
        'classes' : classes
    }));
    
    if (_args.autocorrect === "false") {
    	input.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
    	input.autocorrect = false;
    }

    input.addEventListener('click', _statusActive);
    input.addEventListener('focus', _statusActive);
    input.addEventListener('blur', _statusDefault);
    
    Alloy.Globals.logDebug(_args);
    // if (_args.onReturn) {
    	input.addEventListener("return", function (e) {
    		$.trigger("return",e);
    	});
    // }

    return input;

}

function _createTextarea(value, hint) {


    var input = Ti.UI.createTextArea({
        'value' : value,
        'hintText' : hint,
        'keyboardType' : Titanium.UI.KEYBOARD_DEFAULT,
        'width' : Ti.UI.FILL,
        'height' : Ti.UI.FILL,
        'top' : 0,
    });

    // no hint text for TextArea on iOS
    // => auto insert hint as text
    // doing this before applyProperties allows user to overwrite 'value'
    if (OS_IOS && !value) {
    	input.value = hint;
    }

    input.applyProperties(Alloy.Globals.createStyle({
        'classes' : ['tileInput', 'tileTextarea']
    }));

    // cache hintTextColor
    if (OS_IOS && !value) {
    	var tmp = input.color;// cache text color
    	input.color = input.hintTextColor;
    	input.hintTextColor = tmp;
    	tmp = null;
    	// Alloy.Globals.logDebug('ta color', input.color);
    }

    input.addEventListener('click', _statusActive);
    input.addEventListener('focus', _statusActive);
    input.addEventListener('blur', _statusDefault);

    return input;

}


function _createLabel(text) {

    var input = Ti.UI.createLabel({
            'text' : text,
            'width' : Ti.UI.FILL,
            'height' : Ti.UI.FILL,
        }),
        classes = ['tileLabel'];

    input.applyProperties(Alloy.Globals.createStyle({
        'classes' : classes
    }));

    return input;

}

function _createSelect(hint, title) {

    var input = Widget.createController('select', {
        hintText : hint,
        title : title,
    });

    input.getView('text').addEventListener('click', _statusActive);
    input.getView('text').addEventListener('focus', _statusActive);
    input.getView('text').addEventListener('blur', _statusDefault);

    return input;

}

function _createDatePicker(hint, title) {
    var input = Widget.createController('date', {
        hintText : hint,
        title : title,
    });

    input.getView('date').addEventListener('click', _statusActive);
    input.getView('date').addEventListener('focus', _statusActive);
    input.getView('date').addEventListener('blur', _statusDefault);

    return input;

}

function _createLocationPicker(hint, title) {
    var input = Widget.createController('location', {
        hintText : hint,
        title : title,
    });

    input.getView('text').addEventListener('click', _statusActive);
    input.getView('text').addEventListener('focus', _statusActive);
    input.getView('text').addEventListener('blur', _statusDefault);

    return input;

}

function _createImagePicker (hint, image) {

    var input = Widget.createController('image', {
        hintText : hint,
        image : image,
        success: _statusDefault,
        cancel: _statusDefault,
        error: _statusError,
    });

    input.getView('wrapper').addEventListener('click', _statusActive);

    return input;

}

function _createAvatarPicker (hint, title, avatars) {

    var input = Widget.createController('avatar', {
        hintText : hint,
        title: title,
        avatars: avatars,
        success: _statusDefault,
        cancel: _statusDefault,
        error: _statusError,
    });

    input.getView('wrapper').addEventListener('click', _statusActive);

    return input;

}

function _createSlider (hint, steps, ticks, step) {

    var input = Widget.createController('slider', {
        hintText : hint,
        steps: steps,
        ticks: ticks,
        step: step,
        update: function (step, i) {
            $.trigger('update', {
                step: step,
                i: i,
            });
        }
    });

    //input.getView('wrapper').addEventListener('click', _statusActive);

    return input;

}

function _createAgeRangePicker(hint) {

    var input = Widget.createController('ageRange', {
        hintText : hint
    });

    input.getView('text').addEventListener('click', _statusActive);
    input.getView('text').addEventListener('focus', _statusActive);
    input.getView('text').addEventListener('blur', _statusDefault);

    return input;


}

function _statusActive(e) {

    // Alloy.Globals.logDebug(_args.id + ' active', typeof _input.open);

    $.statusBar.backgroundColor = '#333';

    $.statusBar.applyProperties(Alloy.Globals.createStyle({
        classes : ['tileStatusActive'],
    }));

    // $.statusBar.hide();
    // _animation.fadeOut($.statusBar, 2000);
    _animation.fadeIn($.statusBar, 200);

    if (typeof _input.open === 'function') {
        _input.open();
    }

	// no hint text for textarea on iOS
	if (OS_IOS && _args.contentType === 'textarea') {
		// clear hint text on focus/click
		if (_input.value === _input.hintText) {
			_input.value = '';
			var tmp = _input.color;// cache hintTextColor
			_input.color = _input.hintTextColor;
			_input.hintTextColor = tmp;
			tmp = null;
    		// Alloy.Globals.logDebug('ta color', _input.color);
		}
	}

}

function _statusDefault() {

    // Alloy.Globals.logDebug(_args.id + ' default');

    $.statusBar.applyProperties(Alloy.Globals.createStyle({
        classes : ['tileStatusDefault'],
    }));

    _animation.fadeOut($.statusBar, 200);

	// no hint text for textarea on iOS
	if (OS_IOS && _args.contentType === 'textarea') {
		// clear hint text on focus/click
		if (_input.value.length === 0) {
			_input.value = _input.hintText;
	    	var tmp = _input.color;// cache text color
	    	_input.color = _input.hintTextColor;
	    	_input.hintTextColor = tmp;
	    	tmp = null;
    		// Alloy.Globals.logDebug('ta color', _input.color);
		}
	}

}

function _statusError() {

    // Alloy.Globals.logDebug(_args.id + ' error');

    $.statusBar.backgroundColor = 'red';

    $.statusBar.applyProperties(Alloy.Globals.createStyle({
        classes : ['tileStatusError'],
    }));

    _animation.flash($.statusBar);
    _animation.shake($.tile);

}

/****************
 *** LISTENER ***
 ****************/

function onOpened(e) {

    $.tile.removeEventListener('postlayout', onOpened);

}

/**************
 *** PUBLIC ***
 **************/

$.getValue = function() {
    // Alloy.Globals.logDebug('getValue', _input.getValue());
    return _input.getValue();
};

$.setValue = function() {
    //Alloy.Globals.logDebug('setValue', arguments[0], arguments[0] && arguments[0].length > 0);

    // mimic hint text behaviour on iOS
	if (OS_IOS && _args.contentType === 'textarea') {

		// set a new value
		if (arguments[0] && arguments[0].length > 0) {

			// value shows hintText
			if (_input.value === _input.hintText) {
		    	var tmp = _input.color;
		    	_input.color = _input.hintTextColor;// apply previously cached color
		    	_input.hintTextColor = tmp;// cache text color
		    	tmp = null;
		    	// Alloy.Globals.logDebug('ta color', _input.color);
			} else {
				// do nothing
			}

   		} else { // set hint text again

			// value shows hintText
			if (_input.value === _input.hintText) {
				// do nothing
			} else {
		    	var tmp = _input.color;
		    	_input.color = _input.hintTextColor;// apply previously cached color
		    	_input.hintTextColor = tmp;// cache text color
		    	tmp = null;
		    	// Alloy.Globals.logDebug('ta color', _input.color);
			}

	    }
	}


    if (arguments.length === 1) {
        _input.setValue(arguments[0]);
    } else {
        _input.setValue.apply(_input, arguments);
    }
    return;
};

$.error = _statusError;
$.active = _statusActive;

$.setOptions = function(options) {

    if (_args.contentType !== 'select')
        return;

    _input.setOptions(options);
};

$.blur = function () {
    _input.blur();
};

$.labelize = function () {

    switch (_args.contentType) {
    case 'input':
    case 'password':
    case 'email':
    case 'textarea':

        _statusDefault();
        _input.removeEventListener('click', _statusActive);
        _input.removeEventListener('focus', _statusActive);
        _input.removeEventListener('blur', _statusDefault);
        _input.editable = false;

    break;
    default:
        Alloy.Globals.logWarn('labelize() not implemented');

    }


};

// only needed for debugging (so far)
// $.open = function () {
	// _input.open();
// };
