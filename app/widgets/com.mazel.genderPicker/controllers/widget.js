var selected = {
        key: 'empty',
        label: '',
    },
    _options = [],
    _keys = [];

/************
 *** INIT ***
 ************/

(function constructor (args) {
    
    // apply view properties passed to widget
    var view = $.getView(),
        exclude = ['id', 'hintText', 'strict', 'title'];        
        
    view.applyProperties( _.omit(args, exclude) );
    // Alloy.Globals.logDebug('genderPicker init', _.omit(args, exclude));
       
    // set hint for text input
    if (args.hintText) {
        $.text.hintText = args.hintText;
    }
    
    // set title for option dialog
    if (args.title) {
        $.options.title = args.title;
    }
    
    // get options
    var opts = Alloy.Models.instance('User').getGenderOptions();
    _.each(opts, function (label, key) {
        
        if (args.strict && !(key === 'male' || key === 'female')) {
            return;
        } 
        
        _options.push(label);
        _keys.push(key);
    });
                
    // add options to dialog
    $.options.setOptions(_options);
    
    // somehow onFocus is not triggered on iOS!?
    if (OS_IOS) {
        $.wrapper.addEventListener('click', onFocus);
    }
    
})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/


/****************
 *** LISTENER ***
 ****************/
function onOptionSelected (e) {
    
    $.select(e.index);
    
    // force text to loose focus (hide autocorrect suggestions etc.)
    $.text.blur();
    
    // Alloy.Globals.logDebug('onOptionSelected', e.index, selected);
    
}

function onFocus (e) {
    
    Alloy.Globals.logDebug('gender onFocus');
    
    e.cancelBubble = true;
    $.options.show();
    $.text.blur();
    
}

/**************
 *** PUBLIC ***
 **************/
$.show = function () {
    $.options.show();
};

$.hide = function () {
    $.options.hide();
};

$.getValue = function () {
    Alloy.Globals.logDebug('getValue', selected);
    return selected.key;
};

$.getText = function () {
    return selected.label;
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


$.selectByKey = function (key) {
    
    _.each(_keys, function (k, i) {
        if (k === key) $.select(i);
    });
    
};
