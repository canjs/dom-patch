var schedule = require("../scheduler").schedule;
var inDocument = require("./util/in_document");

var nodeProps = [
	{ prop:"nodeValue", type: "text"},
	{ prop: "value", type: "prop"},
	{ prop: "textContent", type: "prop" }
];

var elementProps = [
	{ prop: "className", type: "prop"}
];

module.exports = function(Node, doc){
	var element = doc.createElement("fake-el"); // unknown el
	var Element = element.constructor;
	var CSSStyleDeclaration = element.style.constructor;
	var teardowns = [];

	watchAll(Node.prototype, nodeProps);
	watchAll(Element.prototype, elementProps);
	watchStyle();

	function watchAll(proto, props) {
		props.forEach(function(prop){
			watchProperty(proto, prop);
		});
	}

	function watchProperty(proto, info) {
		var prop = info.prop;
		var type = info.type;
		var priv = Symbol(`private-${prop}`);
		var desc = Object.getOwnPropertyDescriptor(proto, prop) || {};

		Object.defineProperty(proto, prop, {
			configurable: true,
			enumerable: true,
			get: function(){
				if(desc.get) {
					return desc.get.apply(this, arguments);
				}
				return this[priv];
			},
			set: function(val){
				if(desc.set) {
					desc.set.apply(this, arguments);
				} else {
					this[priv] = val;
				}

				scheduleIfInDocument(this, prop, val, type);
			}
		});

		if(desc) {
			teardowns.push(function(){
				Object.defineProperty(proto, prop, desc);
			});
		}
	}

	function watchStyle() {
		var proto = CSSStyleDeclaration.prototype;
		var prop = "cssText";
		var desc = Object.getOwnPropertyDescriptor(proto, prop) || {};
		Object.defineProperty(proto, prop, {
			configurable: true,
			enumerable: true,
			get: function(){
				return this._cssText;
			},
			set: function(val){
				this._cssText = val;
				desc.set.apply(this, arguments);

				// This is can-simple-dom specific code :(
				// Do we even need this?
				var node = this.__node;

				if(node) {
					scheduleIfInDocument(node, null, val, "style");
				}
			}
		});

		if(desc) {
			teardowns.push(function(){
				Object.defineProperty(proto, prop, desc);
			});
		}
	}

	return function(){
		teardowns.forEach(function(fn){
			fn();
		});
	};
};

function scheduleIfInDocument(node, prop, val, type){
	if(inDocument(node.parentNode)) {
		schedule(node, {
			type: type,
			prop: prop,
			value: val
		});
	}
}
