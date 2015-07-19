var QUnit = require("steal-qunit");
var loader = require("@loader");

require("dom-patch/overrides/test");

QUnit.module("dom-patch", {
	setup: function(done){
		var self = this;

		var clone = steal.clone(loader.clone());
		clone.startup({main:"dom-patch"});

		return clone.import("dom-patch", "can-simple-dom").then(function(mods){
			self.patch = mods[0];
			var simpleDOM = mods[1];
			self.document = new simpleDOM.Document();

			self.document = new simpleDOM.Document();
			self.testArea = self.document.createElement("div");
			self.document.documentElement.appendChild(self.testArea);
		});
	},
	teardown: function(){
		this.testArea.innerHTML = "";
	}
});

QUnit.test("basics works", function(){
	var patch = this.patch;
	var document = this.document;
	patch(document, function onpatches(patches){
		patch.unbind(onpatches);

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
	var patch = this.patch;
	var document = this.document;

	patch(document, function onpatches(patches){
		patch.unbind(onpatches);

		QUnit.equal(patches.length, 2, "There are two patches");
		QUnit.equal(patches[1].type, "prop", "The second patch is prop");


		QUnit.start();
	});

	var span = document.createElement("span");

	this.testArea.appendChild(span);

	span.className = "foobar";

	QUnit.stop();
});
