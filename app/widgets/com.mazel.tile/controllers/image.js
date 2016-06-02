var _image,
    _mimeType,
    _filename,
    _successCb,
    _cancelCb,
    _errorCb;

/************
 *** INIT ***
 ************/

(function constructor(args) {
    // Alloy.Globals.logDebug('image construct');

    // set image
    if (args.image) {
        $.image.image = args.image;
    }

    // set hint text
    if (args.hintText) {
        $.label.text = args.hintText;
    }

    _successCb = args.success;
    _cancelCb = args.cancel;
    _errorCb = args.error;

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

/****************
 *** LISTENER ***
 ****************/


/**************
 *** PUBLIC ***
 **************/
$.open = function() {

    Titanium.Media.openPhotoGallery({

        success : function(event) {
            var cropRect = event.cropRect,
                image;

            // crop image if user defined a crop rect
                // Alloy.Globals.logDebug('crop', cropRect, event.media.width, event.media.height);
            // if (cropRect.width != event.media.width || cropRect.height != event.media.height) {
                // Alloy.Globals.logDebug('event', event);
                // image = event.media.imageAsCropped(cropRect);
                // Alloy.Globals.logDebug('cropped image', image.height, image.width);
            // } else {
                // image = event.media;
            // }
            image = event.media;

            /*
             * scale image down
             */
            if (image.height <= image.width && image.width >= 1024) {//landscape/square and too big

                _image = image.imageAsResized(1024, image.height * 1024.0 / image.width);

            } else if (image.width < image.height && image.height >= 1024) {//portrait and too big

                _image = image.imageAsResized(image.width * 1024.0 / image.height, 1024);

            } else {
                // do nothing

                // TODO show warning if picture is too small!?
                _image = image;
            }

            // information gets lost by resizing
            _mimeType = image.mimeType;
            _filename = image.file ? image.file.name : image.length + '.png';

            // Alloy.Globals.logDebug('gallery success', image.height, image.width, _image.height, _image.width, $.image.rect.height);
            delete image;
            delete event.media;

            // set image view
            // Alloy.Globals.logDebug('thumbnail size', $.image.rect.height , Alloy.Globals.deviceDim.densityFactor, $.image.rect.height * Alloy.Globals.deviceDim.densityFactor);
            // Alloy.Globals.logDebug('thumbnail lenght',  _image.imageAsThumbnail($.image.rect.height * Alloy.Globals.deviceDim.densityFactor).length);
            $.image.image = _image.imageAsThumbnail($.image.rect.height * Alloy.Globals.deviceDim.densityFactor);

            if (typeof _successCb === 'function') _successCb();

        },
        cancel : function() {

            if (typeof _cancelCb === 'function') _cancelCb();

        },
        error : function(error) {

            if (typeof _errorCb === 'function') _errorCb();
            Alloy.Globals.logError(JSON.stringify(error));
        },
        allowEditing : true,
        mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
    });
};

$.getValue = function() {
    return {
        blob: _image,
        mime: _mimeType,
        name: _filename,
    };
};

$.setValue = function(dict, update) {
    _image = dict.blob;
    _mimeType = dict.mime;
    _name = dict.name;

    if (update !== false) {
        $.image.image = _image.imageAsThumbnail($.image.rect.height * Alloy.Globals.deviceDim.densityFactor);
    }
};

$.blur = _cancelCb;
