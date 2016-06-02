var Utils = require('util'),
    Map = require('ti.map'),
    user = Alloy.Models.instance('User'),
    defaultDistance;

/************
 *** INIT ***
 ************/

// $.scrollView.addEventListener('postlayout', onOpened);

    defaultDistance = $.distance.getValue().step;
    //step like defined in tss

    var coords = user.get('coords'),
        bounds = Utils.getBounds(defaultDistance, defaultDistance, coords.latitude);

    // set height of map to 1/2 of width
    $.mapview.setHeight(Alloy.Globals.deviceDim.width / 2 / Alloy.Globals.deviceDim.densityFactor);

    // make sure map bounds match default circle radius
    $.mapview.setRegion({
        latitude : coords.latitude,
        longitude : coords.longitude,
        latitudeDelta : bounds.latitude * 2,
        longitudeDelta : bounds.longitude * 2,
    });

    // distance visualisation
    var circle = Map.createCircle({
        center : {
            latitude : coords.latitude,
            longitude : coords.longitude,
        },
        radius : defaultDistance * 1000,
        strokeColor : Alloy.Globals.Color.mapCircleStroke,
        fillColor : Alloy.Globals.Color.mapCircleFill,
    });
    $.mapview.addCircle(circle);

    // user position pin
    var annotation = Map.createAnnotation({
        latitude : coords.latitude,
        longitude : coords.longitude,
        pincolor : Map.ANNOTATION_RED,
    });
    $.mapview.addAnnotation(annotation);

    // set gender options
    $.gender.setOptions(Alloy.Models.instance('User').getGenderOptions());



/***************
 *** PRIVATE ***
 ***************/

/**
 * Show an error message and highlight given input field
 * @param {Ti.UI.TextField} input Input field to highlight
 * @param {String} msg Message to show
 */
function _showErrorMsg(tile, msg) {
    $.messageArea.errorMessage(msg);

    if (tile) {
        tile.error();
    }
}

/*****************
 *** LISTENERS ***
 *****************/

/**
 * Synchronize inputs with parse backend
 */
function onSavePreferences() {

    var gender = $.gender.getValue(),
        ageRange = $.ageRange.getValue(),
        distance = $.distance.getValue().step;

    Alloy.Globals.logDebug('***onSavePreferences***', gender, ageRange, distance);

    // validate matching preferences before saving
    if (gender === undefined) {
        _showErrorMsg($.gender, L('error_not_empty'));
        return;
    }

    if (!ageRange) {
        _showErrorMsg($.ageRange, L('error_not_empty'));
        return;
    }

    $.activityIndicator.show();

    var userMatchingPreference = Alloy.Models.instance('UserMatchingPreference');
    userMatchingPreference.set({
        'user' : {
            '__type' : 'Pointer',
            'className' : '_User',
            'objectId' : user.get('objectId'),
        },
        'distance' : distance,
        'gender' : $.gender.getValue(),
        'ageFrom' : ageRange.from,
        'ageTo' : ageRange.to,
    });

    userMatchingPreference.save({}, {
        error : function(model, err, options) {
            $.activityIndicator.hide();
            // TODO handle error when saving matching prefs (e.g. user)
            _showErrorMsg(null, err.error);
        },
        success : function(model, preference) {

            // $.preferences.close();
            $.trigger('success');

            $.activityIndicator.hide();

        }
    });

    userMatchingPreference = null;
}

function onUpdateDistance(e) {
    // Alloy.Globals.logDebug('onUpdateDistance', e.step, e.i, coords);

    if (OS_ANDROID) {
        circle.radius = e.step * 1000;
    } else {
        $.mapview.removeCircle(circle);
        circle = Map.createCircle({
            center : {
                latitude : coords.latitude,
                longitude : coords.longitude,
            },
            radius : e.step * 1000,
            strokeColor : Alloy.Globals.Color.mapCircleStroke,
            fillColor : Alloy.Globals.Color.mapCircleFill,
        });
        $.mapview.addCircle(circle);
    }

    var bounds = Utils.getBounds(e.step, e.step, coords.latitude);

    // make sure map bounds match default circle radius
    $.mapview.setRegion({
        latitude : coords.latitude,
        longitude : coords.longitude,
        latitudeDelta : bounds.latitude * 2,
        longitudeDelta : bounds.longitude * 2,
    });

}

function onOpened(e) {

    $.scrollView.removeEventListener('postlayout', onOpened);
    
}
