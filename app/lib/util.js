
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * @param {int} min lower border of range (inclusive)
 * @param {int} max upper border of range (inclusive)
 */
exports.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random string of the given length
 * @param {int} length Length of returned string (32)
 * @return {String} Random string
 */
exports.randomString = function (length) {

	length = length === undefined ? 32 : length;

	//characters
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',
		chars_l = chars.length-1,
		string = chars[exports.getRandomInt(0,chars_l)],
		r, r_old = string;

	// Generate random string
	for (var i = 1; i < length; i++)
	{
		// Grab a random character from our list
		r = chars[exports.getRandomInt(0,chars_l)];

		// Make sure the same two characters don't appear next to each other
		while(r == r_old){
			r = chars[exports.getRandomInt(0,chars_l)];
		}

		r_old = r;
		string +=  r;
	}

	// Return the string
	return string;
};

/**
 * Return equivalent for given kilometers in decimal degrees (at given latitude)
 * @param {float} km
 * @param {float} lat Latiude in degrees
 */
exports.km2deg = function (km, lat) {
    return km / (111.32 * Math.cos(exports.deg2rad(lat)));
};

/**
 * Transforms from degrees to radians
 * @param {float} deg Degrees
 */
exports.deg2rad = function (deg) {
    return Math.PI / 180 * deg;
};

/**
 * Get bounds in degrees for the given width and height at the given latitude
 * @param {Object} w Width in km
 * @param {Object} h Height in km
 * @param {Object} lat Latitude in degrees
 */
exports.getBounds = function (w, h, lat) {
    return {
        latitude: exports.km2deg(w, lat),
        longitude: exports.km2deg(h, 0),
    };
};



exports.writeCachedImage = function (filename, blob) {

    var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'cachedImages');
    if (!dir.isDirectory()) {
        Alloy.Globals.logInfo('writeCachedImage: create "cachedImages" directory');
        var success = dir.createDirectory();
    }

    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'cachedImages', filename);
    Alloy.Globals.logDebug('caching image: ' + file.nativePath);
    return file.write(blob);
};

exports.readCachedImage = function (filename) {

    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'cachedImages', filename);

    if (file.exists()) {
        return file.read();
    }
    return null;
};

/**
 * Return cropped/scaled version of given image that fits the given dimensions
 * @param {String} filename Filename of image (resides in Resources directory after compiling)
 * @param {Object} rect Dimension dictionary
 */
exports.getBackgroundImage = function (filename, rect) {

    Alloy.Globals.logDebug('getBackgroundImage', filename, rect);
    
    if (rect.height == 0 || rect.width == 0) {
        Alloy.Globals.logError('getBackgroundImage: illegal dimensions (' + rect.width + 'x' + rect.height + ')'); 
        return null;
    }

    var idx = filename.lastIndexOf('.'),
        cacheFilename = filename.substring(0, idx) + rect.width + 'x' + rect.height + filename.substring(idx),
        cacheFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'cachedImages', cacheFilename),
        origFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, filename),
        rectIsLandscape = rect.width > rect.height;

    if (cacheFile.exists()) {
        Alloy.Globals.logInfo('getBackgroundImage: return cache image, ' + cacheFile.nativePath);
        return cacheFile.nativePath;
    }

    if (!origFile.exists()) {
        Alloy.Globals.logError('getBackgroundImage: file not found ("' + origFile.nativePath + '")');
        return null;
    }

    var origBlob = origFile.read();
    if (origBlob.height == 0 || origBlob.width == 0) {
        Alloy.Globals.logError('getBackgroundImage: illegal file dimensions (' + origBlob.width + 'x' + origBlob.height + ')');
        return null;
    }
        
    var origIsLandscape = origBlob.width > origBlob.height,
        sx = rect.width / origBlob.width,// horizontal scale factor
        sy = rect.height / origBlob.height; // vertical scale factor

    Alloy.Globals.logDebug('getBackgroundImage sx/sy', sx, sy, origBlob.width, origBlob.height);

    if (sx * origBlob.height < rect.height) {// new height would be smaller than rect.height
        // scale by sy

        // scale proportionally by sx and crop centered to rect
        exports.writeCachedImage(cacheFilename,
            origBlob
            /*resize proportionally*/
            .imageAsResized(origBlob.width * sy, origBlob.height * sy)
            /*crop height*/
            .imageAsCropped({x: (sy*origBlob.width-rect.width)/2, y: 0, width: rect.width, height: rect.height,})
        );

    } else { // new height is greater than rect.height

        // Alloy.Globals.logDebug('getBackgroundImage new w/h', origBlob.width * sx, origBlob.height * sx);
        // Alloy.Globals.logDebug('getBackgroundImage crop', {x: 0, y: (sx*origBlob.height-rect.height)/2, width: rect.width, height: rect.height,});

        // scale proportionally by sx and crop centered to rect
        exports.writeCachedImage(cacheFilename,
            origBlob
            /*resize proportionally*/
            .imageAsResized(origBlob.width * sx, origBlob.height * sx)
            /*crop height*/
            .imageAsCropped({x: 0, y: (sx*origBlob.height-rect.height)/2, width: rect.width, height: rect.height,})
        );

    }

    delete origBlob;

    return cacheFile.nativePath;


};

/**
 * @param {Object} options Dictionary with keys url, filename, success, error  
 */
exports.cacheRemoteImage = function (options) {
            
    Alloy.Globals.logDebug('caching remote image', options);
    
    var xhr = Titanium.Network.createHTTPClient({
        onload: function(e) {
            // function called in readyState DONE (4)
            Alloy.Globals.logDebug('remote image cache: onload called, readyState = '+this.readyState);
            
            exports.writeCachedImage(options.filename, this.responseData);
            
            options.success();
                       
            
        },
        onerror: function(e) {
            // function called in readyState DONE (4)
            Alloy.Globals.logDebug('remote image cache: onerror called, readyState = '+this.readyState);
            
            options.error(e);
        },
        /*
        ondatastream: function(e) {
            // function called as data is downloaded
            Alloy.Globals.logDebug('remote image cache: ondatastream called, readyState = '+this.readyState,e.progress);
        },
        onsendstream: function(e) {
            // function called as data is uploaded
            Alloy.Globals.logDebug('remote image cache: onsendstream called, readyState = '+this.readyState,e.progress);
        },
        */
        timeout: 20000
    });
    xhr.open('GET',options.url);
    xhr.send();
    
    xhr = null;    
    
};





/*
 * create the XORed version of public key as follows
 * var xor = xorEncode('mykey','mypass');
 * var xorChars = string2Chars(xor);
 * console.log(printCharArray(xorChars));
 *
 * re-create your key again
 * var xorChars = [29,32,45,...];
 * var xor = chars2String(xorChars);
 * var key = xorEncode(xor, 'mypass');
 */
exports.xorEncode = function (txt, pass) {
  var ord = [
  ];
  var buf = '';
  for (z = 1; z <= 255; z++) {
    ord[String.fromCharCode(z)] = z;
  }
  for (j = z = 0; z < txt.length; z++) {
    buf += String.fromCharCode(ord[txt.substr(z, 1)] ^ ord[pass.substr(j, 1)]);
    j = (j < pass.length) ? j + 1 : 0;
  }
  return buf;
};
exports.chars2String = function (chars) {
  var s = '';
  for (var z = 0; z < chars.length; z++) {
    s += String.fromCharCode(chars[z]);
  }
  return s;
};
/*
exports.string2Chars = function(string){
    var s = [];
    for (var z = 0; z < string.length; z++) {
    s.push(string.charCodeAt(z));
  }
  return s;
};
exports.printCharArray = function(chars){
    var s = '[' + chars[0];
    for (var z = 1; z < chars.length; z++) {
    s+= ',' + chars[z];
  }
  return s + ']';
};
*/



exports.iosKeyboardNavigation = function(controllers, returnKeyType) {
    if (OS_IOS) { // this constant is only for Alloy
        for (var i = 0; i < controllers.length; i++) {
            var current = controllers[i], 
            	nextIndex = i + 1,
                nextController = controllers.length > nextIndex ? controllers[nextIndex] : null;
               
            // Alloy.Globals.logDebug(current.id, nextIndex, nextController ? nextController.id : null);
            
            current.returnKeyType = returnKeyType || Titanium.UI.RETURNKEY_NEXT;
            current.nextController = nextController;
            
            current.addEventListener('return', function() {
            	// Alloy.Globals.logDebug(this.nextController ? this.nextController.id : null);
			    if (this.nextController) {
			    	// for inputs with property "editable" set to false the focus() method does not trigger the "focus" event
			    	if (this.nextController.editable === false) {
	                    this.nextController.fireEvent("focus",{
	                    	source: this.nextController,
	                    });		    		
			    	} else {
	                    this.nextController.focus();		    		
			    	}
                } else {
                    this.blur();
                }
			});

        };
    };
};

exports.fitTextInLabel = function(label,options)
{
    /*
     * Make the given text fit in the label by, well, just trying. Run this when the layout is complete
     * IE in the onPostlayout of the view or the label. When using the cache-feature don't forget to 
     * check for orientation in creating the cache key: otherwise the font size will not be recalculated for the other orientation
     * This is an alloy function: it requires underscore.js But rewriting it for plain titanium is not a big deal.
     * Spin in het Web - www.spininhetweb.nl - Contact us for questions. Yes we build apps.
     * 
     * Label: the Ti.UI.Label to fit the text in
     * Options: an options object:
     *  text: the text to fit. When not given we will use the current text of the label. Use a lorum ipsum that's big enough.
     *  fitWidth: which width to fit the text in. Either the fixed width of the label ("current") or that of the parent ("parent"). When
     *            width is Ti.UI.SIZE use "parent". Default: current.
     *  fitHeight: which height to fit the text in. "current" or "parent". Default: current
     *  marginVertical: space to keep vertically. Will use marginVertical / 2 for top and bottom. Default: 0
     *  marginHorizontal: space to keep horizontally. Will use marginHorizontal / 2 for left and right. Default: 0
     *  cacheKey: string. When given, use caching. We will save the found fontsize as a persistant property. When called again with the same key
     *                   we will not calculute, but just set the fontsize. The cache is only cleared when the user removes the app or its data
     *                  We add the device orientation to the cacheKey, so we automatically differentiate between setting for portrait and landscape
     *  applyTo: array of labels. When given, we will set the same fontsize on the given labels. 
     *  callback: function. When given, we will call this after setting the fontsize on the label. The prototype for the callback function is:
     *                    fn(Ti.UI.Label lbl, int newFontSize)
     * 
     * RETURNS boolean. False on some error, true when everything started out okay. 
     * 
     * This function runs on the event engine so it is basically async. After calling it, the font will not be changed until the callback runs
     */

    //defaults
    var o =
    {
        text: false,
        fitWidth: "current",
        fitHeight: "current",
        marginVertical: 0,
        marginHorizontal: 0,
        cacheKey: false,
        deleteCache: false, //special for development: set to true to recache without using the old value
        callback: false,
        applyTo: [],
        fontSize: 40,
    };

    if (typeof(options) == "object")
    {
        _.each(options, function(v,k)
        {
            o[k] = v;
        });
    }
    //o now contains all the chosen options plus defaults for the rest

    //add orientation to the cachekey
    if (o.cacheKey)
    {
        o.cacheKey = o.cacheKey + "_" + Ti.Gesture.orientation; //int
    }

    //log("*** fitTextInLabel label " + label.id + " tekst " + (o.text ? o.text : "(origineel)"),o);

    var font = _.clone(label.font); 

    //cache?
    if (o.cacheKey && (! o.deleteCache))
    {
        var cached = Ti.App.Properties.getInt(o.cacheKey,0);
        if (cached)
        {
            font.fontSize = cached;
            label.setFont(font);
            // Alloy.Globals.logDebug("*** Cached op key " + o.cacheKey + " fontSize: " + cached);
            _.each(o.applyTo,function(otherlabel)
            {
                //just set the font
                var f = otherlabel.font;
                f.fontSize = cached;
                otherlabel.setFont(f);
            });
            //callback
            if (o.callback)
            {
                o.callback(label,cached);
            }
            return; //done
        }
    }

    //find the fontsize that fits in the label
    //we use a different label outside of the view, to check it
    var labelsize = label.getSize();
    var parentsize = label.parent.getSize();

    //which width and height to use?
    var maxw = (o.fitWidth == "parent" ? parentsize : labelsize).width - (o.marginHorizontal / 2);
    var maxh = (o.fitHeight == "parent" ? parentsize : labelsize).height - (o.marginVertical / 2);

    //log("*** Moet passen in " + maxw + " X " + maxh);

    font.fontSize = o.fontSize; //beginnen we mee, kan hoger en lager
    var starting = true; //voor als we omhoog moeten

    //create the test label in the parent container, using a postLayout callback for checking the fit
    var testl = Ti.UI.createLabel({
        text: (o.text ? o.text : label.getText()),
        width: label.wordWrap ? maxw : Ti.UI.SIZE, //when wrapping, use a fixed with, otherwise just see how big it becomes
        height: Ti.UI.SIZE, //we want to measure the height after setting the font size
        wordWrap: label.wordWrap, //copy the wordWrap from the real label
        font: font,
        top: -5000 //somewhere out of view please (does this create scrollbars?)
    });

    var done = false;
    var onPostLayout = 
        function()
        {
            //called when the test label is relayout because of the font change, so let's see how it all fits now
            if (done)
            {
                return;
            }
            var lsize = testl.getSize();
            // Alloy.Globals.logDebug("*** Proberen " + font.fontSize,lsize);
            //We declare it a fit when the font becomes to small, fits inside the height of a wrapping label
            //or fits inside the height AND width of a nonwrapping label
            if (font.fontSize == 5 || (lsize.height <= maxh && (label.wordWrap || lsize.width < maxw)))
            {
                //it fits!
                //did we startup with a too small font?
                if (starting)
                {
                    //the fontsize we started with fits. So let's try something bigger
                    font.fontSize += 10;
                    testl.setFont(font);
                }
                else
                {
                    //we found it: it fits the space or is so small we stop trying
                    //log("*** Past!");
                    done = true; //stop the postLayout eventloop
                    label.setFont(font); //set the font
                    testl.parent.remove(testl);
                    testl = null; //garbace collect
                    if (o.cacheKey)
                    {
                        //let's cache this value
                        //log("*** Cachen naar " + o.cacheKey + ": " + font.fontSize);
                        Ti.App.Properties.setInt(o.cacheKey,font.fontSize);
                    }
                    //set the font for the applyTo array
                    _.each(o.applyTo,function(otherlabel)
                    {
                        //just set the font
                        var f = otherlabel.font;
                        f.fontSize = font.fontSize;
                        otherlabel.setFont(f);
                    });

                    //and callback
                    if (o.callback)
                    {
                        o.callback(label,font.fontSize);
                    }
                }
            }
            else
            {
                //no fit yet. Let's try a pixel smaller
                font.fontSize--;
                testl.setFont(font); //this will fire a new postLayout event, running this function again
                starting = false; //we are no longer starting up. When we find a fit, it's what we'll use
            }
        };

    //let's go
    testl.addEventListener("postlayout",onPostLayout);  
    label.parent.add(testl);
    return true;
};


exports.count = 1;