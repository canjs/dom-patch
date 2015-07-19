var apply = require("dom-patch/apply");
var QUnit = require("steal-qunit");

QUnit.module("dom-patch/apply");

QUnit.test("Will apply a set of patches", function(){
	var nodeS = [];
	nodeS[3] = "SPAN";
	var patches = [{"type":"insert","node":nodeS,"route":"0.1.0"},{"type":"attribute","attr":"foo","value":"bar","route":"0.1.0.0"}];

	apply(document, patches);

	var testArea = document.getElementById("qunit-test-area");

	var span = testArea.firstChild;

	QUnit.equal(span.nodeName, "SPAN", "There is a span");
	QUnit.equal(span.getAttribute("foo"), "bar", "attribute was set");
});
