var scheduleGlobal = require("../scheduler").scheduleGlobal;

module.exports = function(Node){
	var window = this;

	var proto = Node.prototype;

	var addEventListener = proto.addEventListener;
	proto.addEventListener = function(eventName){
		if(isNode(this)) {
			var el = this;
			if(!el.__events) {
				el.__events = {};
			}
			el.__events[eventName] = true;
		}
		return addEventListener.apply(this, arguments);
	};

	var removeEventListener = proto.removeEventListener;
	proto.removeEventListener = function(eventName){
		if(isNode(this)) {
			var el = this;
			if(el.__events) {
				delete el.__events[eventName];
			}
		}
		return removeEventListener.apply(this, arguments);
	};

	var windowAddEventListener = window.addEventListener;
	window.addEventListener = function(evName){
		scheduleGlobal(function(){
			return {
				type: "globalEvent",
				action: "add",
				name: evName
			};
		});
	};

	return function(){
		proto.addEventListener = addEventListener;
		proto.removeEventListener = removeEventListener;
		window.addEventListener = windowAddEventListener;
	};

};

function isNode(obj){
	return obj && !!obj.nodeType;
}
