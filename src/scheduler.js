var nodeRoute = require("node-route");
var patchOpts = require("./patch/patch-options");

var changes = [],
	globals = [],
	flushScheduled,
	callbacks = [];

var nrOptions = { collapseTextNodes: true };

exports.schedule = function schedule(el, data){
	var collapseTextNodes = patchOpts.collapseTextNodes;
	if(collapseTextNodes && el.nodeType === 3) {
		var routeInfo = nodeRoute.getRoute(el, nrOptions);
		data.route = routeInfo.id;
		data.value = routeInfo.value;
	} else if(collapseTextNodes) {
		data.route = nodeRoute.getID(el, nrOptions);
	} else {
		data.route = nodeRoute.getID(el);
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

	changes.length = 0;
	globals.length = 0;
	flushScheduled = false;
	
	callbacks.forEach(function(cb){
		// I know it would make more sense to have this conditional
		// outside of the forEach, but this code is going to change
		// to support multiple document observations happening
		// simultaneously.
		if(domChanges.length) {
			cb(domChanges);
		}
	});
};

exports.register = function(callback){
	callbacks.push(callback);
};

exports.unregister = function(callback){
	if(arguments.length === 0) {
		callbacks = [];
		changes.length = 0;
		globals.length = 0;
		return;
	}

	var idx = callbacks.indexOf(callback);
	if(idx >= 0) {
		callbacks.splice(idx, 1);
	}
};
