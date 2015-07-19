var scheduler = require("../scheduler");
var markAsInDocument = require("../overrides/util/mark_in_document");

var overrides = [
	require("../overrides/insert"),
	require("../overrides/remove"),
	require("../overrides/attributes"),
	require("../overrides/prop")
];

exports = module.exports = bind;

exports.bind = bind;
exports.unbind = unbind;

var listeningDocs = [];

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
			override(Node, document);
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

function unbind(callback){
	scheduler.unregister(callback);
}
