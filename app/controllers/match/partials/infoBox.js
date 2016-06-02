var _args;

/************
 *** INIT ***
 ************/

(function constructor(args) {

    _args = args;
    // Alloy.Globals.logDebug(args.id);

    switch (args.id) {
        case "infoBoxName":
        $.addClass($.infoBox, "infoBoxTL");
        $.ico.image = "/images/ico_name_inv.png";
        break;
        case "infoBoxAge":
        $.addClass($.infoBox, "infoBoxTR");
        $.ico.image = "/images/ico_birthday_inv.png";
        break;
        case "infoBoxJob":
        $.addClass($.infoBox, "infoBoxBL");
        $.ico.image = "/images/ico_job_inv.png";
        break;
        case "infoBoxLocation":
        $.addClass($.infoBox, "infoBoxBR");
        $.ico.image = "/images/ico_pin_inv.png";
        break;
    }
    
    // $.infoBox.backgroundColor = Alloy.Globals.Color.tabBarBackground.replace("#ff", "#aa");

    // $.infoBox.addEventListener("postlayout",onOpened);

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

function _init () {
    // $.infoBox.removeEventListener("postlayout",_init);
}


/**************
 *** PUBLIC ***
 **************/
$.showInfo = function (info) {
    $.label.setText(info);
    $.label.show();
    // $.label.width = Ti.UI.FILL;
    $.ico.left = 0;//Alloy.Globals.Layout.globalMarginLeftSmall;
    $.ico.opacity = 1;
    
	$.infoBox.backgroundColor = Alloy.Globals.Color.magenta;
    require("alloy/animation").flash($.infoBox,0,function () {
		$.infoBox.backgroundColor = "transparent";
		// $.infoBox.backgroundColor = Alloy.Globals.Color.tabBarBackground.replace("#ff", "#aa");
		// $.infoBox.backgroundColor = "#5f00";
    });
    
};

/****************
 *** LISTENER ***
 ****************/