var _args,
    _defaults = {
        visibleItems: 5,
        itemHeight: 40,
        selectedItemOffset: 2,
    },
    _columns = [],
    _scrollOffsetThreshold;

/************
 *** INIT ***
 ************/

(function constructor (args) {

    _args = _.defaults(args,_defaults);

    _args.selectedItemOffset = Math.floor(_args.visibleItems / 2);
    
    // on iOS the threshold is half the itemHeight
    // on Android we need to consider the separators preceeding the selected item and the screen density
    _scrollOffsetThreshold = OS_IOS ? (_args.itemHeight / 2) : (_args.itemHeight + _args.selectedItemOffset) * Alloy.Globals.deviceDim.densityFactor / 2;

    // set height according to number of visible items and item height
    $.view.setHeight(_args.visibleItems * _args.itemHeight);

    // apply properties to view but exclude some
    var exclude = ['id', 'children'];
    $.view.applyProperties( _.omit(args, exclude) );


})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

/****************
 *** LISTENER ***
 ****************/

function onColumnScroll(e){
	/*
	 * e.firstVisibleItem is index of first visible row
	 * _columns[e.source.id].firstVisibleItem is first visible row object
	 * _columns[e.source.id].firstVisibleItemIndex == e.firstVisibleItem
	 */

	var offset;
    if (OS_IOS) {
    	
    	// calc index of first visible item (property exists per default on Android)    	
    	e.firstVisibleItem = Math.floor(e.contentOffset.y / _args.itemHeight);
    	
    	// calc offset of row
    	offset = e.contentOffset.y % _args.itemHeight;
    	
    	// offset.y may be negative => make sure our index stays >= 0
    	if (e.firstVisibleItem < 0) {
    		e.firstVisibleItem = 0;
    	}

    	// make sure our index does not grow too much
    	if (e.firstVisibleItem >= _columns[e.source.id].firstVisibleItemIndexMax) {
    		e.firstVisibleItem = _columns[e.source.id].firstVisibleItemIndexMax;
    		// in case it is equal to firstVisibleItemIndexMax it is important to make sure that selectedItemIndex is not incremented no matter what offset the row has 
    		offset = 0;
    	}
    	
    } else {//Android
    	    	
	    // cache first visible item object
	    _columns[e.source.id].firstVisibleItem = e.source.data[0].rows[e.firstVisibleItem];
	
	    // calc offset of first item
	    var point = _columns[e.source.id].firstVisibleItem.children[0].convertPointToView({x:0,y:0}, e.source);
		offset = point ? -1 * point.y : 0;
    	
    }
    
    // Alloy.Globals.logDebug('scroll',e.source.id, e.firstVisibleItem, offset, _scrollOffsetThreshold);

    var selectedItemIndex = e.firstVisibleItem + _args.selectedItemOffset;

    // if scrolled far enough select next item
    // TODO check for scrolling up
    if (offset > _scrollOffsetThreshold) {
        selectedItemIndex++;
    }
    

    if (selectedItemIndex != _columns[e.source.id].lastSelectedItemIndex) {

        e.columnIndex = e.source.id;
        e.selectedItemIndex = selectedItemIndex;
        e.lastSelectedItemIndex = _columns[e.source.id].lastSelectedItemIndex;

        e.selectedValue = [];
        _.each(_columns, function (col, i) {
            // active column
            if (i == e.source.id) {
                e.selectedValue.push(col.view.data[0].rows[selectedItemIndex].id);
            } else {
                e.selectedValue.push(col.view.data[0].rows[col.firstVisibleItemIndex + _args.selectedItemOffset].id);
            }
        });

        $.view.fireEvent('change',e);

    }

    // cache information
    _columns[e.source.id].lastSelectedItemIndex = selectedItemIndex;
    _columns[e.source.id].firstVisibleItemIndex = e.firstVisibleItem;

}

function onColumnScrollend(e){
    
	var offset;
    if (OS_IOS) {
    	
    	// calc offset of row
    	offset = e.contentOffset.y % _args.itemHeight;
    	    	
    } else {//Android
    	    
	    // return early if item was not set, yet (may occur if user scrolls up as first action which immediately triggers scrollend event)
	    if (_columns[e.source.id].firstVisibleItem === null) {
	        return;
	    }
		
	    var point = _columns[e.source.id].firstVisibleItem.children[0].convertPointToView({x:0,y:0},e.source);
		offset = -1 * point.y;    	
    	
    }

    // Alloy.Globals.logDebug('scrollend', e.source.id, _columns[e.source.id].firstVisibleItemIndex, offset);
    
    if (offset > _scrollOffsetThreshold) {
        e.source.scrollToIndex(_columns[e.source.id].firstVisibleItemIndex + 1, {
        	position: Titanium.UI.iPhone.TableViewScrollPosition.TOP
        });
    } else {
        e.source.scrollToIndex(_columns[e.source.id].firstVisibleItemIndex, {
        	position: Titanium.UI.iPhone.TableViewScrollPosition.TOP
        });    	
    }
    
}

/**************
 *** PUBLIC ***
 **************/

/**
 * Add a new column
 * @param {TableViewRow[]} rows Array of TableViewRow objects (Note: each row must not have more than one child!)
 */
$.addColumn = function (rows) {

    var column = Ti.UI.createTableView({
            id: _columns.length,
            // height: Ti.UI.FILL,
            height: "100%",// FILL prevents scrolling on iOS
            showVerticalScrollIndicator: false,
            separatorColor: 'transparent',
            separatorStyle: OS_IOS ? Titanium.UI.iPhone.TableViewSeparatorStyle.NONE : 0,
            overScrollMode: OS_IOS ? 0 : Ti.UI.Android.OVER_SCROLL_NEVER,
            backgroundColor: "transparent",
        });

    var unshiftCnt = popCnt = _args.selectedItemOffset, row, view;
    while (unshiftCnt-- > 0) {
        row = Ti.UI.createTableViewRow({
            selectedColor: "red",
            selectionStyle: OS_IOS ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : 0,
        });
        view = Ti.UI.createView({
            height: _args.itemHeight + 'dp',
            backgroundColor: 'transparent',
        });
        row.add(view);
        rows.unshift(row);
    }
    while (popCnt-- > 0) {
        row = Ti.UI.createTableViewRow();
        view = Ti.UI.createView({
            height: _args.itemHeight + 'dp',
            backgroundColor: "transparent",
        });
        row.add(view);
        rows.push(row);
    }

    column.data = rows;

    column.addEventListener('scroll',onColumnScroll);
    column.addEventListener('scrollend',onColumnScrollend);
    // TODO on iOS add a dragend listener to center selection 

    _columns.push({
        view: column,
        lastSelectedItemIndex: 0,
        firstVisibleItemIndex: 0,
        firstVisibleItem: null,
        firstVisibleItemIndexMax: rows.length - 2*_args.selectedItemOffset - 1,
    });

    _.each(_columns, function(col) {
        col.view.width = Math.floor(100 / _columns.length) - 0.01 + '%';
        // col.view.width = Math.floor(99 / _columns.length) + '%';
        // col.view.width = $.view.rect.width / _columns.length;
    });

    $.view.add(column);

	return column;
};

$.setSelectedRow = function (columnIndex, rowIndex) {

    // Alloy.Globals.logDebug('scrollTo index', columnIndex, rowIndex, rowIndex - _args.selectedItemOffset);
    _columns[columnIndex].view.scrollToIndex(rowIndex - _args.selectedItemOffset, {
    	position: Titanium.UI.iPhone.TableViewScrollPosition.TOP
    });
    
    // after scrollToIndex iOS triggers no scroll events
    // thus no change events are triggered and user has no chance to update column rows
    // if(OS_IOS) {
    	
    	// fire one synthetic scroll event
    	onColumnScroll({
    		contentOffset: {
    			y: (rowIndex - _args.selectedItemOffset) * _args.itemHeight,
    		},
    		source: _columns[columnIndex].view,    	
    		firstVisibleItem: 	rowIndex - _args.selectedItemOffset,
    	});
    // }
    
    

};

/**
 *
 * @param {int} columnIndex Index of column
 * @return {Ti.UI.TableViewRow}
 */
$.getSelectedRow = function (columnIndex) {

    Alloy.Globals.logDebug('get selected row',_columns[columnIndex].lastSelectedItemIndex);
    return _columns[columnIndex].view.data[0].rows[_columns[columnIndex].lastSelectedItemIndex];

};
