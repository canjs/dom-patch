var schedule = require("../scheduler").schedule;
var nodeRoute = require("node-route");
var markAsInDocument = require("./util/mark_in_document");
var inDocument = require("./util/in_document");

module.exports = function(Node){
	var proto = Node.prototype;

	var removeChild = proto.removeChild;
	proto.removeChild = function(child){
		var parent = this;

		if(inDocument(parent) && inDocument(child)) {
			markAsInDocument(child, false);

			schedule(parent, {
				type: "remove",
				child: nodeRoute.getID(child)
			});

		}

		return removeChild.apply(this, arguments);
	};
};
