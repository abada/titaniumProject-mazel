(function constructor (args) {
        
    if (args.message && args.message !== '') {
        $.ai.setMessage(args.message);
    }
    
    
})(arguments[0] || {});

$.show = function (msg) {
    
    if (typeof msg === "string") {
        $.ai.message = msg;
    }
    
    $.overlay.show();
};

$.hide = function () {
    $.overlay.hide();
};