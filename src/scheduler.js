var nodeRoute = require("node-route");

var changedRoutes = {},
	changes = [],
	globals = [],
	flushScheduled,
	callbacks = [];

exports.schedule = function schedule(el, callbackOrData){
	var route = nodeRoute.getID(el);

	if(!changedRoutes[route]) {
		changes.push(route);
	}

	var routeCallbacks = changedRoutes[route] || (changedRoutes[route] = []);
	routeCallbacks.push(callbackOrData);
	//routeCallbacks[0] = callbackOrData;

	exports.scheduleFlush();
};

exports.scheduleGlobal = function scheduleGlobal(callback){
	globals.push(callback);
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

	globals.forEach(function(fn){
		domChanges.push(fn());
	});

	changes.forEach(function(route){
		var callbacks = changedRoutes[route];

		callbacks.forEach(function(fn){
			if(typeof fn === "function") {
				res = fn(route);
			} else {
				res = fn;
			}
			// Callbacks could return undefined which means do nothing.
			if(res) {
				res.route = route;
				domChanges.push(res);
			}
		});
	});

	changedRoutes = {};
	changes.length = 0;
	globals.length = 0;

	callbacks.forEach(function(cb){
		cb(domChanges);
	});

	flushScheduled = false;
};

exports.register = function(callback){
	callbacks.push(callback);
};

exports.unregister = function(callback){
	if(arguments.length === 0) {
		callbacks = [];
		return;
	}

	var idx = callbacks.indexOf(callback);
	if(idx >= 0) {
		callbacks.splice(idx, 1);
	}
};
