/*dom-patch@2.1.1#src/overrides/prop*/
var schedule = require('../scheduler.js').schedule;
var inDocument = require('./util/in_document.js');
var nodeProps = [
    {
        prop: 'nodeValue',
        type: 'text'
    },
    {
        prop: 'value',
        type: 'prop'
    }
];
var elementProps = [{
        prop: 'className',
        type: 'prop'
    }];
module.exports = function (Node, doc) {
    var element = doc.createElement('fake-el');
    var Element = element.constructor;
    var CSSStyleDeclaration = element.style.constructor;
    watchAll(Node.prototype, nodeProps);
    watchAll(Element.prototype, elementProps);
    watchStyle();
    function watchAll(proto, props) {
        props.forEach(function (prop) {
            watchProperty(proto, prop);
        });
    }
    function watchProperty(proto, info) {
        var prop = info.prop;
        var type = info.type;
        var priv = '_' + prop;
        Object.defineProperty(proto, prop, {
            configurable: true,
            enumerable: true,
            get: function () {
                return this[priv];
            },
            set: function (val) {
                this[priv] = val;
                scheduleIfInDocument(this, prop, val, type);
            }
        });
    }
    function watchStyle() {
        var proto = CSSStyleDeclaration.prototype;
        var desc = Object.getOwnPropertyDescriptor(proto, 'cssText');
        Object.defineProperty(proto, 'cssText', {
            configurable: true,
            enumerable: true,
            get: function () {
                return this._cssText;
            },
            set: function (val) {
                this._cssText = val;
                desc.set.apply(this, arguments);
                var node = this.__node;
                scheduleIfInDocument(node, null, val, 'style');
            }
        });
    }
};
function scheduleIfInDocument(node, prop, val, type) {
    if (inDocument(node.parentNode)) {
        schedule(node, {
            type: type,
            prop: prop,
            value: val
        });
    }
}