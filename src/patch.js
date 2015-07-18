var overrides = [
	require("./overrides/insert")
];

module.exports = listen;

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
function listen(document, callback){
	var Node = getNodeConstructor(document);

	if(listeningDocs.indexOf(document) === -1) {
		overrides.forEach(function(override){
			override(Node);
		});
		listeningDocs.push(document);
	}


}

function getNodeConstructor(document){
	var tn = document.createTextNode("test");

	var textProto = Object.getPrototypeOf(tn);
	var characterDataProto = Object.getPrototypeOf(textProto);
	var nodeProto = Object.getPrototypeOf(characterDataProto);

	return nodeProto.constructor;
}
