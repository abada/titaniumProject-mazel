exports.createButton = function(args) {
    var wrapper = Ti.UI.createView(),
        button, arrow, label;

    wrapper.applyProperties(Alloy.Globals.createStyle(_.extend(args,{
        classes : ['buttonWrapper'],
    })));

    // Alloy.Globals.logDebug('mazel button');

    if (args.title) {
        var cn = ['button'];

        if(args.type === 'facebook'){
           cn.push('facebookButton');
        }

        arrow = Ti.UI.createImageView({
            image: '/images/ico_arrow_right_white.png',
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
            left: '5dp',
        });

        label = Ti.UI.createLabel({
            text: args.title,
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
            color: Alloy.Globals.Color.buttonFont,
        });

        // button = Ti.UI.createButton(Alloy.Globals.createStyle({
        button = Ti.UI.createView(Alloy.Globals.createStyle({
            classes: cn,
            // title: args.title,
        }));

        button.addEventListener('touchstart', function () {
            // Alloy.Globals.logDebug('button touchstart');
            label.color = Alloy.Globals.Color.buttonBackground;
            button.backgroundColor = args.type === 'facebook' ? Alloy.Globals.Color.buttonFacebookSelectedBackground : Alloy.Globals.Color.buttonSelectedBackground;
            arrow.image = '/images/ico_arrow_right_grey.png';
        });

        button.addEventListener('touchcancel', function (e) {   
            label.color = Alloy.Globals.Color.buttonFont;
            button.backgroundColor = args.type === 'facebook' ? Alloy.Globals.Color.buttonFacebookBackground : Alloy.Globals.Color.buttonBackground;
            arrow.image = '/images/ico_arrow_right_white.png'; 
        });
        button.addEventListener('touchend', function (e) {

            label.color = Alloy.Globals.Color.buttonFont;
            button.backgroundColor = args.type === 'facebook' ? Alloy.Globals.Color.buttonFacebookBackground : Alloy.Globals.Color.buttonBackground;
            arrow.image = '/images/ico_arrow_right_white.png';
            
            var r = button.rect;
            // Alloy.Globals.logDebug('touchend',e.x , e.y ,r.width, r.height);
            if (e.x < 0 || e.y < 0 || e.x > r.width * Alloy.Globals.deviceDim.densityFactor || e.y > r.height * Alloy.Globals.deviceDim.densityFactor) {
				return;
			}

            e.isTouchendClick = true;
			button.fireEvent("click", e);
            
        });
        
        button.addEventListener('click', function (e) {
			// stop custom event if click AND touchend event fire
            e.cancelBubble = e.isTouchendClick !== true;            
        });

        var tmp = Ti.UI.createView({
            layout: 'horizontal',
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
        });
        // reverse order !?
        tmp.add(label);
        tmp.add(arrow);

        button.add(tmp);
        wrapper.add(button);

    } else {
        //TODO button module: if no title is given insert view with label etc.
    }

    var overlay = Ti.UI.createView(Alloy.Globals.createStyle({
        classes : ['buttonOverlay'],
    }));


    // overlay.addEventListener('click', function () {
        // button.fireEvent('click');
    // });

    // wrapper.add(overlay);

    return wrapper;

};

exports.createMagicButton = function(args) {
    var wrapper = Ti.UI.createView(),
        image;

    wrapper.applyProperties(Alloy.Globals.createStyle(_.extend(args,{
        classes : ['magicButtonWrapper'],
    })));

    image = Ti.UI.createImageView(Alloy.Globals.createStyle({
        classes: ['magicButton'],
    }));
    
    if (args.game) {
        image.image = "/images/" + args.game + "/ico_game_menu.png";
    }

    wrapper.add(image);

    return wrapper;

};


/**
 * example:
 * XML <ImageButton module="mazel" id="arrowLeft" class="imageBtn" onClick="onShowLastView" />
 * TSS
    images: ['/images/Btn_GO.png', '/images/Btn_GO_hover.png'],
    padding: {top: '10dp', bottom: '10dp', left: 0, right: 0},// all four must be set!
    ...
 * @param {Object} args
 */
exports.createImageButton = function(args) {


    args.width = args.width || Ti.UI.SIZE;
    args.height = args.height || Ti.UI.SIZE;
    args.padding = args.padding || {top: 0, bottom: 0, right: 0, left: 0};

    var view = Ti.UI.createView(args);

    var image0 = Ti.UI.createImageView({
        image: args.images[0],
        top: args.padding.top,
        right: args.padding.right,
        bottom: args.padding.bottom,
        left: args.padding.left,
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
    });

    if (args.images[1]){

	    var image1 = Ti.UI.createImageView({
	        image: args.images[1],
	        top: args.padding.top,
	        right: args.padding.right,
	        bottom: args.padding.bottom,
	        left: args.padding.left,
	        width: Ti.UI.SIZE,
	        height: Ti.UI.SIZE,
	    });
	    view.add(image1);

	    // listeners for touch events
	    view.addEventListener('touchstart',function(){
	        view.children[1].visible = false;
	    });
	    view.addEventListener('touchend',function(){
	        view.children[1].visible = true;
	    });
    }

    // add image0 after image1
    view.add(image0);

    // display title?
    if (args.title) {

    	var l = Ti.UI.createLabel(Alloy.Globals.createStyle({
	        classes: ['imageButtonTitle'],
    	}));

	    // labels use text, buttons use title (!?)
	    args.text = args.title;
	    // apply only some properties to label
	    l.applyProperties( _.pick(args, ['color', 'font', 'text']) );

    	view.add(l);

	    view.setTitle = function (t) {
	    	l.text = t;
	    };

    }


    return view;
};