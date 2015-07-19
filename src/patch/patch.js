var scheduler = require("../scheduler");
var markAsInDocument = require("../overrides/util/mark_in_document");

var overrides = [
	require("../overrides/insert"),
	require("../overrides/remove"),
	require("../overrides/attributes"),
	require("../overrides/prop"),
	require("../overrides/events")
];

exports = module.exports = bind;

exports.bind = bind;
exports.unbind = unbind;
exports.deregister = deregister;

// Used to keep track of documents we are listening to.
var listeningDocs = [];
// Functions that when called will undo DOM wrapping.
var overrideTeardowns = [];


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
		overrides.forEach(function(override){
			var res = override(Node, document);
			if(typeof res !== "undefined") {
				overrideTeardowns.push(res);
			}
		});
		markAsInDocument(document.documentElement);
		listeningDocs.push(document);
	}

	scheduler.register(callback);
}

function getNodeConstructor(document){
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
