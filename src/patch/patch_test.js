var QUnit = require("steal-qunit");
var loader = require("@loader");

var patch = require("dom-patch");
var simpleDOM = require("can-simple-dom");

QUnit.module("dom-patch/patch", {
	setup: function(done){
		this.document = new simpleDOM.Document();

		this.testArea = this.document.createElement("div");
		this.document.documentElement.appendChild(this.testArea);
	},
	teardown: function(){
		this.testArea.innerHTML = "";
		patch.deregister();
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
