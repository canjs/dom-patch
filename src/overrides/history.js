var scheduleGlobal = require("../scheduler").scheduleGlobal;

module.exports = function(){
	var window = this;
	var history = window.history;

	var pushState = history.pushState;
	history.pushState = function(stateObject, title, url){
		scheduleGlobal({
			type: "history",
			action: "pushState",
			args: [stateObject, title, url]
		});

		return pushState.apply(this, arguments);
	};

	return function(){
		history.pushState = pushState;
	};
};
