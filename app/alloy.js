// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// for deployType dependant xml (e.g. <Label if="Alloy.Globals.Production">)
Alloy.Globals.Development = ENV_DEV;
Alloy.Globals.Production = ENV_PRODUCTION;

Alloy.Globals.startTime = _.now();

// obscure API_KEY
Alloy.Globals.PARSE_API_KEY = null;
Alloy.Globals.PARSE_API_KEY_CHARS1 = [120,99,85,111,118,0,125,82,101,86,45,21,39,35,31,89,15,123,4,61,117,101,66];

Alloy.Globals.PARSE_MASTER_KEY = null;
Alloy.Globals.PARSE_MASTER_KEY_CHARS1 = [110,80,73,68,7,67,1,8,70,39,13,90,85,11,41,124,83,47,15,43,97,111];

Alloy.Globals.PARSE_APP_ID = 'jvtgamLzBJabaCyHiYZCaCWT6OVEweaUIc7rTDOe';

// Loads the map module, which can be referenced by Alloy.Globals.Map
Alloy.Globals.Map = require('ti.map');

// Loads facebook module
Alloy.Globals.Facebook = require('facebook');
Alloy.Globals.FacebookTimeout = 2000;// delay before facebook requests time out

/**************
 *** COLORS ***
 **************/
Alloy.Globals.Color = {};
Alloy.Globals.Color.magenta = '#ffff0b41';

/* font */
Alloy.Globals.Color.mainFont = '#ff333333';
Alloy.Globals.Color.hintFont = '#ff999999';// !!! remember to update theme_mazel.xml as well !!!

/* navigation bar */
Alloy.Globals.Color.navBarBackground = '#ff000000';
Alloy.Globals.Color.navBarFont = '#ffffffff';

/* button colors */
Alloy.Globals.Color.buttonBackground = '#ff333333';
Alloy.Globals.Color.buttonOverlayBackground = '#14ffffff';
// Alloy.Globals.Color.buttonSelectedBackground = '#ff4d4d4d';
Alloy.Globals.Color.buttonSelectedBackground = '#0fff';//transparent
Alloy.Globals.Color.buttonActiveBackground = '#ffffffff';

Alloy.Globals.Color.buttonFont = '#ffffffff';
// Alloy.Globals.Color.buttonSelectedFont = '#ffffffff';
Alloy.Globals.Color.buttonSelectedFont = Alloy.Globals.Color.buttonBackground;
Alloy.Globals.Color.buttonActiveFont = '#ff333333';

Alloy.Globals.Color.buttonFacebookBackground = '#ff3b5998';
// Alloy.Globals.Color.buttonFacebookSelectedBackground = '#ff4466af';
Alloy.Globals.Color.buttonFacebookSelectedBackground = '#0fff';//transparent

/* tab bar colors */
Alloy.Globals.Color.tabBarBackground = '#ff333333';// keep in mind that "#ff" may be replaced by e.g. "#55" in this string
Alloy.Globals.Color.tabBarButtonBackground = Alloy.Globals.Color.buttonBackground;
Alloy.Globals.Color.tabBarButtonBorder = '#ffffffff';
Alloy.Globals.Color.tabBarButtonActiveBackground = Alloy.Globals.Color.buttonActiveBackground;
Alloy.Globals.Color.tabBarButtonSelectedBackground = Alloy.Globals.Color.buttonSelectedBackground;

Alloy.Globals.Color.tabBarButtonFont = Alloy.Globals.Color.buttonFont;
Alloy.Globals.Color.tabBarButtonSelectedFont = Alloy.Globals.Color.buttonFont;// can't be changed atm
Alloy.Globals.Color.tabBarButtonActiveFont = Alloy.Globals.Color.buttonActiveFont;

/* table */
Alloy.Globals.Color.tableSeparator = '#ffe6e6e6';

/* map */
Alloy.Globals.Color.mapCircleStroke = '#ffff0b41';
Alloy.Globals.Color.mapCircleFill = '#55ff0b41';

/* message area */
Alloy.Globals.messageArea = {};
Alloy.Globals.messageArea.successColor = '#c871c837';
Alloy.Globals.messageArea.errorColor = '#c8e1113f';
Alloy.Globals.messageArea.warningColor = '#c8ff6600';
Alloy.Globals.messageArea.noticeColor = '#c80a89d4';

/*
 * GAMES
 */
// memory
Alloy.Globals.Color.Memory = {};
Alloy.Globals.Color.Memory.beige = '#fffdf8e5';
Alloy.Globals.Color.Memory.beige2 = '#88fdf8e5';
Alloy.Globals.Color.Memory.blue1 = '#ff93a7ac';
Alloy.Globals.Color.Memory.blue2 = '#ff6f8a91';
Alloy.Globals.Color.Memory.olive1 = '#ffbcbaa3';
Alloy.Globals.Color.Memory.olive2 = '#ff9a9675';
Alloy.Globals.Color.Memory.purple1 = '#ffa8a9b7';
Alloy.Globals.Color.Memory.purple2 = '#ff75778d';
Alloy.Globals.Color.Memory.green1 = '#ff93ac93';
Alloy.Globals.Color.Memory.green2 = '#ff6e916e';
Alloy.Globals.Color.Memory.turquoise1 = '#ff93aca7';
Alloy.Globals.Color.Memory.turquoise2 = '#ff4a7d8a';

// quiz
Alloy.Globals.Color.Quiz = {};
Alloy.Globals.Color.Quiz.lightFont = '#ffffffff';
Alloy.Globals.Color.Quiz.darkFont = '#ff00647e';
Alloy.Globals.Color.Quiz.darkActiveFont = '#ff00aeda';
Alloy.Globals.Color.Quiz.arrowBackground = '#ffffffff';
Alloy.Globals.Color.Quiz.darkBackground = '#ff00647e';
Alloy.Globals.Color.Quiz.lightBackground = '#ff0088aa';
Alloy.Globals.Color.Quiz.overallSummaryBackground = '#ff00aeda';
Alloy.Globals.Color.Quiz.correctAnswerBackground = '#6437c837';
Alloy.Globals.Color.Quiz.wrongAnswerBackground = '#77d40000';
Alloy.Globals.Color.Quiz.answerBackground = '#25ffffff';

/************************
 *** LAYOUT VARIABLES ***
 ************************/
Alloy.Globals.Layout = {};
Alloy.Globals.Layout.globalMarginTop = '20dp';
Alloy.Globals.Layout.globalMarginLeft = Alloy.Globals.Layout.globalMarginTop;
Alloy.Globals.Layout.globalMarginBottom = Alloy.Globals.Layout.globalMarginTop;
Alloy.Globals.Layout.globalMarginRight = Alloy.Globals.Layout.globalMarginTop;

Alloy.Globals.Layout.globalMarginTopSmall = '10dp';
Alloy.Globals.Layout.globalMarginLeftSmall = Alloy.Globals.Layout.globalMarginTopSmall;
Alloy.Globals.Layout.globalMarginBottomSmall = Alloy.Globals.Layout.globalMarginTopSmall;
Alloy.Globals.Layout.globalMarginRightSmall = Alloy.Globals.Layout.globalMarginTopSmall;

Alloy.Globals.Layout.globalMarginTopLarge = '40dp';
Alloy.Globals.Layout.globalMarginLeftLarge = Alloy.Globals.Layout.globalMarginTopLarge;
Alloy.Globals.Layout.globalMarginBottomLarge = Alloy.Globals.Layout.globalMarginTopLarge;
Alloy.Globals.Layout.globalMarginRightLarge = Alloy.Globals.Layout.globalMarginTopLarge;

Alloy.Globals.Layout.buttonBorderRadius = '5dp';
Alloy.Globals.cnt = 1;

/*************************
 *** DEVICE DIMENSIONS ***
 *************************/
Alloy.Globals.deviceDim = null;// initiated in index.js


/*************
 *** DEBUG ***
 *************/

var mDebugLog = !ENV_PRODUCTION && true;
Alloy.Globals.autoClick = true;
Alloy.Globals.notyet = function(){
    alert('not yet implemented');
};


/*
 * Wrapper around the Ti.API.debug method. This iterates through all arguments, applies JSON.stringify() to each one and concatenates the output. Finally the resulting output is logged
 */
Alloy.Globals.logDebug = function() {

    //TODO write log to debug file

	if (!mDebugLog)
		return;

	var log = '';
	for(var i = 0; i < arguments.length; i++){
		//Ti.API.debug(arguments[i]);
		if(i > 0) log += ', ';
        try {
		  log += JSON.stringify(arguments[i]);
        } catch (e) {
            // catch exceptions like "TypeError: Converting circular structure to JSON"
            Ti.API.error(e);
        }
	}

    Ti.API.debug('Ti.API: ' + log);
    // console.log(log);
};

Alloy.Globals.logError = function(msg) {
    Ti.API.error(msg);
};

Alloy.Globals.logWarn = function(msg) {
    Ti.API.warn(msg);
};

Alloy.Globals.logInfo = function(msg) {
    Ti.API.info(msg);
};



Alloy.Globals.listDirectoryContents = function(dir, i){

    var indent = '', tmp = i;
    while(tmp > 0){
        indent = indent + '>';
        tmp--;
    }

    if(dir.isDirectory()){
        console.log(indent + ' ' + dir.name + ' (d)');
        var contents = dir.getDirectoryListing();
        _.each(contents,function(f){
            Alloy.Globals.listDirectoryContents(Ti.Filesystem.getFile(dir.nativePath, f), i+1);
        });
    }else if(dir.isFile()){
        console.log(indent + ' ' + dir.name + ' (f),' + dir.size);
    }else{
        console.log(indent + 'file not found: ' + dir.nativePath);
    }

};
