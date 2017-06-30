/*dom-patch@2.0.3#src/overrides/attributes*/
var schedule = require('../scheduler.js').schedule;
var inDocument = require('./util/in_document.js');
module.exports = function (Node, document) {
    var Element = getElementConstructor(document);
    var proto = Element.prototype;
    var setAttribute = proto.setAttribute;
    proto.setAttribute = function (attr, value) {
        var res = setAttribute.apply(this, arguments);
        scheduleIfInDocument(this, attr, value);
        return res;
    };
    return function () {
        proto.setAttribute = setAttribute;
    };
};
function scheduleIfInDocument(node, attributeName, attributeValue) {
    if (inDocument(node)) {
        schedule(node, {
            type: 'attribute',
            attr: attributeName,
            value: attributeValue
        });
    }
}
function getElementConstructor(document) {
    var div = document.createElement('div');
    var elementProto = Object.getPrototypeOf(div);
    return elementProto.constructor;
}