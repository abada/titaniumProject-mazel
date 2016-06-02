
var tabBarArrowLeft = [];
    
/************
 *** INIT ***
 ************/

// save reference to navigation window
if (OS_IOS) {
    Alloy.Globals.navWin = $.navWin;
}

// initialize facebook API
if (OS_ANDROID) {
    $.win.fbProxy = Alloy.Globals.Facebook.createActivityWorker({lifecycleContainer: $.win}); 
}

$.win.addEventListener('close',function(){
    Alloy.Globals.logDebug('login win is closed');
});

/***************
 *** PRIVATE ***
 ***************/


/*****************
 *** LISTENERS ***
 *****************/
