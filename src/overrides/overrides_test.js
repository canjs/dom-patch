var QUnit = require("steal-qunit");
var simpleDOM = require("can-simple-dom");
var Map = require("can-map");
var Node = require("can-simple-dom/simple-dom/document/node")["default"];
var DOCUMENT = require("can-util/dom/document/document");
var MO = require("can-util/dom/mutation-observer/mutation-observer");
var stache = require("can-stache");
var nodeRoute = require("node-route");
var markAsInDocument = require("./util/mark_in_document");

var patch = require("dom-patch");


QUnit.module("dom-patch overrides", {
	setup: function(){
		this.patch = patch;

		this.oldPostMessage = window.postMessage;
		window.postMessage = function(){};
		this.doc = new simpleDOM.Document();
		this.oldDoc = DOCUMENT();
		this.mo = MO();
		DOCUMENT(this.doc);
		MO(null);

		this.patch(this.doc, function(){});
		markAsInDocument(this.doc.documentElement);
	},
	teardown: function(assert){
		this.patch.deregister();
		window.postMessage = this.oldPostMessage;
		DOCUMENT(this.oldDoc);
		MO(this.mo);

	}
});

QUnit.test("Nodes appended to the DOM are in the document", function(){
	var template = stache("<div><span>hello world</span></div>");
	var frag = template();
	var span = frag.firstChild.firstChild;
	this.doc.documentElement.appendChild(frag);

	equal(span.inDocument, true, "span is in the document");
});

QUnit.test("Inserting a sibling will reset ids", function(){
	var map = new Map({name:"matthew"});
	var template = stache("<div><div><ul><li><span id='hello'>{{name}}</span></li></ul></div></div>");
	var frag = template(map);
	var ul = frag.firstChild.firstChild.firstChild;
	var firstLi = ul.firstChild;

	this.doc.documentElement.appendChild(frag);

	// Now we have 3 cached nodes, the first div, the first li and the span.
	// If we insert a sibling li it should update the first li and the span.
	ul.insertBefore(this.doc.createElement("li"), firstLi);

	// It should be removed from the nodeCache
	equal(nodeRoute.nodeCache["0.1.0.0.0.0"], undefined, "SPAN is no longer in the map");
	equal(nodeRoute.nodeCache["0.1.0.0.0"], ul.firstChild, "The new LI is in the map");
});

QUnit.test("Setting a TextNode will create an id", function(){
	var template = stache("<div>{{name}}</div>");
	var map = new Map({name:"matthew"});
	var frag = template(map);

	var textNode = frag.firstChild.firstChild;
	this.doc.documentElement.appendChild(frag);

	map.attr("name", "wilbur");

	equal(nodeRoute.nodeCache["0.1.0"], textNode, "it is the text node");
});
