
module.exports = markAsInDocument;

function markAsInDocument(element, value){
	var cur = element;
	value = value === false ? false : true;

	while(cur) {
		cur.inDocument = value;
		var child = cur.firstChild;
		while(child) {
			markAsInDocument(child, value);

			child = child.nextSibling;
		}
		cur = cur.nextSibling;
	}
}
