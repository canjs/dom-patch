
module.exports = setAttribute;

var invalidAttributes = {
	"[": true, "#": true
};

function setAttribute(element, name, value){
	var firstChar = name[0];
	if(invalidAttributes[firstChar]) {
		return setByCloning(element, name, value);
	}
	return element.setAttribute(name, value);
}

var dummyEl = function(){
	var el = document.createElement("div");
	dummyEl = function() { return el; };
	return el;
};

function setByCloning(element, name, value){
	var el = dummyEl();
	el.innerHTML = "<span " + name + "=\"" + value + "\"></span>";
	var attr = el.firstChild.attributes[0];
	var cloned = attr.cloneNode();
	el.setAttributeNode(cloned);
}
