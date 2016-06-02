
exports.getParentWindow = function () {

    // Alloy.Globals.logDebug('getParentWindow', this.parent.apiName, this.parent.id);

    var p = this.parent;
    while (p && p.apiName !== 'Ti.UI.Window') {
        // Alloy.Globals.logDebug('getParentWindow loop', p.apiName, p.id);
        p = p.parent;
    }
    // Alloy.Globals.logDebug('getParentWindow', p.apiName, p.id);

    return p;
};