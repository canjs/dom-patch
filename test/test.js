var patch = require("dom-patch");
var QUnit = require("steal-qunit");

QUnit.module("dom-patch");

QUnit.test("basics works", function(){
	var testArea = document.getElementById("qunit-test-area");

	patch(document, function(patches){
		debugger;
		QUnit.ok(true, "it worked");

		QUnit.start();
	});

	var span = document.createElement("span");

	// Append
	testArea.appendChild(span);

	// Set the attributes
	span.setAttribute("foo", "bar");

	QUnit.stop();
});
