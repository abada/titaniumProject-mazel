exports.createHeartbeatAnimation = function (args) {
	var _id = args.id,
		_isHbUp1 = true,
		_timeoutId = -1,
		_label,
		_hbUp1 = Ti.UI.createAnimation({
			opacity: 1,
			duration: 100,
		}),
		_hbUp2 = Ti.UI.createAnimation({
			opacity: 0.7,
			duration: 100,
		}),
		_hbDown = Ti.UI.createAnimation({
			opacity: 0,
			duration: 200,
		}),		
		_labelContainer = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			left: Alloy.Globals.Layout.globalMarginLeftLarge,
			right: Alloy.Globals.Layout.globalMarginRightLarge,
			bottom: Alloy.Globals.Layout.globalMarginBottomLarge,
			visible: false,
		}),
		_colorIcon = Ti.UI.createImageView({//color
			image: "/images/splashAnimation/splashAnimation01.png",
			opacity: 1,
		});;	
	
	
	/***************
	 *** PRIVATE ***
	 ***************/
	
	function _doHbUp () {
		Alloy.Globals.logDebug(_id,"_doHbUp");
		if(_isHbUp1){
			_timeoutId = setTimeout(function () {
				_colorIcon.animate(_hbUp2);
			}, 150);		
		} else {
			_timeoutId = setTimeout(function () {
				_colorIcon.animate(_hbUp1);
			}, 800);
		}
		_isHbUp1 = !_isHbUp1;	
	}
	function _doHbDown () {
		Alloy.Globals.logDebug(_id,"_doHbDown");
		_colorIcon.animate(_hbDown);
			
	}
		
	function _start (delay) {
		Alloy.Globals.logDebug(_id,"_start");
		
		_hbUp1.addEventListener("complete", _doHbDown);
		_hbUp2.addEventListener("complete", _doHbDown);
		_hbDown.addEventListener("complete", _doHbUp);
		
		_colorIcon.opacity = 1;
		
		// hide it initially
		_colorIcon.animate({
			opacity: 0,
			duration: 300,
		});
		
		// a -> b
		_isHbUp1 = true;
		_timeoutId = setTimeout(function () {
			_colorIcon.animate(_hbUp1);
		}, delay ? delay : 1000);
		
	};
	function _stop () {
		Alloy.Globals.logDebug(_id,"_stop");
		clearTimeout(_timeoutId);
		
		_hbUp1.removeEventListener("complete", _doHbDown);
		_hbUp2.removeEventListener("complete", _doHbDown);
		_hbDown.removeEventListener("complete", _doHbUp);
	};
	//TODO update heartbeat frequency
	function _updateFrequency (f) {
		
	};
	
	function _updateMessage (msg) {
		_labelContainer.show();
		_labelContainer.children[0].children[0].text = msg;
	};
	
	/************
	 *** INIT ***
	 ************/
	
	var main = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			// backgroundColor: "teal",
		}),
		wrapper = Ti.UI.createView({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
		}),
		labelWrapper = Ti.UI.createView({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
	    	backgroundColor: Alloy.Globals.Color.tabBarBackground,
		}),		
		label = Ti.UI.createLabel({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
			top: "5dp",
			left: "5dp",
			right: "5dp",
			bottom: "5dp",
			font:{
		        fontSize: '15dp',
		        fontFamily: 'Arapey-Regular',
		    },
		    color: Alloy.Globals.Color.tabBarButtonFont,
		    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		}),
		grey = Ti.UI.createImageView({//grey
			image: "/images/splashAnimation/splashAnimation00.png",
			opacity: 1,
		});
		
	// add icons	
	wrapper.add(grey);
	wrapper.add(_colorIcon);
	
	// add label
	labelWrapper.add(label);
	_labelContainer.add(labelWrapper);
	main.add(_labelContainer);
	
	main.add(wrapper);
	
	main.start = _start;
	main.stop = _stop;
	main.updateMessage = _updateMessage;
	
	wrapper = null;
	labelWrapper = null;
	label = null;
	grey = null;
	
	return main;
};
