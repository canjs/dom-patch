/*dom-patch@2.1.2#src/patch/patch*/
var patchOptions = require('./patch-options.js');
var scheduler = require('../scheduler.js');
var markAsInDocument = require('../overrides/util/mark_in_document.js');
var overrides = [
    require('../overrides/insert.js'),
    require('../overrides/remove.js'),
    require('../overrides/attributes.js'),
    require('../overrides/prop.js'),
    require('../overrides/events.js'),
    require('../overrides/history.js')
];
exports = module.exports = bind;
exports.bind = bind;
exports.unbind = unbind;
exports.deregister = deregister;
exports.flush = scheduler.flushChanges;
Object.defineProperty(exports, 'collapseTextNodes', {
    set: function (val) {
        patchOptions.collapseTextNodes = val;
    }
});
var listeningDocs = [];
var overrideTeardowns = [];
var _over = typeof Symbol === 'function' ? Symbol('_override') : '__patch-override';
function bind(document, callback) {
    var Node = getNodeConstructor(document);
    if (listeningDocs.indexOf(document) === -1) {
        if (!Node[_over]) {
            overrides.forEach(function (override) {
                var res = override(Node, document);
                if (typeof res !== 'undefined') {
                    overrideTeardowns.push(res);
                }
            });
            overrideTeardowns.push(function () {
                Node[_over] = undefined;
            });
        }
        markAsInDocument(document.documentElement);
        listeningDocs.push(document);
    }
    Node[_over] = true;
    scheduler.register(document, callback);
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