var schedule = require("../scheduler").schedule;
var nodeRoute = require("node-route");
var markAsInDocument = require("./util/mark_in_document");
var inDocument = require("./util/in_document");
var serialize = require("../node_serialization").serialize;

module.exports = function(Node){
	var proto = Node.prototype;

	var appendChild = proto.appendChild;
	proto.appendChild = function(child){
		var res = appendChild.apply(this, arguments);
		registerForDiff(child);
		return res;
	};

	var insertBefore = proto.insertBefore;
	proto.insertBefore = function(child, ref){
		var refIndex = nodeRoute.indexOfParent(this, ref);
		var res = insertBefore.apply(this, arguments);
		registerForDiff(child, refIndex);
		return res;
	};

};

function registerForDiff(child, refIndex){
	var parent = nodeParent(child);
	if(inDocument(parent)) {
		markAsInDocument(child);

		if(child.nodeType === 1) {
			nodeRoute.getID(child);
			nodeRoute.purgeSiblings(child);
		}

		schedule(parent, function(route){
			return {
				type: "insert",
				node: serialize(child),
				ref: refIndex
			};
		});
	}

}

function nodeParent(child){
	return child.nodeType === 11 ? (child.firstChild && child.firstChild.parentNode) : child.parentNode;
}

function getChildren(el){
	var children = [];
	if(el.nodeType === 11) {
		var cur = el.firstChild;
		while(cur) {
			children.push(cur);
			cur = cur.nextSibling;
		}
	} else {
		children.push(el);
	}
	return children;

}
