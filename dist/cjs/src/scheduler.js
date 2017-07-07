/*dom-patch@2.1.1#src/scheduler*/
var nodeRoute = require('node-route');
var patchOpts = require('./patch/patch-options.js');
var changes = [], globals = [], flushScheduled, documents = {}, currentId = 0;
var nrOptions = { collapseTextNodes: true };
exports.schedule = function schedule(el, data) {
    data.docId = el.ownerDocument._domPatchId;
    var collapseTextNodes = patchOpts.collapseTextNodes;
    if (collapseTextNodes && el.nodeType === 3) {
        var routeInfo = nodeRoute.getRoute(el, nrOptions);
        data.route = routeInfo.id;
        data.value = routeInfo.value;
    } else if (collapseTextNodes) {
        data.route = nodeRoute.getID(el, nrOptions);
    } else {
        data.route = nodeRoute.getID(el);
    }
    changes.push(data);
    exports.scheduleFlush();
};
exports.scheduleGlobal = function scheduleGlobal(data) {
    globals.push(data);
    exports.scheduleFlush();
};
exports.scheduleFlush = function scheduleFlush() {
    if (!flushScheduled) {
        flushScheduled = true;
        setTimeout(exports.flushChanges);
    }
};
exports.flushChanges = function flushChanges() {
    var fn, res, domChanges = Object.keys(documents).reduce(function (obj, id) {
            obj[id] = [];
            return obj;
        }, {});
    globals.forEach(function (data) {
        for (var id in domChanges) {
            domChanges[id].push(data);
        }
    });
    changes.forEach(function (data) {
        domChanges[data.docId].push(data);
        delete data.docId;
    });
    changes.length = 0;
    globals.length = 0;
    flushScheduled = false;
    for (var id in domChanges) {
        var callback = documents[id];
        var arr = domChanges[id];
        if (arr.length > 0) {
            callback(arr);
        }
    }
};
exports.register = function (document, callback) {
    var docId = ++currentId;
    Object.defineProperty(document, '_domPatchId', {
        enumerable: false,
        value: docId
    });
    documents[docId] = callback;
};
exports.unregister = function (document, callback) {
    var argsLen = arguments.length;
    if (argsLen === 0) {
        documents = {};
        changes.length = 0;
        globals.length = 0;
        return;
    }
    delete documents[document._domPatchId];
};