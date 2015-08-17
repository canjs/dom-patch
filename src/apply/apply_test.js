var apply = require("dom-patch/apply");
var nodeRoute = require("node-route");
var QUnit = require("steal-qunit");

QUnit.module("dom-patch/apply", {
	setup: function(){
		this.testArea = document.getElementById("qunit-test-area");
		nodeRoute.purgeCache();
	},
	teardown: function(){
		this.testArea.innerHTML = "";
	}
});

QUnit.test("Will apply a set of patches", function(){
	var nodeS = [];
	nodeS[3] = "SPAN";
	var patches = [{"type":"insert","node":nodeS,"route":"0.1.0"},{"type":"attribute","attr":"foo","value":"bar","route":"0.1.0.0"}];

	apply(document, patches);

	var testArea = this.testArea;

	var span = testArea.firstChild;

	QUnit.equal(span.nodeName, "SPAN", "There is a span");
	QUnit.equal(span.getAttribute("foo"), "bar", "attribute was set");
});

QUnit.test("removes occur in the correct order", function(){
	var ul = document.createElement("ul");
	var div = document.createElement("div");
	this.testArea.appendChild(ul);
	this.testArea.appendChild(div);

	var nodeS = [];
	nodeS[3] = "SPAN";
	var patches = [
		{"type":"insert","node":nodeS,"route":"0.1.0"},
		{"type":"remove","child":"0.1.0.0","route":"0.1.0"},
		{"type":"remove","child":"0.1.0.0","route":"0.1.0"}
	];

	apply(document, patches);

	QUnit.equal(this.testArea.childNodes.length, 1, "there is just one child node now");
	QUnit.equal(this.testArea.firstChild.nodeName, "SPAN", "the only node is a span");

});

QUnit.test("can patch weird attribute names", function(){
	var nodeS = [];
	nodeS[3] = "SPAN";
	nodeS[4] = [["[restaurant]","tacos"]];

	var patches = [
		{"type":"insert","node":nodeS,"route":"0.1.0"}
	];

	apply(document, patches);

	QUnit.equal(this.testArea.firstChild.getAttribute("[restaurant]"), "tacos", "special character attribute was set");
});

QUnit.test("inserts purge the sibling route table", function(){
	var ul = document.createElement("ul");
	var div = document.createElement("div");
	this.testArea.appendChild(ul);
	this.testArea.appendChild(div);


	// This will cause the div to be cached.
	var id = nodeRoute.getID(div);

	var nodeS = [];
	nodeS[3] = "SPAN";
	var patches = [
		{"type":"insert","node":nodeS,"route":id.substr(0, id.length - 2),"ref":"1"}
	];

	apply(document, patches);

	QUnit.notEqual(nodeRoute.nodeCache[id], div, "not the div");
});
