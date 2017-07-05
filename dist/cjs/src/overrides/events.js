/*dom-patch@2.1.0#src/overrides/events*/
var schedule = require('../scheduler.js').schedule;
var scheduleGlobal = require('../scheduler.js').scheduleGlobal;
var inDocument = require('./util/in_document.js');
module.exports = function (Node) {
    var window = this;
    var proto = Node.prototype;
    var addEventListener = proto.addEventListener;
    proto.addEventListener = function (eventName) {
        if (isNode(this)) {
            var el = this;
            if (!el.__events) {
                el.__events = {};
            }
            el.__events[eventName] = true;
            if (inDocument(el)) {
                schedule(el, {
                    type: 'event',
                    action: 'addEventListener',
                    event: eventName
                });
            }
        }
        return addEventListener.apply(this, arguments);
    };
    var removeEventListener = proto.removeEventListener;
    proto.removeEventListener = function (eventName) {
        if (isNode(this)) {
            var el = this;
            if (el.__events) {
                delete el.__events[eventName];
            }
            if (inDocument(el)) {
                schedule(el, {
                    type: 'event',
                    action: 'removeEventListener',
                    event: eventName
                });
            }
        }
        return removeEventListener.apply(this, arguments);
    };
    var windowAddEventListener = window.addEventListener;
    window.addEventListener = function (evName) {
        scheduleGlobal({
            type: 'globalEvent',
            action: 'add',
            name: evName
        });
    };
    return function () {
        proto.addEventListener = addEventListener;
        proto.removeEventListener = removeEventListener;
        window.addEventListener = windowAddEventListener;
    };
};
function isNode(obj) {
    return obj && !!obj.nodeType;
}