var _date;

/************
 *** INIT ***
 ************/

(function constructor (args) {
    // Alloy.Globals.logDebug('date construct');

    // set hint for text input
    if (args.hintText) {
        $.date.hintText = args.hintText;
    }

    if (args.title) {
        $.dateDialog.createTitle(args.title);
    }

    // TODO allow setting date picker properties (e.g. maxDate)


    $.dateDialog.setOnClickListener(onDialogClose);

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/


/****************
 *** LISTENER ***
 ****************/

function onDialogClose (e) {

    if (e.cancel) {
        return;
    }

    _date = $.datePicker.getValue();
    Alloy.Globals.logDebug('User selected date: ' + _date, _date.toISOString(), String.formatDate(_date,"short"), String.formatDate(_date,"medium"));
    $.date.value = String.formatDate(_date,"long");

    $.date.blur();
    
    if (OS_IOS) {
        $.date.fireEvent('blur');
    }

}

/**************
 *** PUBLIC ***
 **************/
$.open = function () {
	
Alloy.Globals.logDebug('open with date: ' + _date, _date.toGMTString(), _date.toISOString(), String.formatDate(_date,"long"));
    
    $.datePicker.setValue(_date ? _date : new Date());
    $.dateDialog.open();
    // $.datePicker.value = _date;

    if (OS_ANDROID) {
        Ti.UI.Android.hideSoftKeyboard();
    } else if (OS_IOS) {
        //FIXME test on iOS
        $.date.blur();
    }
};

$.close = function () {
    $.dateDialog.close();
};

$.getValue = function () {
    return _date;
};

$.setValue = function (d, update) {
    // Alloy.Globals.logDebug('args',  String.formatDate(d,"long"));
        
    _date = d;
    if (update !== false){
        $.date.value = String.formatDate(_date,"long");
    }

};

$.blur = function () {
    $.date.blur();
};
