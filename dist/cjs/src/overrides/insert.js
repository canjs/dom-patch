/*dom-patch@2.0.0#src/overrides/insert*/
var schedule = require('../scheduler.js').schedule;
var nodeRoute = require('node-route');
var markAsInDocument = require('./util/mark_in_document.js');
var inDocument = require('./util/in_document.js');
var patchOpts = require('../patch/patch-options.js');
var serialize = require('../node_serialization.js').serialize;
var DOCUMENT_FRAGMENT_NODE = 11;
module.exports = function (Node) {
    var proto = Node.prototype;
    var appendChild = proto.appendChild;
    proto.appendChild = function (child) {
        var children = getChildren(child);
        var res = appendChild.apply(this, arguments);
        var parent = this;
        children.forEach(function (child) {
            registerForDiff(child, parent);
        });
        return res;
    };
    var insertBefore = proto.insertBefore;
    proto.insertBefore = function (child, ref) {
        var refIndex = nodeRoute.indexOfParent(this, ref);
        var children = getChildren(child, true);
        var res = insertBefore.apply(this, arguments);
        var parent = this;
        children.forEach(function (child) {
            registerForDiff(child, parent, refIndex);
        });
        return res;
    };
    var replaceChild = proto.replaceChild;
    proto.replaceChild = function (newChild, oldChild) {
        var refIndex = nodeRoute.indexOfParent(this, oldChild);
        var children = getChildren(newChild);
        var res = replaceChild.apply(this, arguments);
        var parent = this;
        children.forEach(function (child) {
            registerForDiff(child, parent, refIndex, 'replace');
        });
    };
    return function () {
        proto.appendChild = appendChild;
        proto.insertBefore = insertBefore;
        proto.replaceChild = replaceChild;
    };
};
function registerForDiff(child, parent, refIndex, type) {
    if (inDocument(parent)) {
        markAsInDocument(child);
        nodeRoute.getID(child);
        nodeRoute.purgeSiblings(child);
        schedule(parent, {
            type: type || 'insert',
            node: serialize(child),
            ref: refIndex
        });
    }
}
function nodeParent(child) {
    return child.nodeType === 11 ? child.firstChild && child.firstChild.parentNode : child.parentNode;
}
function getChildren(el, reverse) {
    var children = [];
    if (el.nodeType === 11) {
        var cur = el.firstChild;
        while (cur) {
            if (reverse) {
                children.unshift(cur);
            } else {
                children.push(cur);
            }
            cur = cur.nextSibling;
        }
    } else {
        children.push(el);
    }
    return children;
}