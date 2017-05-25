/*dom-patch@2.0.0-alpha.2#src/scheduler*/
define(function (require, exports, module) {
    (function (global) {
        var nodeRoute = require('node-route');
        var changedRoutes = {}, changes = [], globals = [], flushScheduled, callbacks = [];
        exports.schedule = function schedule(el, data) {
            var route = nodeRoute.getID(el);
            data.route = route;
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
            changedRoutes = {};
            changes.length = 0;
            globals.length = 0;
            callbacks.forEach(function (cb) {
                cb(domChanges);
            });
            flushScheduled = false;
        };
        exports.register = function (callback) {
            callbacks.push(callback);
        };
        exports.unregister = function (callback) {
            if (arguments.length === 0) {
                callbacks = [];
                changedRoutes = {};
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