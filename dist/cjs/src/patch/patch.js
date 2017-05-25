/*dom-patch@2.0.0-alpha.2#src/patch/patch*/
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