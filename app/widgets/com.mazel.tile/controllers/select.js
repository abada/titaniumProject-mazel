var selected = {
        // key: 'empty',
        // label: '',
    },
    _options = [],
    _keys = [],
    _args;

/************
 *** INIT ***
 ************/

(function constructor (args) {
    
    _args = args;
    
    // set hint for text input
    if (args.hintText) {
        $.text.hintText = args.hintText;
    }
    
    // set title for option dialog
    if (args.title) {
        $.options.title = args.title;
    }
    
})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

function _selectByKey (key) {
    
    _.each(_keys, function (k, i) {
        if (k === key) $.select(i);
    });
    
};

/****************
 *** LISTENER ***
 ****************/
function onOptionSelected (e) {
    
    $.select(e.index);
    $.text.blur();
    
    if (OS_IOS) {
        $.text.fireEvent('blur');
    }
    
    // Alloy.Globals.logDebug('onOptionSelected', e.index, selected);
    
}

/**************
 *** PUBLIC ***
 **************/
$.open = function () {
    $.options.show();
    // force input to loose focus
    // $.text.blur();
    if (OS_ANDROID) {
        Ti.UI.Android.hideSoftKeyboard();
    } else if (OS_IOS) {
        //FIXME test on iOS
        $.text.blur();
    }
};

$.close = function () {
    $.options.hide();
};

$.getValue = function () {
    return selected.key;
};

$.getText = function () {
    return selected.label;
};

$.setOptions = function (options) {
    
    _.each(options, function (label, key) {
        _options.push(label);
        _keys.push(key);
    });
                
    // add options to dialog
    $.options.setOptions(_options);
};

$.select = function (index) {
    
    if (index >= 0 && index < _options.length) {
        
        // save selected options
        selected.key = _keys[index];
        selected.label = _options[index];
        
        // display selection
        $.text.value = selected.label;
                
    }
    
};

$.setValue = function (key) {
    _selectByKey(key);
};

$.blur = function () {
    $.text.blur();
};
