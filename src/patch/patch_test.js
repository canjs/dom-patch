var QUnit = require("steal-qunit");
var loader = require("@loader");

var patch = require("dom-patch");
var makeDocument = require("can-vdom/make-document/make-document");
var NodeProp = require("../node_prop");

QUnit.module("dom-patch/patch", {
	setup: function(done){
		this.document = makeDocument();

		this.testArea = this.document.createElement("div");
		this.document.documentElement.appendChild(this.testArea);
	},
	teardown: function(){
		patch.deregister();
		this.testArea.innerHTML = "";
	}
});

QUnit.test("basics works", function(){
	var document = this.document;
	patch(document, function onpatches(patches){
		QUnit.equal(patches.length, 2, "There are two patches");
		QUnit.equal(patches[0].type, "insert", "The first patch is the insert");
		QUnit.equal(patches[1].type, "attribute", "The second patch is for the setAttribute");

		QUnit.start();
	});

	var span = document.createElement("span");

	// Append
	this.testArea.appendChild(span);

	// Set the attributes
	span.setAttribute("foo", "bar");

	QUnit.stop();
});

QUnit.test("works with properties", function(){
	var document = this.document;

	patch(document, function onpatches(patches){
		QUnit.equal(patches.length, 2, "There are two patches");
		QUnit.equal(patches[1].type, "prop", "The second patch is prop");

		QUnit.start();
	});

	var span = document.createElement("span");

	this.testArea.appendChild(span);

	span.className = "foobar";

	QUnit.stop();
});

QUnit.test("setting className is serialized as a node patch", function(patches){
	var document = this.document;

	patch(document, function(patches){
		var node = patches[0].node;

		QUnit.equal(node[NodeProp.CLASS], "active", "Correct className added");

		QUnit.start();
	});

	var span = document.createElement("span");
	span.className = "active";

	this.testArea.appendChild(span);

	QUnit.stop();
});
