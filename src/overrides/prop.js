var schedule = require("../scheduler").schedule;
var inDocument = require("./util/in_document");

var nodeProps = [
	{ prop:"nodeValue", type: "text"},
	{ prop: "value", type: "prop"}
];

var elementProps = [
	{ prop: "className", type: "prop"}
];

module.exports = function(Node, doc){
	var element = doc.createElement("fake-el"); // unknown el
	var Element = element.constructor;

	watchAll(Node.prototype, nodeProps);
	watchAll(Element.prototype, elementProps);

	function watchAll(proto, props) {
		props.forEach(function(prop){
			watchProperty(proto, prop);
		});
	}

	function watchProperty(proto, info) {
		var prop = info.prop;
		var type = info.type;
		var priv = "_" + prop;

		Object.defineProperty(proto, prop, {
			configurable: true,
			enumerable: true,
			get: function(){
				return this[priv];
			},
			set: function(val){
				this[priv] = val;

				scheduleIfInDocument(this, prop, val, type);
			}
		});
	}
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
