/*dom-patch@2.1.2#src/overrides/util/in_document*/
module.exports = function (node) {
    return !!(node && node.inDocument);
};