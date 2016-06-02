var _activeTabIdx = -1,
    _updateActionbarTimeoutId = 0;

/************
 *** INIT ***
 ************/

$.tabGroup.addEventListener("postlayout", onOpened);

$.tabGroup.setActiveTab($.matchTab);
// $.tabGroup.setActiveTab($.chatTab);
// $.tabGroup.setActiveTab($.profileTab);

function onOpened (e) {

    $.tabGroup.removeEventListener('postlayout', onOpened);

    // set navigation window reference
    if (OS_IOS) {
    	if (Alloy.Globals.navWin) {
    		Alloy.Globals.navWin.close();
    	}
        Alloy.Globals.navWin = $.tabGroup;
    }

    // _updateActionbar(2);
    
    // $.profile.getView("popoverDialog").fireEvent("click",{
    	// index: 0,    	
    // });

}

/***************
 *** PRIVATE ***
 ***************/
function _updateActionbar(tab) {

    // Alloy.Globals.logDebug('_updateActionbar');

    if (OS_ANDROID) {

        tab.getWindow().fireEvent('mazel:updateActionbar',{
            activity: $.tabGroup.getActivity()
        });

    } else {

        //FIXME test on iOS

        // if not yet set, return immediately
        if (!$.actionbarButton) {
            return;
        }


        if (index === 2) {
            $.actionbarButton.visible = true;
        } else {
            $.actionbarButton.visible = false;
        }

    }
}

/*****************
 *** LISTENERS ***
 *****************/
function onTabFocused (e) {

    if (OS_ANDROID) {

        if (!e.tab) {
            return;
        }

        var icon = e.tab.getIcon(),
            idx = icon.lastIndexOf('.png');

        // set active icon (make sure suffix exists only once)
        e.tab.setIcon(icon.substr(0, idx).replace('-active','') + '-active.png');

        // console.log('onTabFocused ' + e.index);
        if (e.previousTab) {
            e.previousTab.setIcon(e.previousTab.getIcon().replace('-active',''));
        }

        _activeTabIdx = e.index;

        _updateActionbar(e.tab);

    } else {

        // Alloy.Globals.logDebug('onTabFocused ios',e.source);
        // create tab index (does not exist natively on iOS)
        switch (e.source.id) {
            case 'chatTab':
                e.index = 0;
            break;
            case 'matchTab':
                e.index = 1;
            break;
            case 'profileTab':
                e.index = 2;
            break;
        }

        _updateActionbar(e.index);

    }


}


