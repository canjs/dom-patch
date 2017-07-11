var QUnit = require("steal-qunit");

var apply = require("dom-patch/apply");
var patch = require("dom-patch");
var makeDocument = require("can-vdom/make-document/make-document");
var nodeRoute = require("node-route");

function makeVdomArea() {
	var doc = makeDocument();
	var vdomTestArea = doc.createElement("div");
	doc.body.appendChild(vdomTestArea);
	return {
		document: doc,
		vdomTestArea: vdomTestArea
	};
}

QUnit.module("patch and apply", {
	setup: function(done){
		var area = makeVdomArea();
		this.document = area.document;
		this.vdomTestArea = area.vdomTestArea;

		this.otherDocument = document.implementation.createHTMLDocument("Title");

		// Clean it up, removing the doctype and other stuff
		var docType = this.otherDocument.firstChild;
		var html = docType.nextSibling;
		docType.parentNode.removeChild(docType);

		this.testArea = this.otherDocument.createElement("div");
		this.otherDocument.body.appendChild(this.testArea);
	},
	teardown: function(){
		patch.deregister();
		this.testArea.innerHTML = "";
	}
});

QUnit.test("Replacing with a DocumentFragment works", function(){
	patch(this.document, function onpatches(patches){
		// Purge the cache so we don't get wrong results.
		nodeRoute.purgeCache();
		apply(this.otherDocument, patches);

		QUnit.equal(this.testArea.firstChild.nodeName, "UL", "the <ul> is first");
		QUnit.equal(this.testArea.firstChild.nextSibling.nodeName, "DD", "the <dd> is next");

		QUnit.start();
	}.bind(this));

	var first = this.document.createElement("span");
	this.vdomTestArea.appendChild(first);

	var frag = this.document.createDocumentFragment();
	frag.appendChild(this.document.createElement("ul"));
	var dd = this.document.createElement("dd");
	dd.appendChild(this.document.createTextNode("some text"));
	frag.appendChild(dd);

	this.vdomTestArea.replaceChild(frag, first);


	QUnit.stop();
});
