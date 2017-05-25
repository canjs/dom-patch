/*dom-patch@2.0.0-alpha.2#src/overrides/util/in_document*/
module.exports = function (node) {
    return !!(node && node.inDocument);
};