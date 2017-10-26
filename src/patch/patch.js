var patchOptions = require("./patch-options");
var scheduler = require("../scheduler");
var markAsInDocument = require("../overrides/util/mark_in_document");

var overrides = [
	require("../overrides/insert"),
	require("../overrides/remove"),
	require("../overrides/attributes"),
	require("../overrides/prop"),
	require("../overrides/events"),
	require("../overrides/history")
];

exports = module.exports = bind;

exports.bind = bind;
exports.unbind = unbind;
exports.deregister = deregister;
// Expose this so code can flush current changes before unbinding.
exports.flush = scheduler.flushChanges;

// Forward on the collapseTextNodes option to the scheduler.
Object.defineProperty(exports, "collapseTextNodes", {
	set: function(val){
		patchOptions.collapseTextNodes = val;
	}
});

// Used to keep track of documents we are listening to.
var listeningDocs = [];
// Functions that when called will undo DOM wrapping.
var overrideTeardowns = [];
var _over = typeof Symbol === "function" ? Symbol("_override") : "__patch-override";


/**
 * @module dom-patch/patch patch
 *
 * Get patches for a Document and callback
 * whenever an array of patches are available.
 *
 * @param {document} document
 * @param {Function} callback
 */
function bind(document, callback){
	var Node = getNodeConstructor(document);

	if(listeningDocs.indexOf(document) === -1) {
		if(!Node[_over]) {
			overrides.forEach(function(override){
				var res = override(Node, document);
				if(typeof res !== "undefined") {
					overrideTeardowns.push(res);
				}
			});
			overrideTeardowns.push(function(){
				Node[_over] = undefined;
			});
		}
		markAsInDocument(document.documentElement);
		listeningDocs.push(document);
	}

	Node[_over] = true;
	scheduler.register(document, callback);
}

function getNodeConstructor(document){
	var window = document.defaultView;
	// Assume defaultView means the right stuff is on the window
	if(window) {
		if(window.Node) {
			return window.Node;
		}
	}
	var tn = document.createElement("div");

	var elementProto = Object.getPrototypeOf(tn);
	var nodeProto = Object.getPrototypeOf(elementProto);

	return nodeProto.constructor;
}

/**
 * @function dom-patch/patch.unbind unbind
 *
 * Remove a callback from being bound to changes.
 *
 * @param {Function} callback
 */
function unbind(callback){
	scheduler.unregister(callback);
}

/**
 * @function dom-patch/patch.deregister deregister
 *
 * Remove all DOM wrappings and unbind all callbacks.
 */
function deregister() {
	overrideTeardowns.forEach(function(fn){
		fn();
	});
	overrideTeardowns = [];
	listeningDocs = [];
	scheduler.unregister();
}
