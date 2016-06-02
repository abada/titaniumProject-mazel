var date;

/************
 *** INIT ***
 ************/

(function constructor (args) {
    
    // apply view properties passed to widget
    var view = $.getView(),
        exclude = ['id', 'hintText'];
        
    view.applyProperties( _.omit(args, exclude) );
    // Alloy.Globals.logDebug('datePicker init', _.omit(args, exclude));
    
    // set hint for text input
    if (args.hintText) {
        $.date.hintText = args.hintText;
    }
    
    // TODO allow setting date picker properties (e.g. maxDate) 
    
    // somehow onFocus is not triggered on iOS!?
    if (OS_IOS) {
        $.wrapper.addEventListener('click', onFocus);
    }
    
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
    
    date = $.datePicker.getValue();
    //Alloy.Globals.logDebug('User selected date: ' + date, String.formatDate(date,"long"));
    $.date.value = String.formatDate(date,"long");
      
}

function onFocus (e) {
    
    //Alloy.Globals.logDebug('datepicker onfocus');
    
    e.cancelBubble = true;
    $.date.blur();
    
    $.datePicker.setValue(date ? date : new Date());
    $.dateDialog.open();
    
}

/**************
 *** PUBLIC ***
 **************/

$.getValue = function () {
    return date;
};


$.setDate = function (d) {
    date = d;
};

