/*dom-patch@2.0.1#src/patch/patch*/
define(function (require, exports, module) {
    var patchOptions = require('./patch-options');
    var scheduler = require('../scheduler');
    var markAsInDocument = require('../overrides/util/mark_in_document');
    var overrides = [
        require('../overrides/insert'),
        require('../overrides/remove'),
        require('../overrides/attributes'),
        require('../overrides/prop'),
        require('../overrides/events'),
        require('../overrides/history')
    ];
    exports = module.exports = bind;
    exports.bind = bind;
    exports.unbind = unbind;
    exports.deregister = deregister;
    Object.defineProperty(exports, 'collapseTextNodes', {
        set: function (val) {
            patchOptions.collapseTextNodes = val;
        }
    });
    var listeningDocs = [];
    var overrideTeardowns = [];
    function bind(document, callback) {
        var Node = getNodeConstructor(document);
        if (listeningDocs.indexOf(document) === -1) {
            overrides.forEach(function (override) {
                var res = override(Node, document);
                if (typeof res !== 'undefined') {
                    overrideTeardowns.push(res);
                }
            });
            markAsInDocument(document.documentElement);
            listeningDocs.push(document);
        }
        scheduler.register(callback);
    }
    function getNodeConstructor(document) {
        var tn = document.createElement('div');
        var elementProto = Object.getPrototypeOf(tn);
        var nodeProto = Object.getPrototypeOf(elementProto);
        return nodeProto.constructor;
    }
    function unbind(callback) {
        scheduler.unregister(callback);
    }
    function deregister() {
        overrideTeardowns.forEach(function (fn) {
            fn();
        });
        overrideTeardowns = [];
        listeningDocs = [];
        scheduler.unregister();
    }
});