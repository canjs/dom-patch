/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*dom-patch@2.0.2#src/patch/patch-options*/
define('dom-patch/src/patch/patch-options', function (require, exports, module) {
    exports.collapseTextNodes = false;
});
/*dom-patch@2.0.2#src/scheduler*/
define('dom-patch/src/scheduler', function (require, exports, module) {
    (function (global) {
        var nodeRoute = require('node-route');
        var patchOpts = require('dom-patch/src/patch/patch-options');
        var changes = [], globals = [], flushScheduled, callbacks = [];
        var nrOptions = { collapseTextNodes: true };
        exports.schedule = function schedule(el, data) {
            var collapseTextNodes = patchOpts.collapseTextNodes;
            if (collapseTextNodes && el.nodeType === 3) {
                var routeInfo = nodeRoute.getRoute(el, nrOptions);
                data.route = routeInfo.id;
                data.value = routeInfo.value;
            } else if (collapseTextNodes) {
                data.route = nodeRoute.getID(el, nrOptions);
            } else {
                data.route = nodeRoute.getID(el);
            }
            changes.push(data);
            exports.scheduleFlush();
        };
        exports.scheduleGlobal = function scheduleGlobal(data) {
            globals.push(data);
            exports.scheduleFlush();
        };
        exports.scheduleFlush = function scheduleFlush() {
            if (!flushScheduled) {
                flushScheduled = true;
                setTimeout(exports.flushChanges);
            }
        };
        exports.flushChanges = function flushChanges() {
            var domChanges = [], fn, res;
            globals.forEach(function (data) {
                domChanges.push(data);
            });
            changes.forEach(function (data) {
                domChanges.push(data);
            });
            changes.length = 0;
            globals.length = 0;
            flushScheduled = false;
            callbacks.forEach(function (cb) {
                cb(domChanges);
            });
        };
        exports.register = function (callback) {
            callbacks.push(callback);
        };
        exports.unregister = function (callback) {
            if (arguments.length === 0) {
                callbacks = [];
                changes.length = 0;
                globals.length = 0;
                return;
            }
            var idx = callbacks.indexOf(callback);
            if (idx >= 0) {
                callbacks.splice(idx, 1);
            }
        };
    }(function () {
        return this;
    }()));
});
/*dom-patch@2.0.2#src/overrides/util/mark_in_document*/
define('dom-patch/src/overrides/util/mark_in_document', function (require, exports, module) {
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
});
/*dom-patch@2.0.2#src/overrides/util/in_document*/
define('dom-patch/src/overrides/util/in_document', function (require, exports, module) {
    module.exports = function (node) {
        return !!(node && node.inDocument);
    };
});
/*dom-patch@2.0.2#src/node_prop*/
define('dom-patch/src/node_prop', function (require, exports, module) {
    module.exports = {
        ROUTE: 0,
        TEXT: 1,
        COMMENT: 2,
        NODE_NAME: 3,
        ATTRIBUTES: 4,
        CHILD_NODES: 5,
        VALUE: 6,
        CHECKED: 7,
        SELECTED: 8,
        EVENTS: 9,
        CLASS: 10,
        FRAGMENT: 11
    };
});
/*dom-patch@2.0.2#src/setattribute*/
define('dom-patch/src/setattribute', function (require, exports, module) {
    module.exports = setAttribute;
    var invalidAttributes = {
        '[': true,
        '#': true,
        '(': true
    };
    function setAttribute(element, name, value) {
        var firstChar = name[0];
        if (invalidAttributes[firstChar]) {
            return setByCloning(element, name, value);
        }
        return element.setAttribute(name, value);
    }
    var dummyEl = function () {
        var el = document.createElement('div');
        dummyEl = function () {
            return el;
        };
        return el;
    };
    function setByCloning(element, name, value) {
        var el = dummyEl();
        el.innerHTML = '<span ' + name + '="' + value + '"></span>';
        var attr = el.firstChild.attributes[0];
        el.firstChild.removeAttributeNode(attr);
        element.setAttributeNode(attr);
    }
});
/*dom-patch@2.0.2#src/node_serialization*/
define('dom-patch/src/node_serialization', function (require, exports, module) {
    var NodeProp = require('dom-patch/src/node_prop');
    var setAttribute = require('dom-patch/src/setattribute');
    var has = Object.prototype.hasOwnProperty;
    exports.serialize = nodeToObject;
    exports.deserialize = objectToNode;
    function nodeToObject(node) {
        var objNode = Object.create(null), i;
        if (node.nodeType === 3) {
            objNode[NodeProp.TEXT] = node.nodeValue;
        } else if (node.nodeType === 8) {
            objNode[NodeProp.COMMENT] = node.data;
        } else {
            objNode[NodeProp.NODE_NAME] = node.nodeName;
            if (node.attributes && node.attributes.length > 0) {
                objNode[NodeProp.ATTRIBUTES] = [];
                for (i = 0; i < node.attributes.length; i++) {
                    objNode[NodeProp.ATTRIBUTES].push([
                        node.attributes[i].name,
                        node.attributes[i].value
                    ]);
                }
            }
            var cnlen = childNodesLength(node);
            if (node.childNodes && cnlen > 0) {
                objNode[NodeProp.CHILD_NODES] = [];
                for (i = 0; i < cnlen; i++) {
                    objNode[NodeProp.CHILD_NODES].push(nodeToObject(node.childNodes.item(i)));
                }
            }
            if (node.value) {
                objNode[NodeProp.VALUE] = node.value;
            }
            if (node.checked) {
                objNode[NodeProp.CHECKED] = node.checked;
            }
            if (node.selected) {
                objNode[NodeProp.SELECTED] = node.selected;
            }
            if (node.className) {
                objNode[NodeProp.CLASS] = node.className;
            }
            if (node.__events) {
                objNode[NodeProp.EVENTS] = [];
                var events = Object.keys(node.__events);
                for (i = 0; i < events.length; i++) {
                    objNode[NodeProp.EVENTS].push(events[i]);
                }
            }
        }
        return objNode;
    }
    function objectToNode(objNode, insideSvg, diffOptions) {
        if (!objNode) {
            return objNode;
        }
        var node, i;
        if (has.call(objNode, NodeProp.TEXT)) {
            node = document.createTextNode(objNode[NodeProp.TEXT]);
        } else if (has.call(objNode, NodeProp.COMMENT)) {
            node = document.createComment(objNode[NodeProp.COMMENT]);
        } else {
            if (objNode[NodeProp.NODE_NAME] === 'svg' || insideSvg) {
                node = document.createElementNS('http://www.w3.org/2000/svg', objNode[NodeProp.NODE_NAME]);
                insideSvg = true;
            } else {
                var nodeName = objNode[NodeProp.NODE_NAME];
                node = nodeName === '#document-fragment' ? document.createDocumentFragment() : document.createElement(nodeName);
            }
            if (objNode[NodeProp.ATTRIBUTES]) {
                for (i = 0; i < objNode[NodeProp.ATTRIBUTES].length; i++) {
                    setAttribute(node, objNode[NodeProp.ATTRIBUTES][i][0], objNode[NodeProp.ATTRIBUTES][i][1]);
                }
            }
            if (objNode[NodeProp.CHILD_NODES]) {
                for (i = 0; i < objNode[NodeProp.CHILD_NODES].length; i++) {
                    node.appendChild(objectToNode(objNode[NodeProp.CHILD_NODES][i], insideSvg, diffOptions));
                }
            }
            if (objNode[NodeProp.VALUE]) {
                node.value = objNode[NodeProp.VALUE];
            }
            if (objNode[NodeProp.CHECKED]) {
                node.checked = objNode[NodeProp.CHECKED];
            }
            if (objNode[NodeProp.SELECTED]) {
                node.selected = objNode[NodeProp.SELECTED];
            }
            if (objNode[NodeProp.CLASS]) {
                node.className = objNode[NodeProp.CLASS];
            }
            if (objNode[NodeProp.EVENTS]) {
                node.__events = {};
                objNode[NodeProp.EVENTS].forEach(function (evName) {
                    node.__events[evName] = true;
                    if (diffOptions && diffOptions.eventHandler) {
                        node.addEventListener(evName, diffOptions.eventHandler);
                    }
                });
            }
        }
        return node;
    }
    function childNodesLength(node) {
        if ('length' in node.childNodes) {
            return node.childNodes.length;
        }
        var len = 0, cur = node.childNodes.node.firstChild;
        while (cur) {
            len++;
            cur = cur.nextSibling;
        }
        return len;
    }
});
/*dom-patch@2.0.2#src/overrides/insert*/
define('dom-patch/src/overrides/insert', function (require, exports, module) {
    var schedule = require('dom-patch/src/scheduler').schedule;
    var nodeRoute = require('node-route');
    var markAsInDocument = require('dom-patch/src/overrides/util/mark_in_document');
    var inDocument = require('dom-patch/src/overrides/util/in_document');
    var patchOpts = require('dom-patch/src/patch/patch-options');
    var serialize = require('dom-patch/src/node_serialization').serialize;
    var DOCUMENT_FRAGMENT_NODE = 11;
    module.exports = function (Node) {
        var proto = Node.prototype;
        var appendChild = proto.appendChild;
        proto.appendChild = function (child) {
            var children = getChildren(child);
            var res = appendChild.apply(this, arguments);
            var parent = this;
            children.forEach(function (child) {
                registerForDiff(child, parent);
            });
            return res;
        };
        var insertBefore = proto.insertBefore;
        proto.insertBefore = function (child, ref) {
            var refIndex = nodeRoute.indexOfParent(this, ref);
            var children = getChildren(child, true);
            var res = insertBefore.apply(this, arguments);
            var parent = this;
            children.forEach(function (child) {
                registerForDiff(child, parent, refIndex);
            });
            return res;
        };
        var replaceChild = proto.replaceChild;
        proto.replaceChild = function (newChild, oldChild) {
            var refIndex = nodeRoute.indexOfParent(this, oldChild);
            var doc = newChild.ownerDocument;
            var children = getChildren(newChild);
            var res = replaceChild.apply(this, arguments);
            var parent = this;
            registerForDiff(children, this, refIndex, 'replace');
        };
        return function () {
            proto.appendChild = appendChild;
            proto.insertBefore = insertBefore;
            proto.replaceChild = replaceChild;
        };
    };
    function toFragmentLike(array) {
        var frag = Object.create(null);
        frag.childNodes = array;
        frag.childNodes.item = function (idx) {
            return array[idx];
        };
        frag.forEach = Array.prototype.forEach.bind(array);
        frag.nodeName = '#document-fragment';
        frag.length = array.length;
        return frag;
    }
    function registerForDiff(child, parent, refIndex, type) {
        if (inDocument(parent)) {
            var children = [child];
            var isArray = Array.isArray(child);
            if (isArray) {
                children = child = toFragmentLike(child);
            }
            children.forEach(function (c) {
                markAsInDocument(c);
                nodeRoute.getID(c);
                nodeRoute.purgeSiblings(c);
            });
            schedule(parent, {
                type: type || 'insert',
                node: serialize(child),
                ref: refIndex
            });
        }
    }
    function nodeParent(child) {
        return child.nodeType === 11 ? child.firstChild && child.firstChild.parentNode : child.parentNode;
    }
    function getChildren(el, reverse) {
        var children = [];
        if (el.nodeType === 11) {
            var cur = el.firstChild;
            while (cur) {
                if (reverse) {
                    children.unshift(cur);
                } else {
                    children.push(cur);
                }
                cur = cur.nextSibling;
            }
        } else {
            children.push(el);
        }
        return children;
    }
});
/*dom-patch@2.0.2#src/overrides/remove*/
define('dom-patch/src/overrides/remove', function (require, exports, module) {
    var schedule = require('dom-patch/src/scheduler').schedule;
    var nodeRoute = require('node-route');
    var markAsInDocument = require('dom-patch/src/overrides/util/mark_in_document');
    var inDocument = require('dom-patch/src/overrides/util/in_document');
    module.exports = function (Node) {
        var proto = Node.prototype;
        var removeChild = proto.removeChild;
        proto.removeChild = function (child) {
            var parent = this;
            if (inDocument(parent) && inDocument(child)) {
                markAsInDocument(child, false);
                nodeRoute.purgeSiblings(child);
                nodeRoute.purgeNode(child);
                schedule(parent, {
                    type: 'remove',
                    child: nodeRoute.getID(child)
                });
            }
            return removeChild.apply(this, arguments);
        };
    };
});
/*dom-patch@2.0.2#src/overrides/attributes*/
define('dom-patch/src/overrides/attributes', function (require, exports, module) {
    var schedule = require('dom-patch/src/scheduler').schedule;
    var inDocument = require('dom-patch/src/overrides/util/in_document');
    module.exports = function (Node, document) {
        var Element = getElementConstructor(document);
        var proto = Element.prototype;
        var setAttribute = proto.setAttribute;
        proto.setAttribute = function (attr, value) {
            var res = setAttribute.apply(this, arguments);
            scheduleIfInDocument(this, attr, value);
            return res;
        };
        return function () {
            proto.setAttribute = setAttribute;
        };
    };
    function scheduleIfInDocument(node, attributeName, attributeValue) {
        if (inDocument(node)) {
            schedule(node, {
                type: 'attribute',
                attr: attributeName,
                value: attributeValue
            });
        }
    }
    function getElementConstructor(document) {
        var div = document.createElement('div');
        var elementProto = Object.getPrototypeOf(div);
        return elementProto.constructor;
    }
});
/*dom-patch@2.0.2#src/overrides/prop*/
define('dom-patch/src/overrides/prop', function (require, exports, module) {
    var schedule = require('dom-patch/src/scheduler').schedule;
    var inDocument = require('dom-patch/src/overrides/util/in_document');
    var nodeProps = [
        {
            prop: 'nodeValue',
            type: 'text'
        },
        {
            prop: 'value',
            type: 'prop'
        }
    ];
    var elementProps = [{
            prop: 'className',
            type: 'prop'
        }];
    module.exports = function (Node, doc) {
        var element = doc.createElement('fake-el');
        var Element = element.constructor;
        var CSSStyleDeclaration = element.style.constructor;
        watchAll(Node.prototype, nodeProps);
        watchAll(Element.prototype, elementProps);
        watchStyle();
        function watchAll(proto, props) {
            props.forEach(function (prop) {
                watchProperty(proto, prop);
            });
        }
        function watchProperty(proto, info) {
            var prop = info.prop;
            var type = info.type;
            var priv = '_' + prop;
            Object.defineProperty(proto, prop, {
                configurable: true,
                enumerable: true,
                get: function () {
                    return this[priv];
                },
                set: function (val) {
                    this[priv] = val;
                    scheduleIfInDocument(this, prop, val, type);
                }
            });
        }
        function watchStyle() {
            var proto = CSSStyleDeclaration.prototype;
            var desc = Object.getOwnPropertyDescriptor(proto, 'cssText');
            Object.defineProperty(proto, 'cssText', {
                configurable: true,
                enumerable: true,
                get: function () {
                    return this._cssText;
                },
                set: function (val) {
                    this._cssText = val;
                    desc.set.apply(this, arguments);
                    var node = this.__node;
                    scheduleIfInDocument(node, null, val, 'style');
                }
            });
        }
    };
    function scheduleIfInDocument(node, prop, val, type) {
        if (inDocument(node.parentNode)) {
            schedule(node, {
                type: type,
                prop: prop,
                value: val
            });
        }
    }
});
/*dom-patch@2.0.2#src/overrides/events*/
define('dom-patch/src/overrides/events', function (require, exports, module) {
    (function (global) {
        var schedule = require('dom-patch/src/scheduler').schedule;
        var scheduleGlobal = require('dom-patch/src/scheduler').scheduleGlobal;
        var inDocument = require('dom-patch/src/overrides/util/in_document');
        module.exports = function (Node) {
            var window = this;
            var proto = Node.prototype;
            var addEventListener = proto.addEventListener;
            proto.addEventListener = function (eventName) {
                if (isNode(this)) {
                    var el = this;
                    if (!el.__events) {
                        el.__events = {};
                    }
                    el.__events[eventName] = true;
                    if (inDocument(el)) {
                        schedule(el, {
                            type: 'event',
                            action: 'addEventListener',
                            event: eventName
                        });
                    }
                }
                return addEventListener.apply(this, arguments);
            };
            var removeEventListener = proto.removeEventListener;
            proto.removeEventListener = function (eventName) {
                if (isNode(this)) {
                    var el = this;
                    if (el.__events) {
                        delete el.__events[eventName];
                    }
                    if (inDocument(el)) {
                        schedule(el, {
                            type: 'event',
                            action: 'removeEventListener',
                            event: eventName
                        });
                    }
                }
                return removeEventListener.apply(this, arguments);
            };
            var windowAddEventListener = window.addEventListener;
            window.addEventListener = function (evName) {
                scheduleGlobal({
                    type: 'globalEvent',
                    action: 'add',
                    name: evName
                });
            };
            return function () {
                proto.addEventListener = addEventListener;
                proto.removeEventListener = removeEventListener;
                window.addEventListener = windowAddEventListener;
            };
        };
        function isNode(obj) {
            return obj && !!obj.nodeType;
        }
    }(function () {
        return this;
    }()));
});
/*dom-patch@2.0.2#src/overrides/history*/
define('dom-patch/src/overrides/history', function (require, exports, module) {
    var scheduleGlobal = require('dom-patch/src/scheduler').scheduleGlobal;
    module.exports = function () {
        var window = this;
        if (!window.history) {
            var noop = function () {
            };
            window.history = {
                pushState: noop,
                replaceState: noop
            };
        }
        var history = window.history;
        var pushState = history.pushState;
        history.pushState = function (stateObject, title, url) {
            scheduleGlobal({
                type: 'history',
                action: 'pushState',
                args: [
                    stateObject,
                    title,
                    url
                ]
            });
            return pushState.apply(this, arguments);
        };
        return function () {
            history.pushState = pushState;
        };
    };
});
/*dom-patch@2.0.2#src/patch/patch*/
define('dom-patch/src/patch/patch', function (require, exports, module) {
    var patchOptions = require('dom-patch/src/patch/patch-options');
    var scheduler = require('dom-patch/src/scheduler');
    var markAsInDocument = require('dom-patch/src/overrides/util/mark_in_document');
    var overrides = [
        require('dom-patch/src/overrides/insert'),
        require('dom-patch/src/overrides/remove'),
        require('dom-patch/src/overrides/attributes'),
        require('dom-patch/src/overrides/prop'),
        require('dom-patch/src/overrides/events'),
        require('dom-patch/src/overrides/history')
    ];
    exports = module.exports = bind;
    exports.bind = bind;
    exports.unbind = unbind;
    exports.deregister = deregister;
    Object.defineProperty(exports, 'collapseTextNodes', {
        set: function (val) {
            patchOptions.collapseTextNodes = val;
        }
    });
    var listeningDocs = [];
    var overrideTeardowns = [];
    var _over = typeof Symbol === 'function' ? Symbol('_override') : '__patch-override';
    function bind(document, callback) {
        var Node = getNodeConstructor(document);
        if (listeningDocs.indexOf(document) === -1) {
            if (!Node[_over]) {
                overrides.forEach(function (override) {
                    var res = override(Node, document);
                    if (typeof res !== 'undefined') {
                        overrideTeardowns.push(res);
                    }
                });
                overrideTeardowns.push(function () {
                    Node[_over] = undefined;
                });
            }
            markAsInDocument(document.documentElement);
            listeningDocs.push(document);
        }
        Node[_over] = true;
        scheduler.register(callback);
    }
    function getNodeConstructor(document) {
        var tn = document.createElement('div');
        var elementProto = Object.getPrototypeOf(tn);
        var nodeProto = Object.getPrototypeOf(elementProto);
        return nodeProto.constructor;
    }
    function unbind(callback) {
        scheduler.unregister(callback);
    }
    function deregister() {
        overrideTeardowns.forEach(function (fn) {
            fn();
        });
        overrideTeardowns = [];
        listeningDocs = [];
        scheduler.unregister();
    }
});
/*dom-patch@2.0.2#src/patch*/
define('dom-patch', function (require, exports, module) {
    module.exports = require('dom-patch/src/patch/patch');
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();