var Map = require('ti.map'),
    _userPos ,
    _userPosDirty = false,
    _userPosDelta = 0.04,
    _mapLoaded = false,
    _mapRegion = {},
    _firstRegionChangedEvent = true;

/************
 *** INIT ***
 ************/

(function constructor (args) {
    // Alloy.Globals.logDebug('location construct');

    // set hint for text input
    if (args.hintText) {
        $.text.hintText = args.hintText;
    }


    // set default user pos
    // either we receive a position before map is shown
    // or we place him at the default pos
    _userPos = _createUserAnnotation(39.109803, -76.769644, 'Crypto City, MD');// nsaHq
    $.mapview.addAnnotation(_userPos);
    _mapRegion = {
        latitude: _userPos.latitude,
        longitude: _userPos.longitude,
        latitudeDelta: _userPosDelta,
        longitudeDelta: _userPosDelta,
    };
    $.mapview.setRegion(_mapRegion);

    // mark map loaded
    $.mapview.addEventListener('complete', function () {

        // Alloy.Globals.logDebug('map complete');
        _mapLoaded = true;

        // _userPos.fireEvent('click');
        $.mapview.setRegion(_mapRegion);
        $.pricklePin.hide();

    });

    $.mapview.addEventListener('regionchanged', function (e) {

        // Alloy.Globals.logDebug('regionchanged', _firstRegionChangedEvent);

        // first event occurs when map is already centered
        // so we do not need to show the prickle pin
        if (!_firstRegionChangedEvent) {
            $.pricklePin.show();
        }
        _firstRegionChangedEvent = false;


        _mapRegion = {
            latitude: e.latitude,
            longitude: e.longitude,
            latitudeDelta: e.latitudeDelta,
            longitudeDelta: e.longitudeDelta,
        };

    });

    $.mapview.addEventListener('pinchangedragstate', function (e) {

        // Alloy.Globals.logDebug('pinchangedragstate',e.newState, Map.ANNOTATION_DRAG_STATE_END);

        if (e.newState === Map.ANNOTATION_DRAG_STATE_END) {
            _updateUserAnnotation(_userPos.getLatitude(), _userPos.getLongitude());
        }

    });


    $.locationDialog.setOnClickListener(onDialogClose);

})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/

function _updateLocationText () {

    // update text field with address
    if (_userPos.getSubtitle() === L('map_geocoder_loading') || _userPos.getSubtitle() === L('map_geocoder_error')) {
        $.text.value = _userPos.latitude + ', ' + _userPos.longitude;
    } else {
        $.text.value = _userPos.getSubtitle();
    }

}

function _createUserAnnotation (lat, lon, address) {

    return Map.createAnnotation({
        latitude: lat,
        longitude: lon,
        title: L('map_user_position'),
        subtitle: address,
        pincolor:Map.ANNOTATION_RED,
        draggable: true,
        myid: 'user' // Custom property to uniquely identify this annotation.
    });

}

function _updateUserAnnotation (lat, lon, address, update) {

    // Alloy.Globals.logDebug('_updateUserAnnotation');
    if (_userPosDirty) {
        $.mapview.removeAllAnnotations();
        _userPos = _createUserAnnotation(lat, lon, '');
        $.mapview.addAnnotation(_userPos);
    }

    _userPos.setLatitude(lat);
    _userPos.setLongitude(lon);

    // address given
    if (address) {
        _userPos.setSubtitle(address);
    } else {

        _userPos.setSubtitle(L('map_geocoder_loading'));
        Ti.Geolocation.reverseGeocoder(lat, lon, function (response) {
            // Alloy.Globals.logDebug('geo resp', response);
            if (response.success) {
                if (response.places.length > 0) {
                    var result = [];

                    if (response.places[0].city && response.places[0].city !== '') {
                        result.push(response.places[0].city);
                    } else if (response.places[0].street && response.places[0].street !== '') {
                        result.push(response.places[0].street);
                    }

                    if (response.places[0].country_code && response.places[0].country_code !== '') {
                        result.push(response.places[0].country_code);
                    }

                    result = result.join(', ');
                    // Alloy.Globals.logDebug('reverseGeocoder',result, response.places[0]);

                    if (result.trim().length > 0) {
                        _userPos.setSubtitle(result);
                    } else {
                        _userPos.setSubtitle(L('map_geocoder_error'));
                    }
                }
            } else {
                Alloy.Globals.logError('could not reverse geocode user position: ' + response.error);
                _userPos.setSubtitle(L('map_geocoder_error'));
            }
        });

    }

    _mapRegion = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: _userPosDelta,
        longitudeDelta: _userPosDelta,
    };

    if (update === false) {
        // do not update map region
        return;
    }

    // Alloy.Globals.logDebug('_updateUserAnnotation', _mapLoaded, _mapRegion);


    if (_mapLoaded) {
        $.mapview.setLocation(_.extend(_mapRegion,{
            animate: true,
        }));
    } else {
        $.mapview.setRegion(_mapRegion);
    }

}


/****************
 *** LISTENER ***
 ****************/

function onPricklePin () {

    _firstRegionChangedEvent = true;

    // update user pos, request address geocoding (=> null) but prevent map region update (=> false)
    _updateUserAnnotation(_mapRegion.latitude, _mapRegion.longitude, null, false);

    $.pricklePin.hide();

}

function onDialogClose (e) {
    Alloy.Globals.logDebug('dialog close',e.cancel);

    if (e.cancel) {
        return;
    }

    _updateLocationText();

    _firstRegionChangedEvent = true;

    // _userPos = null;
    _userPosDirty = true;
    $.mapview.removeAllAnnotations();

    $.text.blur();

    if (OS_IOS) {
        $.text.fireEvent('blur');
    }

}


/**************
 *** PUBLIC ***
 **************/
$.open = function () {

    $.locationDialog.open();
    // TODO select last location again

    // get user location
    Ti.Geolocation.getCurrentPosition(function (locationResult) {

        Alloy.Globals.logDebug('getCurrentPosition',locationResult);

        if (locationResult.code !== 0) {
            Alloy.Globals.logError('error while receiving current user position: ' + locationResult.error);
            // return; do not return => crash
        }

        // happens on iOS
        if (!locationResult.coords) {
            Alloy.Globals.logError('error while receiving current user position: ' + locationResult.error);
            // update user pin
            _updateUserAnnotation(_userPos.latitude, _userPos.longitude);
            // return; do not return => crash
        }

        // update user pin
        if (!locationResult.error) {
            _updateUserAnnotation(locationResult.coords.latitude, locationResult.coords.longitude);
        }

    });

    if (OS_ANDROID) {
        Ti.UI.Android.hideSoftKeyboard();
    } else if (OS_IOS) {
        // no need to hide keyboard!?
    }
};

$.close = function () {
    $.locationDialog.close();
};

$.getValue = function () {
    //FIXME _userPos is null
    return {
        'latitude': _userPos.latitude,
        'longitude': _userPos.longitude,
        'address': _userPos.getSubtitle(),
    };
};

/**
 *
 * @param {Object} pos {latitude: 0.0, longitude: 0.0, address: 'string'}
 */
$.setValue = function (pos, update) {

    _updateUserAnnotation(pos.latitude, pos.longitude, pos.address);

    if (update !== false) {
        _updateLocationText();
    }

};

$.blur = function () {
    $.text.blur();
};
