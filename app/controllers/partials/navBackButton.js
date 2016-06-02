
$.label = arguments[0].title || L('back');

function onBeforeClose (e) {
    $.trigger('beforeClose', e);
}
