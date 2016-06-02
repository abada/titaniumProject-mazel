var _ageMin = 20,
    _ageMax = 100,
    _ageStep = 5,
    _ageFrom = -1, _ageTo = -1,
    _itemHeight = 30,
    _visibleItemsCnt = 5,
    _firstVisibleItemIndex = 0,
    _firstVisibleItem, _last_i = 2,
    _multiColumnPicker,_ignoreInitChange = 0,
    _dataFrom, _dataTo;

/************
 *** INIT ***
 ************/

(function constructor(args) {

    // Alloy.Globals.logDebug('ageRange',args);

    // set hint text
    if (args.hintText) {
        $.text.hintText = args.hintText;
    }

    if (args.title) {
        $.ageRangeDialog.createTitle(args.title);
    }

    _multiColumnPicker = Widget.createWidget('com.mazel.multiColumnPicker',{
    	itemHeight: _itemHeight,
    });

    var multiColumnPickerView = _multiColumnPicker.getView();
    // multiColumnPickerView.backgroundColor = '#333';
    // multiColumnPickerView.backgroundColor = '#fff';
    $.hook.add(multiColumnPickerView);

    // create column data
    _dataFrom = [];
    _dataTo = [];
    var row, view, label;

    for (var i = _ageMin; i < _ageMax; i = i + _ageStep) {

        // fromCol data
        row = Ti.UI.createTableViewRow({
        	id: i,
            selectionStyle: OS_IOS ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : 0,
        });
        view = Ti.UI.createView({
            height: OS_ANDROID ? _itemHeight + 4 + 'dp' : _itemHeight + 'dp',
            width: "50dp",
            backgroundColor: '#fff',
	        // workaround for separator on Android
	        // make it some pixels higher and add a negative offset => view appears centered 
            top: OS_ANDROID ? "-4dp" : 0,
        });
        label = Ti.UI.createLabel({
            text: i,
            color: '#333',
			font:{
		        fontSize: '20dp',
		        fontFamily: 'Arapey-Regular',
		    },
		    opacity:0.65,
        });
        view.add(label);
        row.add(view);
        _dataFrom.push(row);

        // toCol data
        row = Ti.UI.createTableViewRow({
        	id: i + _ageStep,
            selectionStyle: OS_IOS ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : 0,
        });
        view = Ti.UI.createView({
            height: OS_ANDROID ? _itemHeight + 4 + 'dp' : _itemHeight + 'dp',
            width: "50dp",
            backgroundColor: '#fff',
	        // workaround for separator on Android
	        // make it some pixels higher and add a negative offset => view appears centered 
            top: OS_ANDROID ? "-4dp" : 0,
        });
        label = Ti.UI.createLabel({
            text: i + _ageStep,
            color: '#333',
			font:{
		        fontSize: '20dp',
		        fontFamily: 'Arapey-Regular',
		    },
		    opacity:0.65,
        });
        view.add(label);
        row.add(view);
        _dataTo.push(row);

    }

    var colFrom = _multiColumnPicker.addColumn(_dataFrom),
    	colTo = _multiColumnPicker.addColumn(_dataTo);

	if (OS_ANDROID) {
		colFrom.separatorColor = '#fff';
		colTo.separatorColor = '#fff';
	}

    multiColumnPickerView.addEventListener('change', function (e){

        // Alloy.Globals.logDebug('change', _ignoreInitChange <= 0, e.columnIndex, e.selectedItemIndex, e.selectedValue);

        var data;
        if (e.columnIndex == 0) {
            data = _dataFrom;
            //Alloy.Globals.logDebug('_dataFrom >= _dataTo', e.selectedValue[0],e.selectedValue[1],e.selectedValue[0]>=e.selectedValue[1]);
            // if ageFrom is set to something greater-equal ageTo
            if (e.selectedValue[0] >= e.selectedValue[1] && _ignoreInitChange <= 0) {
                _multiColumnPicker.setSelectedRow(1, e.selectedItemIndex);
            }

        } else if (e.columnIndex == 1) {
            data = _dataTo;
             // if ageTo is set to something lower-equal ageFrom
            if (e.selectedValue[1] <= e.selectedValue[0] && _ignoreInitChange <= 0) {
                // set ageFrom to same rowIndex as ageTo (ageFrom = ageTo - ageStep)
                _multiColumnPicker.setSelectedRow(0, e.selectedItemIndex);
            }
        }
        _ignoreInitChange--;

        // produce fisheye effect
        _fisheye(data, e.selectedItemIndex);

		/*
        if (e.lastSelectedItemIndex) {
            // data[e.lastSelectedItemIndex].children[0].backgroundColor = '#eee';
            // data[e.lastSelectedItemIndex].children[0].children[0].color = '#333';
	        data[e.lastSelectedItemIndex].children[0].children[0].opacity = 0.65;
	        data[e.lastSelectedItemIndex].children[0].children[0].setFont({fontSize: "15dp",fontFamily: 'Arapey-Regular'});
			data[e.lastSelectedItemIndex].children[0].children[0].setText(data[e.lastSelectedItemIndex].children[0].children[0].text);
        }
		*/
    });
    
    
    
    
    

    $.ageRangeDialog.setOnClickListener(onSelect);

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/
function _fisheye(data, selectedIndex) {
	
	// highlight selected row (fontsize 20dp, opacity 1)
	_highlightRow(data[selectedIndex], "25dp", 1);
		
	for (var i = -2; i <= 2; i++) {
		
		if (i == 0 || selectedIndex + i < 0 || selectedIndex + i >= data.length || data[selectedIndex+i].children[0].children.length == 0) {
			continue;
		}
		
		if (i == -2 || i == 2) {
			_highlightRow(data[selectedIndex+i], "18dp", 0.3);
		} else if (i == -1 || i == 1) {
			_highlightRow(data[selectedIndex+i], "20dp", 0.65);			
		}
		
	}
	
}
function _highlightRow(row, fontSize, opacity) {
	
	if(row && row.children && row.children[0].children[0]) {
	    row.children[0].children[0].opacity = opacity;
	    row.children[0].children[0].setFont({"fontSize": fontSize,"fontFamily": 'Arapey-Regular'});
	    // force redraw of label
		row.children[0].children[0].setText(row.children[0].children[0].text);
	}
		
}

/****************
 *** LISTENER ***
 ****************/

function onSelect (e) {

    // Alloy.Globals.logDebug('dialog close',e,$.agePicker.getSelectedRow(0).title);

    if (e.cancel) {
        return;
    }

    _ageFrom = _multiColumnPicker.getSelectedRow(0).id;
    _ageTo = _multiColumnPicker.getSelectedRow(1).id;

    $.text.value =  _ageFrom + ' - ' + _ageTo;
    $.text.blur();

    if (OS_IOS) {
        $.text.fireEvent('blur');
    }

}


/**************
 *** PUBLIC ***
 **************/
$.open = function() {
    Alloy.Globals.logDebug('open agerange');

    $.ageRangeDialog.open();

    // select last selection again
    if (_ageFrom > 0 && _ageTo > 0) {

        // don't care about change events triggered by the following two calls
        _ignoreInitChange = 2;

        // +2 add selectedItemOffset (two empty rows before first item)
        _multiColumnPicker.setSelectedRow(0, (_ageFrom - _ageMin) / _ageStep + 2);
        _multiColumnPicker.setSelectedRow(1, (_ageTo - _ageMin - _ageStep) / _ageStep + 2);
    } else {

        // highlight default selection        
        _multiColumnPicker.setSelectedRow(0, 2);
        _multiColumnPicker.setSelectedRow(1, 2);
        
        _fisheye(_dataFrom,2);
        _fisheye(_dataTo,2);
        
        // _multiColumnPicker.getSelectedRow(0).children[0].backgroundColor = 'orange';
        // _multiColumnPicker.getSelectedRow(0).children[0].children[0].color = '#fff';
        // _multiColumnPicker.getSelectedRow(1).children[0].backgroundColor = 'orange';
        // _multiColumnPicker.getSelectedRow(1).children[0].children[0].color = '#fff';
    }

    if (OS_ANDROID) {
        Ti.UI.Android.hideSoftKeyboard();
    } else if (OS_IOS) {
        //FIXME test on iOS
        $.text.blur();
    }
};

$.getValue = function() {
    return {
        from: _ageFrom,
        to: _ageTo,
    };
};

$.setValue = function (obj, update) {
    _ageFrom = obj.from;
    _ageTo = obj.to;

    if (update !== false){
        $.text.value = _ageFrom + ' - ' + _ageTo;
    }

};

