/*dom-patch@2.1.4#src/overrides/util/mark_in_document*/
module.exports = markAsInDocument;
function markAsInDocument(element, value) {
    var cur = element;
    value = value === false ? false : true;
    cur.inDocument = value;
    cur = cur.firstChild;
    while (cur) {
        markAsInDocument(cur, value);
        cur = cur.nextSibling;
    }
}