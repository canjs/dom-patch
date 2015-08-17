var deserialize = require("../node_serialization").deserialize;
var nodeRoute = require("node-route");
var setAttribute = require("../setattribute");

module.exports = applyPatches;

var handlers = {

	event: function(patch, document, patchOptions){
		var node = nodeRoute.getNode(patch.route);
		node[patch.action](patch.event, patchOptions.eventHandler);
	},

	history: function(patch){
		history[patch.action].apply(history, patch.args);
	},

	text: function(patch){
		var node = nodeRoute.getNode(patch.route);
		node.nodeValue = patch.value;
	},

	attribute: function(patch){
		var el = nodeRoute.getNode(patch.route);
		setAttribute(el, patch.attr, patch.value);
	},

	prop: function(patch){
		var el = nodeRoute.getNode(patch.route);
		if(!el) { return; }
		el[patch.prop] = patch.value;
	},

	globalEvent: function(patch, document, patchOptions){
		var fn = patch.action === "add" ? "addEventListener" : "removeEventListener";
		window[fn](patch.name, patchOptions.globalEventHandler);
	},

	insert: function(patch, document, patchOptions){
		var node = deserialize(patch.node, false, patchOptions);
		var parent = nodeRoute.getNode(patch.route);

		if(patch.ref) {
			var ref = nodeRoute.findNode("0."+patch.ref, parent);
			parent.insertBefore(node, ref);
			nodeRoute.purgeSiblings(node);
		} else {
			parent.appendChild(node);
		}
	},

	remove: function(patch){
		var parent = nodeRoute.getNode(patch.route);
		var node = nodeRoute.getNode(patch.child);

		if(!node) {
			return;
		}
		nodeRoute.purgeSiblings(node);
		nodeRoute.purgeNode(node);
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
