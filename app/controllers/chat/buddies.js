var animation = require('alloy/animation');

$.buddies.addEventListener('postlayout', onOpened);

$.buddies.addEventListener('mazel:updateActionbar', function(e){
    // Alloy.Globals.logDebug('chat mazel:updateActionbar');

    // clear actionbar
    e.activity.onCreateOptionsMenu = function(e) {
    };
    e.activity.invalidateOptionsMenu();


});

function onOpenConversation(){

	var emailDialog = Ti.UI.createEmailDialog(),
	   user = Alloy.Models.instance('User');
    emailDialog.subject = "Feedback - " + user.get('firstName');
    emailDialog.toRecipients = ['carl-gustav@mazelapp.com'];
    emailDialog.messageBody = 'Hi Carl,<br><br>Great app, but ...';
    emailDialog.html = true;
    emailDialog.open();

}


function onOpened () {

    $.buddies.removeEventListener('postlayout', onOpened);

    _.each($.buddyList.children, function (child) {

        var img = child.children[1].children[0].children[0].toBlob(),
            w = 38*Alloy.Globals.deviceDim.densityFactor;

        Alloy.Globals.logDebug("img", img.width, img.height);
        // FIXME test on Android
        img = img.imageAsResized(w, w);
        img = img.imageWithRoundedCorner(w);
        child.children[1].children[0].children[0].image = img;
        
    });


    var bg = require('util').getBackgroundImage('bg_contacts.jpg', $.scrollView.rect);
    $.scrollView.setBackgroundImage(bg);
    bg = null;


}
