var Utils = require('util'),
    _user,
    _webview,
    _revealCnt = 0,
    _hideRevealOverlayTimeout = -1,
    _hideMatchOverlayTimeout = -1;


/************
 *** INIT ***
 ************/

Ti.App.addEventListener('mazel:reveal', onReveal);

$.win.addEventListener('postlayout', onOpened);
$.win.addEventListener('mazel:updateActionbar', function(e){
    // Alloy.Globals.logDebug('progress mazel:updateActionbar');

    // var activity = globals.tabs.getActivity();
    e.activity.onCreateOptionsMenu = function(e) {
        var menuItem = e.menu.add({
            title : "Dismiss",
            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
            icon : '/images/abico_dismiss.png',
        });
        menuItem.addEventListener("click", Alloy.Globals.notyet);
    };
    e.activity.invalidateOptionsMenu();

});


/***************
 *** PRIVATE ***
 ***************/

function _showRevealDetailsStep1 () {

	$.infoBoxWrapper.top = "2dp";
	$.infoBoxWrapper.height = "100dp";

    // show CG info
    $.infoBoxName.showInfo("Carl-Gustav");
    $.infoBoxAge.showInfo("2 years");
    $.infoBoxJob.showInfo("Legal Shit Officer");
    $.infoBoxLocation.showInfo("Rainbow City");

    $.revealTitle.text = "Carl-Gustav";
    $.revealSubtitle.text = L("flirt_one_more_game_explain");

}
function _showRevealDetailsStep2 () {

	// reveal other motto
	$.revealSubtitle.text = "\"If life gives you lemons, make lemonade!\"";

    // hide game buttons
    $.memoryButton.height = 0;
    $.quizButton.height = 0;

    // hide pic behind color overlay
    $.flirtHeader.children[0].backgroundColor = Alloy.Globals.Color.tabBarBackground;

    // reveal profile pic
    var bg = Utils.getBackgroundImage('pic_carl.jpg', $.flirtHeader.rect);
    $.flirtHeader.setBackgroundImage(bg);

    // fade in pic
    $.flirtHeader.children[0].animate({
    	backgroundColor: Alloy.Globals.Color.tabBarBackground.replace("#ff", "#aa"),
    	duration: 10000,
    });
    // $.flirtHeader.children[0].backgroundColor = Alloy.Globals.Color.tabBarBackground.replace("#ff", "#aa");
    // $.infoBoxWrapper.backgroundColor = Alloy.Globals.Color.tabBarBackground.replace("#ff", "#aa");

    // show profile pic thumbnail
    $.avatarImage.image = "/images/avatar_carl.jpg";
    $.avatarBg.hide();

    $.avatarBorder.borderRadius = "40dp";//79dp wide
    $.avatarImage.borderRadius = "38dp";//75dp wide
    $.avatarBorder.borderWidth = "2dp";
    $.avatarBorder.borderColor = '#fff';

    bg = null;

    // make chat button 100% height
    $.chatButton.height = Ti.UI.FILL;

}

/*****************
 *** LISTENERS ***
 *****************/
function onOpened () {

    $.win.removeEventListener('postlayout', onOpened);

    // onStartMemory();
    // onStartQuiz();

    // set background
    var bg = Utils.getBackgroundImage('bg_matching.jpg', $.mainView.rect);
    $.mainView.setBackgroundImage(bg);

    // show match overlay dummy
    if (Ti.App.Properties.getBool('isMatch', true)) {

        // do not trigger until next restart
        Ti.App.Properties.setBool('isMatch', false);

    	// show heartbeat animation with message
    	$.hb1.start();
    	$.hb1.updateMessage(L("flirt_match_overlay_searching"));
    	setTimeout(function (){

    		require("alloy/animation").fadeIn($.matchOverlay.children[0], 200);

    		$.hb1.stop();
    		$.matchOverlay.remove($.hb1);

	        // turn on event capturing
	        $.matchOverlay.touchEnabled = true;
	        $.matchOverlay.addEventListener("click", onHideMatchOverlay);
	        _hideMatchOverlayTimeout = setTimeout(onHideMatchOverlay,5000);

    	}, _.random(5,8)*1000);

    }

    bg = null;

}

function onStartMemory () {
	Alloy.Globals.logDebug("onStartMemory");
    Alloy.Globals.notyet();
}

function onStartQuiz () {
	Alloy.Globals.logDebug("onStartQuiz");
    Alloy.Globals.notyet();
}

function onReveal (e) {

	Alloy.Globals.logDebug("onReveal", _revealCnt);

    if (_revealCnt == 0) {

    	require("alloy/animation").fadeOut($.mainView.children[0],100);

        // turn on event capturing
        $.revealOverlay.touchEnabled = true;
		require("alloy/animation").popIn($.revealOverlay);
		_hideRevealOverlayTimeout = setTimeout(onHideRevealOverlay, 5000);

    } else if (_revealCnt == 1) {
        // show CG avatar + name

        Ti.App.removeEventListener('mazel:reveal', onReveal);

        _showRevealDetailsStep2();

    }

    if(e.game == "memory") {
        $.memoryButton.removeEventListener("click",onStartMemory);
        // $.memoryButton.opacity = 0.3;
        $.memoryButton.height = 0;
        if (_revealCnt < 1) {
	        $.quizButton.height = Ti.UI.FILL;
        }
    } else if(e.game == "quiz") {
        $.quizButton.removeEventListener("click",onStartQuiz);
        // $.quizButton.opacity = 0.3;
        $.quizButton.height = 0;
        if (_revealCnt < 1) {
	        $.memoryButton.height = Ti.UI.FILL;
	    }
    }

    _revealCnt++;

}

function onHideRevealOverlay () {
	// Alloy.Globals.logDebug("onHideRevealOverlay");
	clearTimeout(_hideRevealOverlayTimeout);

	require("alloy/animation").crossFade($.revealOverlay, $.mainView.children[0], 500);

    _showRevealDetailsStep1();

    // disable touch (else on Android devices the overlay would consume all click events)
    $.revealOverlay.touchEnabled = false;

}

function onHideMatchOverlay () {
	// Alloy.Globals.logDebug("onHideMatchOverlay");
	clearTimeout(_hideMatchOverlayTimeout);

	require("alloy/animation").crossFade($.matchOverlay,$.mainView.children[0], 500);

    // disable touch (else on Android devices the overlay would consume all click events)
    $.matchOverlay.touchEnabled = false;

}

function onClose () {
	Alloy.Globals.logDebug("flirt closed");
	// remove global listener
	Ti.App.removeEventListener('mazel:reveal', onReveal);
}
