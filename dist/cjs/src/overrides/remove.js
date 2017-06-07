/*dom-patch@2.0.0#src/overrides/remove*/
var schedule = require('../scheduler.js').schedule;
var nodeRoute = require('node-route');
var markAsInDocument = require('./util/mark_in_document.js');
var inDocument = require('./util/in_document.js');
module.exports = function (Node) {
    var proto = Node.prototype;
    var removeChild = proto.removeChild;
    proto.removeChild = function (child) {
        var parent = this;
        if (inDocument(parent) && inDocument(child)) {
            markAsInDocument(child, false);
            nodeRoute.purgeSiblings(child);
            nodeRoute.purgeNode(child);
            schedule(parent, {
                type: 'remove',
                child: nodeRoute.getID(child)
            });
        }
        return removeChild.apply(this, arguments);
    };
};