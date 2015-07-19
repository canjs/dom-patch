var QUnit = require("steal-qunit");
var can = require("can");
var simpleDOM = require("can-simple-dom");
var Node = require("can-simple-dom/simple-dom/document/node")["default"];
require("can/util/vdom/build_fragment/");
require("can/view/stache/");
var nodeRoute = require("node-route");
var markAsInDocument = require("./util/mark_in_document");

var patch = require("dom-patch");

QUnit.module("dom-patch overrides", {
	setup: function(){
		this.patch = patch;

		this.oldPostMessage = window.postMessage;
		window.postMessage = function(){};
		this.doc = can.document = new simpleDOM.Document();

		this.patch(this.doc, function(){});

		markAsInDocument(this.doc.documentElement);
	},
	teardown: function(){
		window.postMessage = this.oldPostMessage;
		can.document = window.document;

		this.patch.deregister();
	}
});

QUnit.test("Nodes appended to the DOM are in the document", function(){
	var template = can.stache("<div><span>hello world</span></div>");
	var frag = template();
	this.doc.documentElement.appendChild(frag);

	var span = frag.firstChild.firstChild;
	equal(span.inDocument, true, "span is in the document");
});

QUnit.test("Inserting a sibling will reset ids", function(){
	var map = new can.Map({name:"matthew"});
	var template = can.stache("<div><div><ul><li><span id='hello'>{{name}}</span></li></ul></div></div>");
	var frag = template(map);
	this.doc.documentElement.appendChild(frag);

	var ul = frag.firstChild.firstChild.firstChild;
	var firstLi = ul.firstChild;

	// Now we have 3 cached nodes, the first div, the first li and the span.
	// If we insert a sibling li it should update the first li and the span.
	ul.insertBefore(this.doc.createElement("li"), firstLi);

	// It should be removed from the nodeCache
	equal(nodeRoute.nodeCache["0.1.0.0.0.0"], undefined, "SPAN is no longer in the map");
	equal(nodeRoute.nodeCache["0.1.0.0.0"], ul.firstChild, "The new LI is in the map");
});

QUnit.test("Setting a TextNode will create an id", function(){
	var template = can.stache("<div>{{name}}</div>");
	var map = new can.Map({name:"matthew"});
	var frag = template(map);

	this.doc.documentElement.appendChild(frag);

	map.attr("name", "wilbur");

	var textNode = frag.firstChild.firstChild;
	equal(nodeRoute.nodeCache["0.1.0"], textNode, "it is the text node");
});
