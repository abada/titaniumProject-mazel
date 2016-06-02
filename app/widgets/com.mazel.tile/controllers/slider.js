var _value,
    _steps,
    _updateCb,
    _snapToTick = false, _ignoreNextChangeEvent = false,
    _changeEventCnt = 0, _lastStep = -1;

/************
 *** INIT ***
 ************/

(function constructor(args) {
    // Alloy.Globals.logDebug('slider construct');

    if (args.hintText) {
        $.label.text = args.hintText;
    }

    _steps = args.steps;
    _value = args.step;

    _updateCb = args.update;

    // set slider value
    _setSliderValue(_value);

    // add labels to slider
    var labelWrapper,
        labelTick,
        labelText,
        isLastStep = false,
        // helper for centering labels
        alignListener = function (e) {
            // Alloy.Globals.logDebug('alignListener', e.source.children[1].text);
            e.source.transform = Ti.UI.create2DMatrix().translate(-e.source.rect.width/2*Alloy.Globals.deviceDim.densityFactor,0);
            // remove after transform else endless loop
            e.source.removeEventListener('postlayout', alignListener);
        };

    _.each(_steps, function (step, i) {
        // Alloy.Globals.logDebug('step', step, i);

        isLastStep = i === (_steps.length - 1);

        labelWrapper = Ti.UI.createView({
            layout: 'vertical',
            width: Titanium.UI.SIZE,
            height: Titanium.UI.SIZE,
            top: 0,
        });
        $.distanceSliderTicks.add(labelWrapper);

        // set left offset
        if (isLastStep) {
            labelWrapper.right = 0;
        } else {
            labelWrapper.left = i * (100 / (_steps.length-1)) + '%';
        }

        // add align listener (except for first and last)
        if (i !== 0 && !isLastStep) {
            labelWrapper.addEventListener('postlayout', alignListener);
        }


        // small tick
        labelTick = Ti.UI.createView({
            height: '10dp',
            width: '2dp',
            backgroundColor: Alloy.Globals.Color.mainFont,
        });

        if (isLastStep) {
            labelTick.right = 0;
        }

        labelWrapper.add(labelTick);

        // tick label
        labelText = Ti.UI.createLabel({
            font: {
                fontSize: '8dp',
            },
            color: Alloy.Globals.Color.mainFont,
            text: step,
            width: Titanium.UI.SIZE,
            height: Titanium.UI.SIZE,
        });
        labelWrapper.add(labelText);

    });



})(arguments[0] || {});

/***************
 *** PRIVATE ***
 ***************/


function _setSliderValue (i) {
        if (i <= 0) {
            i = 0;
            $.distanceSlider.setValue(0);
        } else {
            $.distanceSlider.setValue(i / (_steps.length - 1) * $.distanceSlider.getMax());
        }

        _value = i;

        _updateCb(_steps[_value], _value);

}


/****************
 *** LISTENER ***
 ****************/


/**
 * Update distance label on slider changes
 * @param {Event} e The event triggered by the change
 */
function onChangeDistanceSlider(e) {

    _changeEventCnt++;
    // Alloy.Globals.logDebug('onChangeDistanceSlider', this.value, _changeEventCnt);

    if (_snapToTick) {

        // ignore event (first event after touchend, triggered manually, slider value not yet updated)
        if(_ignoreNextChangeEvent) {
            // Alloy.Globals.logDebug('onChangeDistanceSlider', this.value, _changeEventCnt, 'ignored');
            _ignoreNextChangeEvent = false;
            return;
        }

        // calc nearest tick value
        var val_norm = this.value / this.max,
            i = Math.round(val_norm * (_steps.length - 1)),
            step = _steps[i],
            val_step = i * (1 / (_steps.length - 1)) * this.max;

        // reset event count (two change events will be triggered by the slider update)
        _changeEventCnt = -2;
        _setSliderValue(i);
        // $.distanceSlider.value = val_step;

        // Alloy.Globals.logDebug('onChangeDistanceSlider', this.value, _changeEventCnt, step, _lastStep, 'snapToTick');
        // snapping done, no further action required
        _snapToTick = false;
        return;
    }


    // define nearest label from slider value
    var val_norm = this.value / this.max,
        i = Math.round(val_norm * (_steps.length - 1)),
        step = _steps[i];

    // Alloy.Globals.logDebug('onChangeDistanceSlider', this.value, _changeEventCnt, step, _lastStep);

    // only update if we didn't update already
    if (_lastStep !== step) {
        // Alloy.Globals.logDebug('***updateDistanceLabel***', step, step*1000);

        _updateCb(step, i);

        // $.distanceLabel.text = step;
        _lastStep = step;


    }

}

/**
 * Snap slider handle to next slider step value
 * @param {Event} e The event triggered by lifting the finger
 */
function onTouchendDistanceSlider(e) {

    // Alloy.Globals.logDebug('ontouchend', this.value, _changeEventCnt);

    // is it a "click" event rather than a "slide" (finger movement) event
    // for Android especially (only!?)
    if(_changeEventCnt <= 2){
        _ignoreNextChangeEvent = true;
    }
    _changeEventCnt = -2;

    // tell change listener to snap to nearest tick
    _snapToTick = true;

    // trigger slider update
    $.distanceSlider.fireEvent('change');
}

/**************
 *** PUBLIC ***
 **************/

$.getValue = function () {
    return {
        i: _value,
        step: _steps[_value],
    };
};

/**
 *
 * @param {Number} step One of the values passed in "steps" parameter
 */
$.setValue = function (step, update) {

    var idx = 3;
    _.find(_steps, function (s, i) {
        if (s === step) {
            idx = i;
            return true;
        }
        return false;
    });

    _setSliderValue(idx);

};
