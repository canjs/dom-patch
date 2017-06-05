var nodeRoute = require("node-route");
var patchOpts = require("./patch/patch-options");

var changedRoutes = {},
	changes = [],
	globals = [],
	flushScheduled,
	callbacks = [];

exports.schedule = function schedule(el, data){
	if(patchOpts.collapseTextNodes && el.nodeType === 3) {
		var routeInfo = nodeRoute.getRoute(el, { collapseTextNodes: true });
		data.route = routeInfo.id;
		data.nodeValue = routeInfo.value;
	} else {
		var route = nodeRoute.getID(el);
		data.route = route;
	}

	changes.push(data);
	exports.scheduleFlush();
};

exports.scheduleGlobal = function scheduleGlobal(data){
	globals.push(data);
	exports.scheduleFlush();
};

exports.scheduleFlush = function scheduleFlush(){
	if(!flushScheduled) {
		flushScheduled = true;

		// TODO can we do faster than setTimeout
		setTimeout(exports.flushChanges);
	}
};

exports.flushChanges = function flushChanges(){
	var domChanges = [], fn, res;

	globals.forEach(function(data){
		domChanges.push(data);
	});

	changes.forEach(function(data){
		domChanges.push(data);
	});

	changedRoutes = {};
	changes.length = 0;
	globals.length = 0;

	flushScheduled = false;
	callbacks.forEach(function(cb){
		cb(domChanges);
	});
};

exports.register = function(callback){
	callbacks.push(callback);
};

exports.unregister = function(callback){
	if(arguments.length === 0) {
		callbacks = [];
		changedRoutes = {};
		changes.length = 0;
		globals.length = 0;
		return;
	}

	var idx = callbacks.indexOf(callback);
	if(idx >= 0) {
		callbacks.splice(idx, 1);
	}
};
