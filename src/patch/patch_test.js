const patch = require("./patch");
const {JSDOM} = require("jsdom");
const NodeProp = require("../node_prop");
const QUnit = require("qunitjs");

QUnit.module("dom-patch/patch", {
	beforeEach: function(done){
		let document = new JSDOM().window.document;
		this.document = document;

		this.testArea = this.document.createElement("div");
		this.document.documentElement.appendChild(this.testArea);
	},
	afterEach: function(){
		patch.deregister();
		this.testArea.innerHTML = "";
	}
});

QUnit.test("basics works", function(assert){
	var done = assert.async();
	var document = this.document;
	patch(document, function onpatches(patches){
		assert.equal(patches.length, 2, "There are two patches");
		assert.equal(patches[0].type, "insert", "The first patch is the insert");
		assert.equal(patches[1].type, "attribute", "The second patch is for the setAttribute");

		done();
	});

	var span = document.createElement("span");

	// Append
	this.testArea.appendChild(span);

	// Set the attributes
	span.setAttribute("foo", "bar");
});

QUnit.test("works with properties", function(assert){
	var done = assert.async();
	var document = this.document;

	patch(document, function onpatches(patches){
		assert.equal(patches.length, 2, "There are two patches");
		assert.equal(patches[1].type, "attribute", "The second patch is attr");

		done();
	});

	var span = document.createElement("span");
	this.testArea.appendChild(span);

	span.className = "foobar";
});

QUnit.test("setting className is serialized as a node patch", function(assert){
	var done = assert.async();
	var document = this.document;

	patch(document, function(patches){
		var node = patches[0].node;
		assert.equal(node[NodeProp.CLASS], "active", "Correct className added");

		done();
	});

	var span = document.createElement("span");
	span.className = "active";

	this.testArea.appendChild(span);
});

QUnit.test("setting textContent results in a patch", function(assert){
	var done = assert.async();
	var document = this.document;
	var span = document.createElement("span");
	this.testArea.appendChild(span);

	patch(document, function(patches){
		assert.equal(patches[0].type, "prop", "got textContent patch");
		done();
	});

	span.textContent = "hello world";
});

QUnit.test("Can patch multiple docs at once", function(assert){
	var done = assert.async();
	var doc1 = new JSDOM().window.document;
	var doc2 = new JSDOM().window.document;
	doc1.documentElement.insertBefore(doc1.createElement("head"), doc1.body);
	doc2.documentElement.insertBefore(doc2.createElement("head"), doc2.body);

	patch.flush();

	patch(doc1, function(changes){
		var instr = changes[0];
		assert.equal(changes.length, 1);
		assert.equal(instr.type, "insert");
		assert.equal(instr.route, "0.2");
		assert.equal(instr.node[3], "SPAN");
	});

	patch(doc2, function(changes){
		var instr = changes[0];
		assert.equal(changes.length, 1);
		assert.equal(instr.type, "insert");
		assert.equal(instr.route, "0.0");
		assert.equal(instr.node[3], "META");

		done();
	});

	doc1.body.appendChild(doc1.createElement("span"));
	doc2.head.appendChild(doc2.createElement("meta"));
});

QUnit.module("dom-patch/patch {collapseTextNodes}", {
	beforeEach: function(){
		patch.collapseTextNodes = true;
		this.document = new JSDOM().window.document;

		this.testArea = this.document.createElement("div");
		this.document.documentElement.appendChild(this.testArea);
	},
	afterEach: function(){
		patch.deregister();
		patch.collapseTextNodes = false;
		this.testArea.innerHTML = "";
	}
});

QUnit.test("Ignores consecutive TextNodes", function(assert){
	var done = assert.async();
	var document = this.document;
	var ta = this.testArea;

	var count = 0;
	patch(document, function(patches){
		count++;

		if(count === 1) {
			// Changing the value should cause a text patch to come
			// around next
			tn2.nodeValue = "TWO";
		} else if(count === 2) {
			// test
			assert.equal(patches.length, 1);
			assert.equal(patches[0].value, "oneTWO");
			done();
		}
	});

	ta.appendChild(document.createTextNode("one"));
	var tn2 = document.createTextNode("two");
	ta.appendChild(tn2);

	var span = document.createElement("span");
	ta.appendChild(span);

	ta.appendChild(document.createTextNode("three"));
	ta.appendChild(document.createTextNode("four"));
});

QUnit.test("Callback is not called if there are no changes", function(assert){
	var done = assert.async();
	var document = this.document;
	var ta = this.testArea;

	var called = false;
	patch(document, function(changes){
		console.warn("This shouldn't have happened", changes);
		called = true;
	});

	// Flush should flush any changes, check in this case there shouldn't be any.
	patch.flush();

	setTimeout(function(){
		assert.equal(called, false, "The patch callback was not called");
		done();
	}, 50);
});

QUnit.test("'ref' property is correct using replaceChild", function(assert){
	var done = assert.async();
	var document = this.document;
	var ta = this.testArea;

	patch(document, function(changes){
		var instr = changes[3];
		assert.equal(instr.ref, 1, "TextNodes ignored");

		done();
	});

	var div = document.createElement("div");
	var sec = document.createElement("section");

	ta.appendChild(document.createTextNode("one"));
	ta.appendChild(document.createTextNode("two"));
	ta.appendChild(div);

	ta.replaceChild(sec, div);
});

QUnit.test("'ref' property is correct using insertBefore", function(assert){
	var done = assert.async();
	var document = this.document;
	var ta = this.testArea;

	patch(document, function(changes){
		var instr = changes[3];
		assert.equal(instr.ref, 1, "TextNodes ignored");
		done();
	});

	var div = document.createElement("div");
	var sec = document.createElement("section");

	ta.appendChild(document.createTextNode("one"));
	ta.appendChild(document.createTextNode("two"));
	ta.appendChild(div);

	ta.insertBefore(sec, div);
});
