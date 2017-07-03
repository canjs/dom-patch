/*dom-patch@2.0.4#src/overrides/history*/
var scheduleGlobal = require('../scheduler.js').scheduleGlobal;
module.exports = function () {
    var window = this;
    if (!window.history) {
        var noop = function () {
        };
        window.history = {
            pushState: noop,
            replaceState: noop
        };
    }
    var history = window.history;
    var pushState = history.pushState;
    history.pushState = function (stateObject, title, url) {
        scheduleGlobal({
            type: 'history',
            action: 'pushState',
            args: [
                stateObject,
                title,
                url
            ]
        });
        return pushState.apply(this, arguments);
    };
    return function () {
        history.pushState = pushState;
    };
};