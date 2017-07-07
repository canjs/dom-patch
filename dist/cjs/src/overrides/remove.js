/*dom-patch@2.1.1#src/overrides/remove*/
var schedule = require('../scheduler.js').schedule;
var nodeRoute = require('node-route');
var markAsInDocument = require('./util/mark_in_document.js');
var inDocument = require('./util/in_document.js');
var patchOpts = require('../patch/patch-options.js');
var nrOptions = { collapseTextNodes: true };
module.exports = function (Node) {
    var proto = Node.prototype;
    var removeChild = proto.removeChild;
    proto.removeChild = function (child) {
        var parent = this;
        if (inDocument(parent) && inDocument(child)) {
            markAsInDocument(child, false);
            nodeRoute.purgeSiblings(child);
            nodeRoute.purgeNode(child);
            var opts = patchOpts.collapseTextNodes ? nrOptions : void 0;
            schedule(parent, {
                type: 'remove',
                child: nodeRoute.getID(child, opts)
            });
        }
        return removeChild.apply(this, arguments);
    };
};