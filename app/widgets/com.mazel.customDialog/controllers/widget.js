exports.baseController = "mazelController";

var _dialogHook,
    _dialogView,
    _contentView,
    _onClickListener,
    _cancelIndex,
    _parentWin = null;

/************
 *** INIT ***
 ************/

(function constructor (args) {

	// $.view.touchEnabled = false;

	_dialogHook = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        opacity: 0,
	});

    var dialogWin = Ti.UI.createView({
        backgroundColor: args.transparent !== undefined ? args.transparent : '#5000',
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        zIndex: 10000,
    });
    _dialogHook.add(dialogWin);

    _dialogView = Ti.UI.createView({
        left: '20dp',right:'20dp',top: '20dp', bottom: '20dp',
        backgroundColor: '#fff',
    });

    // apply properties to dialog view but exclude some
    var exclude = ['id', 'cancel', 'buttons', 'children', 'transparent'];
    _dialogView.applyProperties( _.omit(args, exclude) );

    dialogWin.add(_dialogView);


    _contentView = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
    });
    _dialogView.add(_contentView);

    dialogWin.addEventListener('android:back', function(){
        $.close({
            'index': _cancelIndex,
            'cancel': true,
        });

        return false;
    });

    // define index of cancel button
    if(args.cancel !== undefined && !isNaN(Number(args.cancel))) {
        _cancelIndex = Number(args.cancel);
    }

    //
    if (args.buttons) {
        _createDialogButtons(args.buttons.split(','));
    }

    //
    if (args.title) {
        _createTitle(args.title);
    }

    // add children of widget to dialog view
    if (args.children) {
        _.each(args.children, function (child) {
            //Alloy.Globals.logDebug('add children', child.apiName, child);

            _contentView.add(child);
        });
        // delete children property
        delete args.children;
    }

    // listen to postlayout event on hook
    _dialogHook.addEventListener('postlayout', onDialogHookRendered);

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/
function _createDialogButtons (buttons) {


    var buttonRow = Ti.UI.createView({
            width: Ti.UI.FILL,
            height: Ti.UI.SIZE,
            // height: '70dp',
            bottom: 0,
            layout:'horizontal',
            backgroundColor: '#333',
        }),
        buttonWrapperWidth = 100 / buttons.length + '%',
        buttonWrapper, button;

    buttonRow.applyProperties(Alloy.Globals.createStyle({
        classes : ['dialogButtonRow'],
    }));
    _dialogView.add(buttonRow);


    _.each(buttons, function (buttonName, index) {

        // Alloy.Globals.logDebug('button',index);

        buttonWrapper = Ti.UI.createView({
            width: buttonWrapperWidth,
            height: Ti.UI.SIZE,
            top: '10dp',
            bottom: '10dp',
        }),
        button = Ti.UI.createButton({
            backgroundSelectedColor: '#5fff',
            height: '50dp',
            left: index === 0 ? '10dp' : 0,
            right: '10dp',
            color: '#fff',
        });

        buttonWrapper.applyProperties(Alloy.Globals.createStyle({
            classes : ['dialogButtonWrapper'],
        }));
//
        button.applyProperties(Alloy.Globals.createStyle({
            classes : ['dialogButton'],
            title: L(buttonName,buttonName),
        }));

        button.addEventListener('click', function() {
       		Alloy.Globals.logDebug('cancelIndex', _cancelIndex, index, _cancelIndex === index);
            $.close({
                'index': index,
                'cancel': _cancelIndex === index,
            });
        });

        buttonWrapper.add(button);
        buttonRow.add(buttonWrapper);

    });

    function f() {
        _contentView.bottom = buttonRow.rect.height;
        buttonRow.removeEventListener('postlayout', f);
    }

    buttonRow.addEventListener('postlayout', f);

}

function _createTitle (title) {

    var titleView = Ti.UI.createView({
            width: Ti.UI.FILL,
            height: '50dp',
            top: 0,
            backgroundColor: '#333',
    });

    titleView.applyProperties(Alloy.Globals.createStyle({
        classes : ['dialogTitleView'],
    }));

    var title = Ti.UI.createLabel(Alloy.Globals.createStyle({
        classes: ['dialogTitleLabel'],
        text: title,
    }));

    titleView.add(title);
    _dialogView.add(titleView);
    _contentView.top = titleView.height;

}


/****************
 *** LISTENER ***
 ****************/

function onDialogHookRendered () {

    _dialogHook.removeEventListener('postlayout', onDialogHookRendered);

    // release resources
    _dialogView = null;
    _contentView = null;

}

/**************
 *** PUBLIC ***
 **************/
$.open = function () {

    Alloy.Globals.logDebug('open custom dialog');
        
    // force other input to loose focus
    $.dummy.focus();
    // close keyboard
    $.dummy.blur();

    // delay "heavy" work until it is really necessary
    if (_parentWin === null) {
        _parentWin = $.getParentWindow();

        if (OS_ANDROID) {

            // for windows inside e.g. tabgroup there is a parent.parent property
            var tmp = _parentWin.parent.parent === null ? _parentWin : _parentWin.parent.parent;
            tmp.addEventListener('androidback', function(e){
                Alloy.Globals.logDebug('custom dialog androidback');
                e.cancel = true;
                $.close(e);
                return false;
            });
            tmp=null;
        }

        // always add view as we always remove it after dialog is closed
        _parentWin.add(_dialogHook);

    }

    _dialogHook.width = Ti.UI.FILL;
    _dialogHook.height = Ti.UI.FILL;

    // show dialog using a fade in animation
    require('alloy/animation').fadeIn(_dialogHook, 200);

};

$.close = function (e) {

    // Alloy.Globals.logDebug('close custom dialog');
    
    // make sure event object is not undefined
    e = e || {};

    if (_onClickListener && typeof _onClickListener === 'function') {
        Alloy.Globals.logDebug('call _onClickListener');
        var res = _onClickListener(e);

        // return if user returns false
        if (res === false) {
            Alloy.Globals.logInfo('stopping close procedure');
            return;
        }
    }

    require('alloy/animation').fadeOut(_dialogHook, 200, function (e1) {

        // call user's afterClose handler
        if (e && typeof e === 'function') {
            Alloy.Globals.logDebug('call afterClose listener');
            e(e1);
        }

        // hide hook (removing it from view hierarchy triggers error e.g. if mapview is embedded in dialog)
        // TODO provide flag for turning on/off removal of hook
        _dialogHook.width = 0;
        _dialogHook.height = 0;

    });
};

$.setOnClickListener = function (handler) {
    _onClickListener = handler;
};

// TODO provide setTitle as well (which updates title or creates it)
$.createTitle = _createTitle;