/*dom-patch@2.1.6#src/overrides/util/in_document*/
module.exports = function (node) {
    return !!(node && node.inDocument);
};