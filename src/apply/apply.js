var elements = require("can/view/elements.js");
var deserialize = require("../node_serialization").deserialize;
var nodeRoute = require("node-route");

module.exports = applyPatches;

var handlers = {

	text: function(patch){
		var node = nodeRoute.findNode(patch.route);
		node.nodeValue = patch.value;
	},

	attribute: function(patch){
		var el = nodeRoute.findNode(patch.route);
		elements.setAttr(el, patch.attr, patch.value);
	},

	prop: function(patch){
		var el = nodeRoute.findNode(patch.route);
		if(!el) { return; }
		el[patch.prop] = patch.value;
	},

	globalEvent: function(patch){
		var fn = patch.action === "add" ? "addEventListener" : "removeEventListener";
		window[fn](patch.name, globalEventHandler);
	},

	insert: function(patch, document, patchOptions){
		var node = deserialize(patch.node, false, patchOptions);
		var parent = nodeRoute.findNode(patch.route);

		if(patch.ref) {
			var ref = nodeRoute.findNode("0."+patch.ref, parent);
			parent.insertBefore(node, ref);
		} else {
			parent.appendChild(node);
		}
	},

	remove: function(patch){
		var parent = nodeRoute.findNode(patch.route);
		var node = nodeRoute.findNode(patch.child);

		if(!node) {
			return;
		}
		parent.removeChild(node);
	}

};


function applyPatches(document, patches, patchOptions){
	patchOptions = patchOptions || {};

	patches.forEach(function(patch){
		var handler = handlers[patch.type];
		if(handler) {
			handler(patch, document, patchOptions);
		} else {
			console.error("Patch type", patch.type, "not supported");
		}
	});
}
