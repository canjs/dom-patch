/*dom-patch@2.0.0#src/overrides/util/in_document*/
define(function (require, exports, module) {
    module.exports = function (node) {
        return !!(node && node.inDocument);
    };
});