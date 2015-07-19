var schedule = require("../scheduler").schedule;
var inDocument = require("./util/in_document");

var interestingProps = [
	{ prop:"nodeValue", type: "text"},
	{ prop: "value", type: "prop"},
	{ prop: "className", type: "prop"}
];

module.exports = function(Node){
	interestingProps.forEach(watchProperty);

	function watchProperty(info) {
		var prop = info.prop;
		var type = info.type;
		var priv = "_" + prop;

		Object.defineProperty(Node.prototype, prop, {
			get: function(){
				return this[priv];
			},
			set: function(val){
				this[priv] = val;

				scheduleIfInDocument(this, prop, val, type);
			},
			configurable: true
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
