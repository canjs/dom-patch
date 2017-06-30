/*dom-patch@2.0.3#src/scheduler*/
define(function (require, exports, module) {
    (function (global) {
        var nodeRoute = require('node-route');
        var patchOpts = require('./patch/patch-options');
        var changes = [], globals = [], flushScheduled, callbacks = [];
        var nrOptions = { collapseTextNodes: true };
        exports.schedule = function schedule(el, data) {
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
            var domChanges = [], fn, res;
            globals.forEach(function (data) {
                domChanges.push(data);
            });
            changes.forEach(function (data) {
                domChanges.push(data);
            });
            changes.length = 0;
            globals.length = 0;
            flushScheduled = false;
            callbacks.forEach(function (cb) {
                cb(domChanges);
            });
        };
        exports.register = function (callback) {
            callbacks.push(callback);
        };
        exports.unregister = function (callback) {
            if (arguments.length === 0) {
                callbacks = [];
                changes.length = 0;
                globals.length = 0;
                return;
            }
            var idx = callbacks.indexOf(callback);
            if (idx >= 0) {
                callbacks.splice(idx, 1);
            }
        };
    }(function () {
        return this;
    }()));
});