/*dom-patch@2.1.6#src/overrides/util/in_document*/
define(function (require, exports, module) {
    module.exports = function (node) {
        return !!(node && node.inDocument);
    };
});