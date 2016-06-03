
var U_LANGUAGES = "i_languages";
var U_THEME = "u_theme";
var U_LOCALE = "u_locale";
var U_USERCODE = "usercode";
var enumerables = true,enumerablesTest = {toString: 1},toString = Object.prototype.toString;

for (var i in enumerablesTest) {
	enumerables = null;
}
if (enumerables) {
	enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
		'toLocaleString', 'toString', 'constructor'];
}

window.u = window.u || {};
//window.$ = {}
var u = window.u;
//var $ = u;

u.enumerables = enumerables;
/**
 * 复制对象属性
 *
 * @param {Object}  目标对象
 * @param {config} 源对象
 */
u.extend = function(object, config) {
	var args = arguments,options;
	if(args.length > 1){
		for(var len=1; len<args.length; len++){
			options = args[len];
			if (object && options && typeof options === 'object') {
				var i, j, k;
				for (i in options) {
					object[i] = options[i];
				}
				if (enumerables) {
					for (j = enumerables.length; j--;) {
						k = enumerables[j];
						if (options.hasOwnProperty && options.hasOwnProperty(k)) {
							object[k] = options[k];
						}
					}
				}
			}
		}
	}
	return object;
};

u.extend(u, {
	setCookie: function (sName, sValue, oExpires, sPath, sDomain, bSecure) {
		var sCookie = sName + "=" + encodeURIComponent(sValue);
		if (oExpires)
			sCookie += "; expires=" + oExpires.toGMTString();
		if (sPath)
			sCookie += "; path=" + sPath;
		if (sDomain)
			sCookie += "; domain=" + sDomain;
		if (bSecure)
			sCookie += "; secure=" + bSecure;
		document.cookie = sCookie;
	},
	getCookie: function (sName) {
		var sRE = "(?:; )?" + sName + "=([^;]*);?";
		var oRE = new RegExp(sRE);

		if (oRE.test(document.cookie)) {
			return decodeURIComponent(RegExp["$1"]);
		} else
			return null;
	},
	/**
	 * 创建一个带壳的对象,防止外部修改
	 * @param {Object} proto
	 */
	createShellObject: function (proto) {
		var exf = function () {
		}
		exf.prototype = proto;
		return new exf();
	},
	execIgnoreError: function (a, b, c) {
		try {
			a.call(b, c);
		} catch (e) {
		}
	},
	on: function (element, eventName,child,listener) {
		if(!element)
			return;
		if(arguments.length < 4){
			listener = child;
			child = undefined;
		}else{
			var childlistener = function(e){
				if(!e){
					return;
				}
				var tmpchildren = element.querySelectorAll(child)
				tmpchildren.forEach(function(node){
					if(node == e.target){
							listener.call(e.target,e)
					}
				})
			}
		}
		//capture = capture || false;

		if(!element["uEvent"]){
			//在dom上添加记录区
			element["uEvent"] = {}
		}
		//判断是否元素上是否用通过on方法填加进去的事件
		if(!element["uEvent"][eventName]){
			element["uEvent"][eventName] = [child?childlistener:listener]
			if(u.event && u.event[eventName] && u.event[eventName].setup){
				u.event[eventName].setup.call(element);
			}
			element["uEvent"][eventName+'fn'] = function(e){
												//火狐下有问题修改判断
												if(!e)
													e = typeof event != 'undefined' && event?event:window.event;
												element["uEvent"][eventName].forEach(function(fn){
													e.target = e.target || e.srcElement;//兼容IE8
													if(fn)
														fn.call(element,e)
												})
											}
			if (element.addEventListener) {  // 用于支持DOM的浏览器
				element.addEventListener(eventName, element["uEvent"][eventName+'fn']);
			} else if (element.attachEvent) {  // 用于IE浏览器
				element.attachEvent("on" + eventName,element["uEvent"][eventName+'fn'] );
			} else {  // 用于其它浏览器
				element["on" + eventName] = element["uEvent"][eventName+'fn']
			}
		}else{
			//如果有就直接往元素的记录区添加事件
			var lis = child?childlistener:listener;
			var hasLis = false;
			element["uEvent"][eventName].forEach(function(fn){
				if(fn == lis){
					hasLis = true;
				}
			});
			if(!hasLis){
				element["uEvent"][eventName].push(child?childlistener:listener)
			}
		}

	},
	off: function(element, eventName, listener){
		//删除事件数组
		if(listener){
			if(element && element["uEvent"] && element["uEvent"][eventName]){
				element["uEvent"][eventName].forEach(function(fn,i){
					if(fn == listener){
						element["uEvent"][eventName].splice(i,1);
					}
				});
			}
			return;
		}
		var eventfn = element["uEvent"][eventName+'fn']
		if (element.removeEventListener) {  // 用于支持DOM的浏览器
			element.removeEventListener(eventName,eventfn );
		} else if (element.removeEvent) {  // 用于IE浏览器
			element.removeEvent("on" + eventName, eventfn);
		} else {  // 用于其它浏览器
			delete element["on" + eventName]
		}
		if(u.event && u.event[eventName] && u.event[eventName].teardown){
			u.event[eventName].teardown.call(element);
		}
		element["uEvent"][eventName] = undefined
		element["uEvent"][eventName+'fn'] = undefined


	},
	trigger:function(element,eventName){
		if(element["uEvent"] && element["uEvent"][eventName]){
			element["uEvent"][eventName+'fn']()
		}
	},
	/**
	 * 增加样式
	 * @param value
	 * @returns {*}
	 */
	addClass: function (element, value) {
		if (typeof element.classList === 'undefined') {
			if(u._addClass)
				u._addClass(element, value);
		} else {
			element.classList.add(value);
		}
		return u;
	},
	removeClass: function (element, value) {
		if (typeof element.classList === 'undefined') {
			if(u._removeClass)
				u._removeClass(element, value);
		} else {
			element.classList.remove(value);
		}
		return u;
	},
	hasClass: function(element, value){
		if (!element) return false;
		if (element.nodeName && (element.nodeName === '#text'||element.nodeName === '#comment')) return false;
		if (typeof element.classList === 'undefined') {
			if(u._hasClass)
				return u._hasClass(element,value);
			return false;
		}else{
			return element.classList.contains(value);
		}
	},
	toggleClass: function(element,value){
		if (typeof element.classList === 'undefined') {
			return u._toggleClass(element,value);
		}else{
			return element.classList.toggle(value);
		}
	},
	closest: function(element, selector) {
		var tmp = element;
		while(tmp != null &&!u.hasClass(tmp, selector) && tmp != document.body ) {
		  tmp = tmp.parentNode;
		}
		if(tmp == document.body) return null;
		return tmp;
	},
	css:function(element,csstext,val){
		if(csstext instanceof Object){
			for(var k in csstext){
				var tmpcss = csstext[k]
				if(["width","height","top","bottom","left","right"].indexOf(k) > -1 && u.isNumber(tmpcss) ){
					tmpcss = tmpcss + "px"
				}
				element.style[k] = tmpcss
			}
		}else{
			if(arguments.length > 2){
				element.style[csstext] = val
			}else{
				u.getStyle(element,csstext)
			}
		}

	},
	wrap:function(element,parent){
		var p = u.makeDOM(parent)
			element.parentNode.insertBefore(p,element)
			p.appendChild(element)
	},
	getStyle:function(element,key){
		//不要在循环里用
		var allCSS
		if(window.getComputedStyle){
			allCSS = window.getComputedStyle(element)
		}else{
			allCSS = element.currentStyle
		}
		if(allCSS[key] !== undefined){
			return allCSS[key]
		}else{
			return ""
		}
	},
	/**
	 * 统一zindex值, 不同控件每次显示时都取最大的zindex，防止显示错乱
	 */
	getZIndex: function(){
		if (!u.globalZIndex){
			u.globalZIndex = 2000;
		}
		return u.globalZIndex ++;
	},
	makeDOM: function(htmlString){
		var tempDiv = document.createElement("div");
		tempDiv.innerHTML = htmlString;
		var _dom = tempDiv.children[0];
		return _dom;
	},
	makeModal : function(element){
	    var overlayDiv = document.createElement('div');
	    u.addClass(overlayDiv, 'u-overlay');
	    overlayDiv.style.zIndex = u.getZIndex();
	    document.body.appendChild(overlayDiv)
	    element.style.zIndex = u.getZIndex();
	    u.on(overlayDiv, 'click', function(e){
	        u.stopEvent(e);
	    })
	    return overlayDiv;
	},
	getOffset : function(Node, offset){
		if (!offset) {
	        offset = {};
	        offset.top = 0;
	        offset.left = 0;
	    }
	    if (Node == document.body) {
	        return offset;
	    }
	    offset.top += Node.offsetTop;
	    offset.left += Node.offsetLeft;
	    if(Node.offsetParent)
	    	return u.getOffset(Node.offsetParent, offset);
	    else
	    	return offset;
	},
	getScroll:function(Node, offset){
		if (!offset) {
	        offset = {};
	        offset.top = 0;
	        offset.left = 0;
	    }
	    if (Node == document.body) {
	    	offset.top += Node.scrollTop;
	    	offset.left += Node.scrollLeft;
	        return offset;
	    }
	    offset.top += Node.scrollTop;
	    offset.left += Node.scrollLeft;
	    if(Node.parentNode)
	    	return u.getScroll(Node.parentNode, offset);
	    else
	    	return offset;
	},
	showPanelByEle:function(obj){
		var ele = obj.ele,panel = obj.panel,position = obj.position,
			off = u.getOffset(ele),scroll = u.getScroll(ele),
			offLeft = off.left,offTop = off.top,
			scrollLeft = scroll.left,scrollTop = scroll.top,
			eleWidth = ele.offsetWidth,eleHeight = ele.offsetHeight,
			panelWidth = panel.offsetWidth,panelHeight = panel.offsetHeight,
			bodyWidth = document.body.clientWidth,bodyHeight = document.body.clientHeight,
			position = position || 'top',
			left = offLeft - scrollLeft,top = offTop - scrollTop;
			// 基准点为Ele的左上角
			// 后续根据需要完善
		if(position == 'left'){
			
		}else if(position == 'right'){

		}else if(position == 'topCenter'){
			left = left + (eleWidth - panelWidth)/2;
			top = top - panelHeight;
		}else if(position == 'bottomLeft'){
			left = left;
			top = top + eleHeight;
		}
        
        if((left + panelWidth) > bodyWidth)
            left = bodyWidth - panelWidth;
        if(left < 0)
            left = 0;

        if((top + panelHeight) > bodyHeight)
            top = bodyHeight - panelHeight;
        if(top < 0)
            top = 0;
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
	},

	/**
	 * 阻止冒泡
	 */
	stopEvent: function(e){
		if(typeof(e) != "undefined") {
			if (e.stopPropagation)
				e.stopPropagation();
			else {
				e.cancelBubble = true;
			}
			//阻止默认浏览器动作(W3C)
			if (e && e.preventDefault)
				e.preventDefault();
			//IE中阻止函数器默认动作的方式
			else
				window.event.returnValue = false;
		}
	},
	getFunction: function(target, val){
		if (!val || typeof val == 'function') return val
		if (typeof target[val] == 'function')
			return target[val]
		else if (typeof window[val] == 'function')
			return window[val]
		else if (val.indexOf('.') != -1){
			var func = u.getJSObject(target, val)
			if (typeof func == 'function') return func
			func = u.getJSObject(window, val)
			if (typeof func == 'function') return func
		}
		return val
	},
	getJSObject: function(target, names) {
		if(!names) {
			return;
		}
		if (typeof names == 'object')
			return names
		var nameArr = names.split('.')
		var obj = target
		for (var i = 0; i < nameArr.length; i++) {
			obj = obj[nameArr[i]]
			if (!obj) return null
		}
		return obj
	},
	isDate: function(input){
		return Object.prototype.toString.call(input) === '[object Date]' ||
				input instanceof Date;
	},
	isNumber : function(obj){
		//return obj === +obj
		return (obj - parseFloat( obj ) + 1) >= 0;
	},
	isArray: Array.isArray || function (val) {
		return Object.prototype.toString.call(val) === '[object Array]';
	},
	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},
	inArray :function(node,arr){


	  if(!arr instanceof Array){
		throw "arguments is not Array";
	  }

	  for(var i=0,k=arr.length;i<k;i++){
		if(node==arr[i]){
		  return true;
		}
	  }

	  return false;
	},
	each: function(obj,callback){
		if(obj.forEach){
			obj.forEach(function(v,k){callback(k,v)})

		}else if(obj instanceof Object){
			for(var k in obj){
				callback(k,obj[k])
			}
		}else{
			return
		}

	}

});

//core context
(function() {
	var environment = {};
	/**
	 * client attributes
	 */
	var clientAttributes = {};

	var sessionAttributes = {};

	var fn = {};
	var maskerMeta = {
		'float': {
			precision: 2
		},
		'datetime': {
			format: 'YYYY-MM-DD HH:mm:ss',
			metaType: 'DateTimeFormatMeta',
			speratorSymbol: '-'
		},
		'time':{
			format:'HH:mm'
		},
		'date':{
			format:'YYYY-MM-DD'
		},
		'currency':{
			precision: 2,
			curSymbol: '￥'
		},
		'percent':{

		}
	};
	/**
	 * 获取环境信息
	 * @return {environment}
	 */
	fn.getEnvironment = function() {
		return u.createShellObject(environment);
	};

	/**
	 * 获取客户端参数对象
	 * @return {clientAttributes}
	 */
	fn.getClientAttributes = function() {
		var exf = function() {}
		return u.createShellObject(clientAttributes);
	}


	fn.setContextPath = function(contextPath) {
		return environment[IWEB_CONTEXT_PATH] = contextPath
	}
	fn.getContextPath = function(contextPath) {
		return environment[IWEB_CONTEXT_PATH]
	}
	/**
	 * 设置客户端参数对象
	 * @param {Object} k 对象名称
	 * @param {Object} v 对象值(建议使用简单类型)
	 */
	fn.setClientAttribute = function(k, v) {
		clientAttributes[k] = v;
	}
	/**
	 * 获取会话级参数对象
	 * @return {clientAttributes}
	 */
	fn.getSessionAttributes = function() {
		var exf = function() {}
		return u.createShellObject(sessionAttributes);
	}

	/**
	 * 设置会话级参数对象
	 * @param {Object} k 对象名称
	 * @param {Object} v 对象值(建议使用简单类型)
	 */
	fn.setSessionAttribute = function(k, v) {
		sessionAttributes[k] = v;
		setCookie("ISES_" + k, v);
	}

	/**
	 * 移除客户端参数
	 * @param {Object} k 对象名称
	 */
	fn.removeClientAttribute = function(k) {
		clientAttributes[k] = null;
		execIgnoreError(function() {
			delete clientAttributes[k];
		})
	}

		/**
		 * 获取地区信息编码
		 */
		fn.getLocale = function() {
			return this.getEnvironment().locale
		}

	/**
	 * 获取多语信息
	 */
	fn.getLanguages = function(){
		return this.getEnvironment().languages
	};
	/**
	 * 收集环境信息(包括客户端参数)
	 * @return {Object}
	 */
	fn.collectEnvironment = function() {
		var _env = this.getEnvironment();
		var _ses = this.getSessionAttributes();

		for (var i in clientAttributes) {
			_ses[i] = clientAttributes[i];
		}
		_env.clientAttributes = _ses;
		return _env
	}

	/**
	 * 设置数据格式信息
	 * @param {String} type
	 * @param {Object} meta
	 */
	fn.setMaskerMeta = function(type, meta) {
		if (typeof type == 'function'){
			getMetaFunc = type;
		}else{
			if (!maskerMeta[type])
				maskerMeta[type] = meta;
			else{
				if (typeof meta != 'object')
					maskerMeta[type] = meta;
				else
					for (var key in meta){
						maskerMeta[type][key] = meta[key];
					}
			}
		}
	};
	fn.getMaskerMeta = function(type) {
		if (typeof getMetaFunc == 'function'){
			var meta = getMetaFunc.call(this);
			return meta[type];
		}else
			return u.extend({}, maskerMeta[type]);
	};
	environment.languages = u.getCookie(U_LANGUAGES) ? u.getCookie(U_LANGUAGES).split(',') : navigator.language ? navigator.language : 'zh-CN';
	if(environment.languages == 'zh-cn')
		environment.languages = 'zh-CN'
	if(environment.languages == 'en-us')
		environment.languages = 'en-US'

	environment.theme = u.getCookie(U_THEME);
	environment.locale = u.getCookie(U_LOCALE);
	//environment.timezoneOffset = (new Date()).getTimezoneOffset()
	environment.usercode = u.getCookie(U_USERCODE);
	//init session attribute
	document.cookie.replace(/ISES_(\w*)=([^;]*);?/ig, function(a, b, c) {
		sessionAttributes[b] = c;
	});


	var Core = function() {};
	Core.prototype = fn;

	u.core = new Core();

})();

u.extend(u, {
	isIE:  false,
	isFF: false,
	isOpera: false,
	isChrome: false,
	isSafari: false,
	isWebkit: false,
	isIE8_BEFORE: false,
	isIE8: false,
	isIE8_CORE: false,
	isIE9: false,
	isIE9_CORE: false,
	isIE10: false,
	isIE10_ABOVE: false,
	isIE11: false,
	isIOS: false,
	isIphone: false,
	isIPAD: false,
	isStandard: false,
	version: 0,
	isWin: false,
	isUnix: false,
	isLinux: false,
	isAndroid: false,
	isMac: false,
	hasTouch: false,
	isMobile: false
});

(function(){
	var userAgent = navigator.userAgent,
			rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
			rFirefox = /(firefox)\/([\w.]+)/,
			rOpera = /(opera).+version\/([\w.]+)/,
			rChrome = /(chrome)\/([\w.]+)/,
			rSafari = /version\/([\w.]+).*(safari)/,
			version,
			ua = userAgent.toLowerCase(),
			s,
			browserMatch = { browser : "", version : ''},
			match = rMsie.exec(ua);

	if (match != null) {
		browserMatch =  { browser : "IE", version : match[2] || "0" };
	}
	match = rFirefox.exec(ua);
	if (match != null) {
		browserMatch =  { browser : match[1] || "", version : match[2] || "0" };
	}
	match = rOpera.exec(ua);
	if (match != null) {
		browserMatch =  { browser : match[1] || "", version : match[2] || "0" };
	}
	match = rChrome.exec(ua);
	if (match != null) {
		browserMatch =  { browser : match[1] || "", version : match[2] || "0" };
	}
	match = rSafari.exec(ua);
	if (match != null) {
		browserMatch =  { browser : match[2] || "", version : match[1] || "0" };
	}
	if (match != null) {
		browserMatch =  { browser : "", version : "0" };
	}


	if (s=ua.match(/opera.([\d.]+)/)) {
		u.isOpera = true;
	}else if(browserMatch.browser=="IE"&&browserMatch.version==11){
		u.isIE11 = true;
		u.isIE = true;
	}else if (s=ua.match(/chrome\/([\d.]+)/)) {
		u.isChrome = true;
		u.isStandard = true;
	} else if (s=ua.match(/version\/([\d.]+).*safari/)) {
		u.isSafari = true;
		u.isStandard = true;
	} else if (s=ua.match(/gecko/)) {
		//add by licza : support XULRunner
		u.isFF = true;
		u.isStandard = true;
	} else if (s=ua.match(/msie ([\d.]+)/)) {
		u.isIE = true;
	}

	else if (s=ua.match(/firefox\/([\d.]+)/)) {
		u.isFF = true;
		u.isStandard = true;
	}
	if (ua.match(/webkit\/([\d.]+)/)) {
		u.isWebkit = true;
	}
	if (ua.match(/ipad/i)){
		u.isIOS = true;
		u.isIPAD = true;
		u.isStandard = true;
	}
	if (ua.match(/iphone/i)){
		u.isIOS = true;
		u.isIphone = true;
	}

	if((navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel")){
		//u.isIOS = true;
		u.isMac = true;
	}

	if((navigator.platform == "Win32") || (navigator.platform == "Windows") || (navigator.platform == "Win64")){
		u.isWin = true;
	}

	if((navigator.platform == "X11") && !u.isWin && !u.isMac){
		u.isUnix = true;
	}
	 if((String(navigator.platform).indexOf("Linux") > -1)){
    	u.isLinux = true;
    }
    
    if(ua.indexOf('Android') > -1 || ua.indexOf('android') > -1 || ua.indexOf('Adr') > -1 || ua.indexOf('adr') > -1){
    	u.isAndroid = true;
    }

	u.version = version ? (browserMatch.version ?  browserMatch.version : 0) : 0;
	if (u.isIE) {
		var intVersion = parseInt(u.version);
		var mode = document.documentMode;
		if(mode == null){
			if (intVersion == 6 || intVersion == 7) {
				u.isIE8_BEFORE = true;
			}
		}
		else{
			if(mode == 7){
				u.isIE8_BEFORE = true;
			}
			else if (mode == 8) {
				u.isIE8 = true;
			}
			else if (mode == 9) {
				u.isIE9 = true;
				u.isSTANDARD = true;
			}
			else if (mode == 10) {
				u.isIE10 = true;
				u.isSTANDARD = true;
				u.isIE10_ABOVE = true;
			}
			else{
				u.isSTANDARD = true;
			}
			if (intVersion == 8) {
				u.isIE8_CORE = true;
			}
			else if (intVersion == 9) {
				u.isIE9_CORE = true;
			}
			else if(browserMatch.version==11){
				u.isIE11 = true;
			}
			else{

			}
		}
	}
	if("ontouchend" in document) {
		u.hasTouch = true;
	}
	if(u.isIOS || u.isAndroid)
		u.isMobile = true;
})();

if (u.isIE8_BEFORE){
	alert('uui 不支持IE8以前的浏览器版本，请更新IE浏览器或使用其它浏览器！')
	throw new Error('uui 不支持IE8以前的浏览器版本，请更新IE浏览器或使用其它浏览器！');
}
if (u.isIE8 && !u.polyfill){
	alert('IE8浏览器中使用uui 必须在u.js之前引入u-polyfill.js!');
	throw new Error('IE8浏览器中使用uui 必须在uui之前引入u-polyfill.js!');
}
//TODO 兼容 后面去掉
//u.Core = u.core;
window.iweb = {};
window.iweb.Core = u.core;
window.iweb.browser = {
	isIE: u.isIE,
	isFF: u.isFF,
	isOpera: u.isOpera,
	isChrome: u.isChrome,
	isSafari: u.isSafari,
	isWebkit: u.isWebkit,
	isIE8_BEFORE: u.isIE8_BEFORE,
	isIE8: u.isIE8,
	isIE8_CORE: u.isIE8_CORE,
	isIE9: u.isIE9,
	isIE9_CORE: u.isIE9_CORE,
	isIE10: u.isIE10,
	isIE10_ABOVE: u.isIE10_ABOVE,
	isIE11: u.isIE11,
	isIOS: u.isIOS,
	isIphone: u.isIphone,
	isIPAD: u.isIPAD,
	isStandard: u.isStandard,
	version: 0,
	isWin: u.isWin,
	isUnix: u.isUnix, 
	isLinux: u.isLinux,
	isAndroid: u.isAndroid,
	isMac: u.isMac,
	hasTouch: u.hasTouch
};

u.isDomElement = function(obj) {
    if (window['HTMLElement']) {
        return obj instanceof HTMLElement;
    } else {
        return obj && obj.tagName && obj.nodeType === 1;
    }
}
var Class = function (o) {
    if (!(this instanceof Class) && isFunction(o)) {
        return classify(o)
    }
}

// Create a new Class.
//
//  var SuperPig = Class.create({
//    Extends: Animal,
//    Implements: Flyable,
//    initialize: function() {
//      SuperPig.superclass.initialize.apply(this, arguments)
//    },
//    Statics: {
//      COLOR: 'red'
//    }
// })
//
Class.create = function (parent, properties) {
    if (!isFunction(parent)) {
        properties = parent
        parent = null
    }

    properties || (properties = {})
    parent || (parent = properties.Extends || Class)
    properties.Extends = parent

    // The created class constructor
    function SubClass() {
        var ret;
        // Call the parent constructor.
        parent.apply(this, arguments)

        // Only call initialize in self constructor.
        if (this.constructor === SubClass && this.initialize) {
            ret = this.initialize.apply(this, arguments)
        }
        return ret ? ret : this;
    }

    // Inherit class (static) properties from parent.
    if (parent !== Class) {
        mix(SubClass, parent, parent.StaticsWhiteList)
    }

    // Add instance properties to the subclass.
    implement.call(SubClass, properties)

    // Make subclass extendable.
    return classify(SubClass)
}

function implement(properties) {
    var key, value

    for (key in properties) {
        value = properties[key]

        if (Class.Mutators.hasOwnProperty(key)) {
            Class.Mutators[key].call(this, value)
        } else {
            this.prototype[key] = value
        }
    }
}


// Create a sub Class based on `Class`.
Class.extend = function (properties) {
    properties || (properties = {})
    properties.Extends = this

    return Class.create(properties)
}


function classify(cls) {
    cls.extend = Class.extend
    cls.implement = implement
    return cls
}


// Mutators define special properties.
Class.Mutators = {

    'Extends': function (parent) {
        var existed = this.prototype
        var proto = createProto(parent.prototype)

        // Keep existed properties.
        mix(proto, existed)

        // Enforce the constructor to be what we expect.
        proto.constructor = this

        // Set the prototype chain to inherit from `parent`.
        this.prototype = proto

        // Set a convenience property in case the parent's prototype is
        // needed later.
        this.superclass = parent.prototype
    },

    'Implements': function (items) {
        isArray(items) || (items = [items])
        var proto = this.prototype,
            item

        while (item = items.shift()) {
            mix(proto, item.prototype || item)
        }
    },

    'Statics': function (staticProperties) {
        mix(this, staticProperties)
    }
}


// Shared empty constructor function to aid in prototype-chain creation.
function Ctor() {
}

// See: http://jsperf.com/object-create-vs-new-ctor
var createProto = Object.__proto__ ?
    function (proto) {
        return {
            __proto__: proto
        }
    } :
    function (proto) {
        Ctor.prototype = proto
        return new Ctor()
    }


// Helpers
// ------------

function mix(r, s, wl) {
    // Copy "all" properties including inherited ones.
    for (var p in s) {
        if (s.hasOwnProperty(p)) {
            if (wl && indexOf(wl, p) === -1) continue

            // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
            if (p !== 'prototype') {
                r[p] = s[p]
            }
        }
    }
}


var toString = Object.prototype.toString

var isArray = Array.isArray || function (val) {
        return toString.call(val) === '[object Array]'
    }

var isFunction = function (val) {
    return toString.call(val) === '[object Function]'
}

var indexOf = function(arr, item){
    if (Array.prototype.indexOf && arr.indexOf){
        return arr.indexOf(item);
    }else{
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return i
            }
        }
        return -1
    }
}

u.Class = Class



function _findRegisteredClass(name, optReplace) {
    for (var i = 0; i < CompMgr.registeredControls.length; i++) {
        if (CompMgr.registeredControls[i].className === name) {
            if (typeof optReplace !== 'undefined') {
                CompMgr.registeredControls[i] = optReplace;
            }
            return CompMgr.registeredControls[i];
        }
    }
    return false;
}

function _getUpgradedListOfElement(element) {
    var dataUpgraded = element.getAttribute('data-upgraded');
    // Use `['']` as default value to conform the `,name,name...` style.
    return dataUpgraded === null ? [''] : dataUpgraded.split(',');
}

function _isElementUpgraded(element, jsClass) {
    var upgradedList = _getUpgradedListOfElement(element);
    return upgradedList.indexOf(jsClass) != -1;
}

function _upgradeElement(element, optJsClass) {
    if (!(typeof element === 'object' && element instanceof Element)) {
        throw new Error('Invalid argument provided to upgrade MDL element.');
    }
    var upgradedList = _getUpgradedListOfElement(element);
    var classesToUpgrade = [];
    if (!optJsClass) {
        var className = element.className;
        for(var i=0; i< CompMgr.registeredControls.length; i++){
            var component = CompMgr.registeredControls[i]
            if (className.indexOf(component.cssClass) > -1 && classesToUpgrade.indexOf(component) === -1 &&
                !_isElementUpgraded(element, component.className)) {
                classesToUpgrade.push(component);
            }
        }
    } else if (!_isElementUpgraded(element, optJsClass)) {
        classesToUpgrade.push(_findRegisteredClass(optJsClass));
    }

    // Upgrade the element for each classes.
    for (var i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
        registeredClass = classesToUpgrade[i];
        if (registeredClass) {
            if (element[registeredClass.className]){
                continue;
            }
            // Mark element as upgraded.
            upgradedList.push(registeredClass.className);
            element.setAttribute('data-upgraded', upgradedList.join(','));
            var instance = new registeredClass.classConstructor(element);
            CompMgr.createdControls.push(instance);
            // Call any callbacks the user has registered with this component type.
            for (var j = 0, m = registeredClass.callbacks.length; j < m; j++) {
                registeredClass.callbacks[j](element);
            }
            element[registeredClass.className] = instance;
        } else {
            throw new Error('Unable to find a registered component for the given class.');
        }

    }
}

function _upgradeDomInternal(optJsClass, optCssClass, ele) {
    if (typeof optJsClass === 'undefined' && typeof optCssClass === 'undefined') {
        for (var i = 0; i < CompMgr.registeredControls.length; i++) {
            _upgradeDomInternal(CompMgr.registeredControls[i].className, registeredControls[i].cssClass, ele);
        }
    } else {
        var jsClass = (optJsClass);
        if (!optCssClass) {
            var registeredClass = _findRegisteredClass(jsClass);
            if (registeredClass) {
                optCssClass = registeredClass.cssClass;
            }
        }
        var elements;
        if(ele) {
            elements = u.hasClass(ele, optCssClass) ? [ele] : ele.querySelectorAll('.' + optCssClass);
        } else {
           elements = document.querySelectorAll('.' + optCssClass);
        }
        for (var n = 0; n < elements.length; n++) {
            _upgradeElement(elements[n], jsClass);
        }
    }
}

var CompMgr = {
    plugs: {},
    dataAdapters:{},
    /** 注册的控件*/
    registeredControls: [],
    createdControls: [],
    /**
     *
     * @param options  {el:'#content', model:{}}
     */
    apply: function (options) {
		if(options){
        var _el = options.el||document.body;
        var model = options.model;
		}
        if (typeof _el == 'string'){
            _el = document.body.querySelector(_el);
        }
        if (_el == null || typeof _el != 'object')
            _el = document.body;
        var comps =_el.querySelectorAll('[u-meta]');
        comps.forEach(function(element){
            if (element['comp']) return;
            var options = JSON.parse(element.getAttribute('u-meta'));
            if (options && options['type']) {
                //var comp = CompMgr._createComp({el:element,options:options,model:model});
                var comp = CompMgr.createDataAdapter({el:element,options:options,model:model});
                if (comp){
                    element['adpt'] = comp;
                    element['u-meta'] = comp;
                }
            }
        });
    },
    addPlug: function (config) {
        var plug = config['plug'],
            name = config['name'];
        this.plugs || (this.plugs = {});
        if (this.plugs[name]) {
            throw new Error('plug has exist:' + name);
        }
        plug.compType = name;
        this.plugs[name] = plug
    },
    addDataAdapter: function(config){
        var adapter = config['adapter'],
            name = config['name'];
            //dataType = config['dataType'] || ''
        //var key = dataType ? name + '.' + dataType : name;
        this.dataAdapters || (dataAdapters = {});
        if(this.dataAdapters[name]){
            throw new Error('dataAdapter has exist:' + name);
        }
        this.dataAdapters[name] = adapter;

    },
    getDataAdapter: function(name){
        if (!name) return;
        this.dataAdapters || (dataAdapters = {});
        //var key = dataType ? name + '.' + dataType : name;
        return this.dataAdapters[name];
    },
    createDataAdapter: function(options){
        var opt = options['options'];
        var type = opt['type'],
            id = opt['id'];
        var adpt = this.dataAdapters[type];
        if (!adpt) return null;
        var comp = new adpt(options);
        comp.type = type;
        comp.id = id;
        return comp;
    },
    _createComp: function (options) {
        var opt = options['options'];
        var type = opt['type'];
        var plug = this.plugs[type];
        if (!plug) return null;
        var comp = new plug(options);
        comp.type = type;
        return comp;
    },
    /**
     * 注册UI控件
     */
    regComp: function(config){
        var newConfig = {
            classConstructor: config.comp,
            className: config.compAsString || config['compAsString'],
            cssClass: config.css || config['css'],
            callbacks: []
        };
        config.comp.prototype.compType = config.compAsString;
        for(var i=0; i< this.registeredControls.length; i++){
            var item = this.registeredControls[i];
            //registeredControls.forEach(function(item) {
            if (item.cssClass === newConfig.cssClass) {
                throw new Error('The provided cssClass has already been registered: ' + item.cssClass);
            }
            if (item.className === newConfig.className) {
                throw new Error('The provided className has already been registered');
            }
        };
        this.registeredControls.push(newConfig);
    },
    updateComp: function(ele){
        for (var n = 0; n < this.registeredControls.length; n++) {
            _upgradeDomInternal(this.registeredControls[n].className,null ,ele);
        }
    }
};

u.compMgr = CompMgr;

///**
// * 加载控件
// */
//
//if (document.readyState && document.readyState === 'complete'){
//    u.compMgr.updateComp();
//}else{
//    u.on(window, 'load', function() {
//
//        //扫描并生成控件
//        u.compMgr.updateComp();
//    });
//}


NodeList.prototype.forEach = Array.prototype.forEach;


/**
 * 获得字符串的字节长度
 */
String.prototype.lengthb = function() {
    //	var str = this.replace(/[^\x800-\x10000]/g, "***");
    var str = this.replace(/[^\x00-\xff]/g, "**");
    return str.length;
};

/**
 * 将AFindText全部替换为ARepText
 */
String.prototype.replaceAll = function(AFindText, ARepText) {
    //自定义String对象的方法
    var raRegExp = new RegExp(AFindText, "g");
    return this.replace(raRegExp, ARepText);
};


//
//if (window.i18n) {
//    var scriptPath = getCurrentJsPath(),
//        _temp = scriptPath.substr(0, scriptPath.lastIndexOf('/')),
//        __FOLDER__ = _temp.substr(0, _temp.lastIndexOf('/'))
//    u.uuii18n = u.extend({}, window.i18n)
//    u.uuii18n.init({
//        postAsync: false,
//        getAsync: false,
//        fallbackLng: false,
//        ns: {namespaces: ['uui-trans']},
//        resGetPath: __FOLDER__ + '/locales/__lng__/__ns__.json'
//    })
//}

window.trans = u.trans = function (key, dftValue) {
    return  u.uuii18n ?  u.uuii18n.t('uui-trans:' + key) : dftValue
}


/**
 * 处理数据显示格式
 */

u.floatRender = function (value, precision) {
    var trueValue = value;
    if (typeof value === 'undefined' || value === null)
        return value;
    //value 为 ko对象
    if (typeof value === 'function')
        trueValue = value();
    var maskerMeta = u.core.getMaskerMeta('float') || {};
    if (typeof precision === 'number')
        maskerMeta.precision = precision;
    var formater = new u.NumberFormater(maskerMeta.precision);
    var masker = new NumberMasker(maskerMeta);
    return masker.format(formater.format(trueValue)).value;
};

u.integerRender = function (value) {
    var trueValue = value;
    if (typeof value === 'undefined' || value === null)
        return value;
    //value 为 ko对象
    if (typeof value === 'function')
        trueValue = value();
    return trueValue
};

var _dateRender = function(value, format, type){
    var trueValue = value;
    if (typeof value === 'undefined' || value === null)
        return value
    //value 为 ko对象
    if (typeof value === 'function')
        trueValue = value()
    var maskerMeta = u.core.getMaskerMeta(type) || {}
    if (typeof format != 'undefined')
        maskerMeta.format = format
    var maskerValue = u.date.format(trueValue, maskerMeta.format);
    return maskerValue;
}

u.dateRender = function (value, format) {
    return _dateRender(value, format, 'date');
};

u.dateTimeRender = function (value, format) {
    return _dateRender(value, format, 'datetime');
};

u.timeRender = function (value, format) {
    return _dateRender(value, format, 'time');
};

u.percentRender = function (value) {
    var trueValue = value
    if (typeof value === 'undefined' || value === null)
        return value
    //value 为 ko对象
    if (typeof value === 'function')
        trueValue = value()
    var maskerMeta = u.core.getMaskerMeta('percent') || {}
    var masker = new PercentMasker(maskerMeta);
    var maskerValue = masker.format(trueValue);
    return (maskerValue && maskerValue.value) ? maskerValue.value : '';
};

u.dateToUTCString = function (date) {
    if (!date) return ''
    if (date.indexOf("-") > -1)
        date = date.replace(/\-/g, "/");
    var utcString = Date.parse(date);
    if (isNaN(utcString)) return "";
    return utcString;
}



u.date= {
    /**
     * 多语言处理
     */
    //TODO 后续放到多语文件中
    _dateLocale:{
        'zh-CN':{
            months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
            monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
            weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
            weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
            weekdaysMin : '日_一_二_三_四_五_六'.split('_')
        },
        'en-US':{
            months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thurday_Friday_Saturday'.split('_'),
            weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin : 'S_M_T_W_T_F_S'.split('_')
        }
    },

    _formattingTokens : /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYY|YY|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,

    leftZeroFill : function(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),sign = number >= 0;
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    },

    _formats: {
        //year
        YY   : function (date) {
            return u.date.leftZeroFill(date.getFullYear() % 100, 2);
        },
        YYYY : function (date) {
            return date.getFullYear();
        },
        //month
        M : function (date) {
            return date.getMonth() + 1;
        },
        MM: function(date){
            var m = u.date._formats.M(date);
            return u.date.leftZeroFill(m,2);
        },
        MMM  : function (date, language) {
            var m = date.getMonth();
            return u.date._dateLocale[language].monthsShort[m];
        },
        MMMM : function (date, language) {
            var m = date.getMonth();
            return u.date._dateLocale[language].months[m];
        },
        //date
        D : function (date) {
            return date.getDate();
        },
        DD: function(date){
            var d = u.date._formats.D(date);
            return u.date.leftZeroFill(d,2);
        },
        // weekday
        d : function (date) {
            return date.getDay();
        },
        dd : function (date, language) {
            var d = u.date._formats.d(date);
            return u.date._dateLocale[language].weekdaysMin[d];
        },
        ddd : function (date, language) {
            var d = u.date._formats.d(date);
            return u.date._dateLocale[language].weekdaysShort[d];
        },
        dddd : function (date, language) {
            var d = u.date._formats.d(date);
            return u.date._dateLocale[language].weekdays[d];
        },
        // am pm
        a: function(date){
            if (date.getHours() > 12){
                return 'pm';
            }else{
                return 'am';
            }
        },
        //hour
        h: function(date){
            var h = date.getHours();
            h = h > 12 ? h-12 : h;
            return h
        },
        hh: function(date){
            var h = u.date._formats.h(date);
            return u.date.leftZeroFill(h,2);
        },
        H: function(date){
            return date.getHours();
        },
        HH: function(date){
            return u.date.leftZeroFill(date.getHours(),2);
        },
        // minutes
        m: function(date){
            return date.getMinutes();
        },
        mm: function(date){
            return u.date.leftZeroFill(date.getMinutes(), 2);
        },
        //seconds
        s: function(date){
            return date.getSeconds();
        },
        ss: function(date){
            return u.date.leftZeroFill(date.getSeconds(),2);
        }
    },

    /**
     * 日期格式化
     * @param date
     * @param formatString
     */
    format: function(date, formatString, language){
        if (!date) return date;
        var array = formatString.match(u.date._formattingTokens), i, length,output='';
        var _date = u.date.getDateObj(date);
        if (!_date) return date;
        language = language || u.core.getLanguages();
        for (i = 0, length = array.length; i < length; i++) {
            if (u.date._formats[array[i]]) {
                output += u.date._formats[array[i]](_date, language);
            } else {
                output += array[i];
            }
        }
        return output;
    },

    _addOrSubtract: function(date, period, value, isAdding){
        var times = date.getTime(),d = date.getDate(), m = date.getMonth(),_date = u.date.getDateObj(date);
        if (period === 'ms') {
            times = times + value * isAdding;
            _date.setTime(times);
        }
        else if (period == 's') {
            times = times + value*1000 * isAdding;
            _date.setTime(times);
        }
        else if (period == 'm') {
            times = times + value*60000 * isAdding;
            _date.setTime(times);
        }
        else if (period == 'h') {
            times = times + value*3600000 * isAdding;
            _date.setTime(times);
        }
        else if (period == 'd') {
            d = d + value * isAdding;
            _date.setDate(d);
        }
        else if (period == 'w') {
            d = d + value * 7 * isAdding;
            _date.setDate(d);
        }
        else if (period == 'M') {
            m = m + value * isAdding;
            _date.setMonth(d);
        }
        else if (period == 'y'){
            m = m + value * 12 * isAdding;
            _date.setMonth(d);
        }
        return _date;
    },

    add: function(date,period,value){
        return u.date._addOrSubtract(date, period, value, 1);
    },
    sub: function(date,period,value){
        return u.date._addOrSubtract(date, period, value, -1);
    },
    getDateObj: function(value){
        if (!value || typeof value == 'undefined') return value;
        var dateFlag = false;
        var _date = new Date(value);
        if (isNaN(_date)){
            // IE的话对"2016-2-13 12:13:22"进行处理
            var index1,index2,index3,s1,s2,s3;
            index1 = value.indexOf('-');
            index2 = value.indexOf(':');
            index3 = value.indexOf(' ');
            if(index1 > 0 || index2 > 0 || index3 > 0){
                _date = new Date();
                if(index3 > 0){
                    s3 = value.split(' ');
                    s1 = s3[0].split('-');
                    s2 = s3[1].split(':'); 
                }else if(index1 > 0){
                    s1 = value.split('-');
                }else if(index2 > 0){
                    s2 = value.split(':');
                }
                if(s1 && s1.length > 0){
                    _date.setYear(s1[0]);
                    _date.setMonth(parseInt(s1[1] -1));
                    _date.setDate(s1[2]?s1[2]:0);
                    dateFlag = true;
                }
                if(s2 && s2.length > 0){
                    _date.setHours(s2[0]?s2[0]:0);
                    _date.setMinutes(s2[1]?s2[1]:0);
                    _date.setSeconds(s2[2]?s2[2]:0);
                    dateFlag = true;
                }
            }else{
                _date = new Date(parseInt(value))
                if (isNaN(_date)) {
                    throw new TypeError('invalid Date parameter');
                }else{
                    dateFlag = true;
                }
            }
        }else{
            dateFlag = true;
        }

        if(dateFlag)
            return _date;
        else
            return null;
    }
};


/**
 * 数据格式化工具
 */

function NumberFormater(precision) {
    this.precision = precision;
};

NumberFormater.prototype.update = function (precision) {
    this.precision = precision;
}

NumberFormater.prototype.format = function (value) {
    if (!u.isNumber(value)) return "";

    // 以0开头的数字将其前面的0去掉
    while ((value + "").charAt(0) == "0" && value.length > 1 && (value + "").indexOf('0.') != 0) {
        value = value.substring(1);
    }
    var result = value;
    if (u.isNumber(this.precision)) {
        if (window.BigNumber) {
            // 已经引入BigNumber
            result = (new BigNumber(value)).toFixed(this.precision)
        } else {
            var digit = parseFloat(value);
            // 解决toFixed四舍五入问题，如1.345
            result = (Math.round(digit * Math.pow(10, this.precision)) / Math.pow(10, this.precision)).toFixed(this.precision);
        }
        if (result == "NaN")
            return "";
    }


    return result;
};

function DateFormater(pattern) {
    this.pattern = pattern;
};

DateFormater.prototype.update = function (pattern) {
    this.pattern = pattern;
}


DateFormater.prototype.format = function (value) {
    return moment(value).format(this.pattern)
};

u.NumberFormater = NumberFormater;
u.DateFormater = DateFormater;

var _hotkeys = {};
_hotkeys.special_keys = {
    27: 'esc', 9: 'tab', 32: 'space', 13: 'enter', 8: 'backspace', 145: 'scroll', 20: 'capslock',
    144: 'numlock', 19: 'pause', 45: 'insert', 36: 'home', 46: 'del', 35: 'end', 33: 'pageup',
    34: 'pagedown', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 112: 'f1', 113: 'f2', 114: 'f3',
    115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12'
};

_hotkeys.shift_nums = {
    "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
    "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ":", "'": "\"", ",": "<",
    ".": ">", "/": "?", "\\": "|"
};

_hotkeys.add = function (combi, options, callback) {
    if (u.isFunction(options)) {
        callback = options;
        options = {};
    }
    var opt = {},
        defaults = {type: 'keydown', propagate: false, disableInInput: false, target: document.body, checkParent: true},
        that = this;
    opt = u.extend(opt, defaults, options || {});
    combi = combi.toLowerCase();

    // inspect if keystroke matches
    var inspector = function (event) {
        //event = $.event.fix(event); // jQuery event normalization.
        var element = this//event.target;
        // @ TextNode -> nodeType == 3
        element = (element.nodeType == 3) ? element.parentNode : element;

        if (opt['disableInInput']) { // Disable shortcut keys in Input, Textarea fields
            var target = element;//$(element);
            if (target.tagName == "INPUT" || target.tagName == "TEXTAREA") {
                return;
            }
        }
        var code = event.which,
            type = event.type,
            character = String.fromCharCode(code).toLowerCase(),
            special = that.special_keys[code],
            shift = event.shiftKey,
            ctrl = event.ctrlKey,
            alt = event.altKey,
            propagate = true, // default behaivour
            mapPoint = null;

        // in opera + safari, the event.target is unpredictable.
        // for example: 'keydown' might be associated with HtmlBodyElement
        // or the element where you last clicked with your mouse.
        if (opt.checkParent) {
//              while (!that.all[element] && element.parentNode){
            while (!element['u.hotkeys'] && element.parentNode) {
                element = element.parentNode;
            }
        }

//          var cbMap = that.all[element].events[type].callbackMap;
        var cbMap = element['u.hotkeys'].events[type].callbackMap;
        if (!shift && !ctrl && !alt) { // No Modifiers
            mapPoint = cbMap[special] || cbMap[character]
        }
        // deals with combinaitons (alt|ctrl|shift+anything)
        else {
            var modif = '';
            if (alt) modif += 'alt+';
            if (ctrl) modif += 'ctrl+';
            if (shift) modif += 'shift+';
            // modifiers + special keys or modifiers + characters or modifiers + shift characters
            mapPoint = cbMap[modif + special] || cbMap[modif + character] || cbMap[modif + that.shift_nums[character]]
        }
        if (mapPoint) {
            mapPoint.cb(event);
            if (!mapPoint.propagate) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        }
    };
    // first hook for this element
    var data = opt.target['u.hotkeys'];
    if (!data) {
        opt.target['u.hotkeys'] =  data = {events: {}};
    }
//      if (!_hotkeys.all[opt.target]){
//          _hotkeys.all[opt.target] = {events:{}};
//      }
    if (!data.events[opt.type]) {
        data.events[opt.type] = {callbackMap: {}};
        u.on(opt.target, opt.type, inspector);
        //$.event.add(opt.target, opt.type, inspector);
    }
//      if (!_hotkeys.all[opt.target].events[opt.type]){
//          _hotkeys.all[opt.target].events[opt.type] = {callbackMap: {}}
//          $.event.add(opt.target, opt.type, inspector);
//      }
    data.events[opt.type].callbackMap[combi] = {cb: callback, propagate: opt.propagate};
//      _hotkeys.all[opt.target].events[opt.type].callbackMap[combi] =  {cb: callback, propagate:opt.propagate};
    return u.hotkeys;
};
_hotkeys.remove = function (exp, opt) {
    opt = opt || {};
    target = opt.target || document.body;
    type = opt.type || 'keydown';
    exp = exp.toLowerCase();

    delete target['u.hotkeys'].events[type].callbackMap[exp];
};

_hotkeys.scan = function (element, target) {
    element = element || document.body;
    element.querySelectorAll('[u-enter]').forEach(function(el){
        var enterValue = el.getAttribute('u-enter');
        if (!enterValue) return;
        if (enterValue.substring(0, 1) == '#')
            u.hotkeys.add('enter', {target: this}, function () {
                var _el = element.querySelector(enterValue);
                if (_el){
                    _el.focus();
                }
            });
        else {
            target = target || window
            var func = u.getFunction(target, enterValue)
            u.hotkeys.add('enter', {target: this}, function () {
                func.call(this)
            })
        }
    });
    element.querySelectorAll('[u-hotkey]').forEach(function(el){
        var hotkey = el.getAttribute('u-hotkey');
        if (!hotkey) return;
        u.hotkeys.add(hotkey, function () {
            el.click();
        })

    });
}

u.hotkeys = _hotkeys;

/**
 * 抽象格式化类
 */
function AbstractMasker() {};

AbstractMasker.prototype.format = function(obj) {
	if (obj == null)
		return null;

	var fObj = this.formatArgument(obj);
	return this.innerFormat(fObj);
};

/**
 * 统一被格式化对象结构
 *
 * @param obj
 * @return
 */
AbstractMasker.prototype.formatArgument = function(obj) {

};

/**
 * 格式化
 *
 * @param obj
 * @return
 */
AbstractMasker.prototype.innerFormat = function(obj) {

};

/**
 * 拆分算法格式化虚基类
 */
AbstractSplitMasker.prototype = new AbstractMasker;

function AbstractSplitMasker() {};
AbstractSplitMasker.prototype.elements = new Array;
AbstractSplitMasker.prototype.format = function(obj) {
	if (obj == null)
		return null;

	var fObj = this.formatArgument(obj);
	return this.innerFormat(fObj);
};

/**
 * 统一被格式化对象结构
 *
 * @param obj
 * @return
 */
AbstractSplitMasker.prototype.formatArgument = function(obj) {
	return obj;
};

/**
 * 格式化
 *
 * @param obj
 * @return
 */
AbstractSplitMasker.prototype.innerFormat = function(obj) {
	if (obj == null || obj == "")
		return new FormatResult(obj);
	this.doSplit();
	var result = "";
	//dingrf 去掉concat合并数组的方式，换用多维数组来实现 提高效率
	result = this.getElementsValue(this.elements, obj);

	return new FormatResult(result);
};

/**
 * 合并多维数组中的elementValue
 * @param {} element
 * @param {} obj
 * @return {}
 */
AbstractSplitMasker.prototype.getElementsValue = function(element, obj) {
	var result = "";
	if (element instanceof Array) {
		for (var i = 0; i < element.length; i++) {
			result = result + this.getElementsValue(element[i], obj);
		}
	} else {
		if (element.getValue)
			result = element.getValue(obj);
	}
	return result;
};

AbstractSplitMasker.prototype.getExpress = function() {

};

AbstractSplitMasker.prototype.doSplit = function() {
	var express = this.getExpress();
	if (this.elements == null || this.elements.length == 0)
		this.elements = this.doQuotation(express, this.getSeperators(), this.getReplaceds(), 0);
};


/**
 * 处理引号
 *
 * @param express
 * @param seperators
 * @param replaced
 * @param curSeperator
 * @param obj
 * @param result
 */
AbstractSplitMasker.prototype.doQuotation = function(express, seperators, replaced, curSeperator) {
	if (express.length == 0)
		return null;
	var elements = new Array();
	var pattern = new RegExp('".*?"', "g");
	var fromIndex = 0;
	var result;
	do {
		result = pattern.exec(express);
		if (result != null) {
			var i = result.index;
			var j = pattern.lastIndex;
			if (i != j) {
				if (fromIndex < i) {
					var childElements = this.doSeperator(express.substring(fromIndex, i), seperators, replaced, curSeperator);
					if (childElements != null && childElements.length > 0) {
						//						elements = elements.concat(childElements);
						elements.push(childElements);
					}
				}
			}
			elements.push(new StringElement(express.substring(i + 1, j - 1)));
			fromIndex = j;
		}
	}
	while (result != null);

	if (fromIndex < express.length) {
		var childElements = this.doSeperator(express.substring(fromIndex, express.length), seperators, replaced, curSeperator);
		if (childElements != null && childElements.length > 0)
		//			elements = elements.concat(childElements);
			elements.push(childElements);
	}
	return elements;
};

/**
 * 处理其它分隔符
 *
 * @param express
 * @param seperators
 * @param replaced
 * @param curSeperator
 * @param obj
 * @param result
 */
AbstractSplitMasker.prototype.doSeperator = function(express, seperators, replaced, curSeperator) {
	if (curSeperator >= seperators.length) {
		var elements = new Array;
		elements.push(this.getVarElement(express));
		return elements;
	}

	if (express.length == 0)
		return null;
	var fromIndex = 0;
	var elements = new Array();
	var pattern = new RegExp(seperators[curSeperator], "g");
	var result;
	do {
		result = pattern.exec(express);
		if (result != null) {
			var i = result.index;
			var j = pattern.lastIndex;
			if (i != j) {
				if (fromIndex < i) {
					var childElements = this.doSeperator(express.substring(fromIndex, i), seperators, replaced, curSeperator + 1);
					if (childElements != null && childElements.length > 0)
					//						elements = elements.concat(childElements);
						elements.push(childElements);
				}

				if (replaced[curSeperator] != null) {
					elements.push(new StringElement(replaced[curSeperator]));
				} else {
					elements.push(new StringElement(express.substring(i, j)));
				}
				fromIndex = j;
			}
		}
	}
	while (result != null);

	if (fromIndex < express.length) {
		var childElements = this.doSeperator(express.substring(fromIndex, express.length), seperators, replaced, curSeperator + 1);
		if (childElements != null && childElements.length > 0)
		//			elements = elements.concat(childElements);
			elements.push(childElements);
	}
	return elements;
};


/**
 * 地址格式
 */
AddressMasker.prototype = new AbstractSplitMasker;

function AddressMasker(formatMeta) {
	this.update(formatMeta);
};

AddressMasker.prototype.update = function(formatMeta) {
	this.formatMeta = u.extend({}, AddressMasker.DefaultFormatMeta, formatMeta)
}

AddressMasker.prototype.getExpress = function() {
	return this.formatMeta.express;
};

AddressMasker.prototype.getReplaceds = function() {
	return [this.formatMeta.separator];
};

AddressMasker.prototype.getSeperators = function() {
	return ["(\\s)+?"];
};

AddressMasker.prototype.getVarElement = function(express) {
	var ex = {};

	if (express == ("C"))
		ex.getValue = function(obj) {
			return obj.country;
		};


	if (express == ("S"))
		ex.getValue = function(obj) {
			return obj.state;
		};


	if (express == ("T"))
		ex.getValue = function(obj) {
			return obj.city;
		};


	if (express == ("D"))
		ex.getValue = function(obj) {
			return obj.section;
		};


	if (express == ("R"))
		ex.getValue = function(obj) {
			return obj.road;
		};

	if (express == ("P"))
		ex.getValue = function(obj) {
			return obj.postcode;
		};

	if (typeof(ex.getValue) == undefined)
		return new StringElement(express);
	else
		return ex;
};

AddressMasker.prototype.formatArgument = function(obj) {
	return obj;
};

/**
 * <b> 数字格式化  </b>
 *
 * <p> 格式化数字
 *
 * </p>
 *
 * Create at 2009-3-20 上午08:50:32
 *
 * @author bq
 * @since V6.0
 */
NumberMasker.prototype = new AbstractMasker;
NumberMasker.prototype.formatMeta = null;

/**
 *构造方法
 */
function NumberMasker(formatMeta) {
	this.update(formatMeta);
};

NumberMasker.prototype.update = function(formatMeta) {
	this.formatMeta = u.extend({}, NumberMasker.DefaultFormatMeta, formatMeta)
}

/**
 *格式化对象
 */
NumberMasker.prototype.innerFormat = function(obj) {
	var dValue, express, seperatorIndex, strValue;
	dValue = obj.value;
	if (dValue > 0) {
		express = this.formatMeta.positiveFormat;
		strValue = dValue + '';
	} else if (dValue < 0) {
		express = this.formatMeta.negativeFormat;
		strValue = (dValue + '').substr(1, (dValue + '').length - 1);
	} else {
		express = this.formatMeta.positiveFormat;
		strValue = dValue + '';
	}
	seperatorIndex = strValue.indexOf('.');
	strValue = this.setTheSeperator(strValue, seperatorIndex);
	strValue = this.setTheMark(strValue, seperatorIndex);
	var color = null;
	if (dValue < 0 && this.formatMeta.isNegRed) {
		color = "FF0000";
	}
	return new FormatResult(express.replaceAll('n', strValue), color);

};
/**
 *设置标记
 */
NumberMasker.prototype.setTheMark = function(str, seperatorIndex) {
	var endIndex, first, index;
	if (!this.formatMeta.isMarkEnable)
		return str;
	if (seperatorIndex <= 0)
		seperatorIndex = str.length;
	first = str.charCodeAt(0);
	endIndex = 0;
	if (first == 45)
		endIndex = 1;
	index = seperatorIndex - 3;
	while (index > endIndex) {
		str = str.substr(0, index - 0) + this.formatMeta.markSymbol + str.substr(index, str.length - index);
		index = index - 3;
	}
	return str;
};
NumberMasker.prototype.setTheSeperator = function(str, seperatorIndex) {
	var ca;
	if (seperatorIndex > 0) {
		ca = NumberMasker.toCharArray(str);
		//ca[seperatorIndex] = NumberMasker.toCharArray(this.formatMeta.pointSymbol)[0];
		ca[seperatorIndex] = this.formatMeta.pointSymbol;
		str = ca.join('');
	}
	return str;
};
/**
 * 将字符串转换成char数组
 * @param {} str
 * @return {}
 */
NumberMasker.toCharArray = function(str) {
	var str = str.split("");
	var charArray = new Array();
	for (var i = 0; i < str.length; i++) {
		charArray.push(str[i]);
	}
	return charArray;
};


/**
 *默认构造方法
 */
NumberMasker.prototype.formatArgument = function(obj) {
	var numberObj = {};
	numberObj.value = obj;
	return numberObj;
};

/**
 * 货币格式
 */
CurrencyMasker.prototype = new NumberMasker;
CurrencyMasker.prototype.formatMeta = null;

function CurrencyMasker(formatMeta) {
	this.update(formatMeta);
};

CurrencyMasker.prototype.update = function(formatMeta) {
	this.formatMeta = u.extend({}, CurrencyMasker.DefaultFormatMeta, formatMeta)
}

/**
 * 重载格式方法
 * @param {} obj
 * @return {}
 */
CurrencyMasker.prototype.innerFormat = function(obj) {
	if(!obj.value) {
		return {value: ""};
	}
	var fo = (new NumberMasker(this.formatMeta)).innerFormat(obj);
	fo.value = this.formatMeta.curSymbol  +  fo.value; //fo.value.replace("$", this.formatMeta.curSymbol);
	return fo;
};


PercentMasker.prototype = new NumberMasker;

function PercentMasker(formatMeta) {
	this.update(formatMeta)
};

PercentMasker.prototype.update = function(formatMeta) {
	this.formatMeta = u.extend({}, NumberMasker.DefaultFormatMeta, formatMeta)
}


PercentMasker.prototype.formatArgument = function(obj) {
	return obj;
};

PercentMasker.prototype.innerFormat = function(value) {
	var val = "";
	if (value != "") {
		var obj = (new NumberMasker(this.formatMeta)).innerFormat({value:value}).value;
		// 获取obj保留几位小数位,obj小数位-2为显示小数位
		var objStr = String(obj);
		var objPrecision = objStr.length - objStr.indexOf(".") - 1;
		var showPrecision = objPrecision - 2;
		if (showPrecision < 0) {
			showPrecision = 0;
		}
		val = parseFloat(obj) * 100;
		val = (val * Math.pow(10, showPrecision) / Math.pow(10, showPrecision)).toFixed(showPrecision);
		val = val + "%";
	}
	return {
		value: val
	};
};


/**
 * 将结果输出成HTML代码
 * @param {} result
 * @return {String}
 */
function toColorfulString(result) {
	var color;
	if (!result) {
		return '';
	}
	if (result.color == null) {
		return result.value;
	}
	color = result.color;
	return '<font color="' + color + '">' + result.value + '<\/font>';
};

/**
 * 格式解析后形成的单个格式单元
 * 适用于基于拆分算法的AbstractSplitFormat，表示拆分后的变量单元
 */
StringElement.prototype = new Object();

function StringElement(value) {
	this.value = value;
};
StringElement.prototype.value = "";

StringElement.prototype.getValue = function(obj) {
	return this.value;
};
/**
 *格式结果
 */
FormatResult.prototype = new Object;
/**
 *默认构造方法
 */
function FormatResult(value, color) {
	this.value = value;
	this.color = color;
};

NumberMasker.DefaultFormatMeta = {
	isNegRed: true,
	isMarkEnable: true,
	markSymbol: ",",
	pointSymbol: ".",
	positiveFormat: "n",
	negativeFormat: "-n"
}

CurrencyMasker.DefaultFormatMeta = u.extend({}, NumberMasker.DefaultFormatMeta, {
	//curSymbol: "",
	positiveFormat: "n",
	negativeFormat: "-n"
})


AddressMasker.defaultFormatMeta = {
	express: "C S T R P",
	separator: " "
};


u.AddressMasker = AddressMasker;
u.NumberMasker = NumberMasker;
u.CurrencyMasker = CurrencyMasker;
u.PercentMasker = PercentMasker;

var App = function () {
    this.dataTables = {};
}

App.fn = App.prototype;

App.fn.init = function (viewModel, element, doApplyBindings) {
    var self = this;
    element = element || document.body;
    if (!u.isArray(element)) {
        element = [element];
    }
    this.elements = element;
    u.each(this.elements, function (i, element) {
        if (typeof element === 'string'){
            element = document.querySelector(element);
        }
        if(element){
            element.querySelectorAll('[u-meta]').forEach(function (ele) {
                // if (ele['init'] && ele['init'] === true) return;
                //if ($(this).parents('[u-meta]').length > 0) return;
                var options = JSON.parse(ele.getAttribute('u-meta'));
                options['type'] = options['type'] || 'string';
                if (options && options['type']) {
                    if (self.adjustFunc)
                        self.adjustFunc.call(self, options);
                    //var comp = u.compMgr._createComp(ele, options, viewModel, self);
                    var comp = u.compMgr.createDataAdapter({el:ele,options:options,model:viewModel,app:self});
                    ele['u-meta'] = comp;
                    //if (comp)
                    //    $(this).data('u-meta', comp)
                }
            })
        }

        if (u.hotkeys)
            u.hotkeys.scan(element);
        //try {
            if (typeof doApplyBindings == 'undefined' || doApplyBindings == true)
                ko.applyBindings(viewModel, element);
        //} catch (e) {
            //iweb.log.error(e)
        //}
        u.compMgr.updateComp(element);
    });

    _getDataTables(this, viewModel);
//		ko.cleanNode(this.element)
}

App.fn.createComp = function(ele,viewModel){
    var options = JSON.parse(ele.getAttribute('u-meta'));
    if (options && options['type']) {
        var comp = u.compMgr.createDataAdapter({el:ele,options:options,model:viewModel,app:this});
        ele['u-meta'] = comp;
    }
    return comp;
}

App.fn.setAdjustMetaFunc = function (adjustFunc) {
    this.adjustFunc = adjustFunc
}

App.fn.addDataTable = function (dataTable) {
    this.dataTables[dataTable.id] = dataTable
    return this
}
App.fn.getDataTable = function (id) {
    return this.dataTables[id]
}

App.fn.getDataTables = function () {
    return this.dataTables
}

App.fn.getComp = function (compId) {
    var returnComp = null;
    u.each(this.elements, function (i, element) {
        if (typeof element === 'string'){
            element = document.querySelector(element);
        }
        if(element){
            element.querySelectorAll('[u-meta]').forEach(function (ele) {
                if (ele['u-meta']) {
                    var comp = ele['u-meta'];
                    if (comp.id === compId) {
                        returnComp = comp;
                        return false;
                    }
                }
            })
        }

    })
    return returnComp;
}

App.fn.getCompsByDataTable = function (dataTableId, element) {
    var comps = this.getComps(element),
        targetComps = []
    for (var i = 0; i < comps.length; i++) {
        if ((comps[i].dataModel && comps[i].dataModel['id'] == dataTableId) || (comps[i].dataTable && comps[i].dataTable['id'] == dataTableId))
            targetComps.push(comps[i])
    }
    return targetComps
}

/**
 * 获取某区域中的所有控件
 * @param {object} element
 */
App.fn.getComps = function (element) {
    var elements = element ? element : this.elements;
    var returnComps = [];
    if(typeof elements == 'string'){
    	elements = document.querySelectorAll(elements);
    }
    if (!u.isArray(elements) && !(elements instanceof NodeList))
        elements = [elements];
    u.each(elements, function (i, element) {
        if(element){
            element.querySelectorAll('[u-meta]').forEach(function (ele) {
                if (ele['u-meta']) {
                    var comp = ele['u-meta'];
                    if (comp)
                        returnComps.push(comp);
                }
            })
        }

    });
    return returnComps;
}

/**
 * 控件数据校验
 * @param {Object} element
 */
App.fn.compsValidate = function (element, retUnpass) {
    var comps = this.getComps(element),
        passed = true,
        unpassed=[];
    for (var i = 0; i < comps.length; i++) {
        if (comps[i].doValidate){
            var result = comps[i].doValidate({trueValue:true,showMsg:true});
            result = typeof result === 'object' ? result['passed'] : result;
            passed = result && passed;
            if(!result) unpassed.push(comps[i])
        }
    }
    if(retUnpass) return unpassed;
    return passed
}

App.fn.compsValidateMultiParam = function(options){
    var element = options.element,
        comps = this.getComps(element),
        passed = true,
        showMsg = options.showMsg,
        notPassedArr = new Array();
    for(var i = 0; i < comps.length; i++){
        if (comps[i].doValidate){
            result = comps[i].doValidate({trueValue:true, showMsg:showMsg});
            passed = result.passed && passed;
            if(!result.passed){
                notPassedArr.push(result);
            }
        }
    }
    return {passed:passed,
            notPassedArr:notPassedArr}; 
}

/**
 * 将comp显示到顶端（此方法只支持body上存在滚动条的情况）
 * @param {object} comp对象
 */
App.fn.showComp = function(comp){
    var ele = comp.element,off = u.getOffset(ele),scroll = u.getScroll(ele),
        top = off.top - scroll.top,bodyHeight = document.body.clientHeight,
        nowTop = document.body.scrollTop;
    if(top > bodyHeight || top < 0){
        document.body.scrollTop = nowTop + top;
    }
}

/**
 * 根据类型获取控件
 * @param {String} type
 * @param {object} element
 */
App.fn.getCompsByType = function (type, element) {
    var elements = element ? element : this.elements;
    var returnComps = [];
    if (!u.isArray(elements))
        elements = [elements];
    u.each(elements, function (i, element) {
        if(element){
            element.querySelectorAll('[u-meta]').forEach(function (ele) {
                if (ele['u-meta']) {
                    var comp = ele['u-meta'];
                    if (comp && comp.type == type)
                        returnComps.push(comp);
                }
            })
        }

    });
    return returnComps;
}


App.fn.getEnvironment = function () {
    return window.iweb.Core.collectEnvironment()
}

App.fn.setClientAttribute = function (k, v) {
    window.iweb.Core.setClientAttribute(k, v)
}

App.fn.getClientAttribute = function (k) {
    return window.iweb.Core.getClientAttributes()[k]
}

App.fn.serverEvent = function () {
    return new ServerEvent(this)
}

App.fn.ajax = function (params) {
    params = this._wrapAjax(params)
    u.ajax(params)
}

App.fn._wrapAjax = function (params) {
    var self = this
    this.serverEventObj = this.serverEvent();
    var orignSuccess = params.success
    var orignError = params.error
    var deferred = params.deferred;
    if (!deferred || !deferred.resolve) {
        deferred = {
            resolve: function () {
            }, reject: function () {
            }
        }
    }
    params.success = function (data, state, xhr) {
        if (typeof data === 'string')
            data = JSON.parse(data)
        if (self.serverEventObj.processXHRError(self, data, state, xhr)) {
            orignSuccess.call(null, data)
            self._successFunc(data, deferred)
        } else {
            deferred.reject();
        }
    }
    params.error = function (data, state, xhr) {
        if (typeof data === 'string')
            data = JSON.parse(data)
        if (self.serverEventObj.processXHRError(self, data, state, xhr)) {
            orignError.call(null, data)
            self._successFunc(data, deferred)
        } else {
            deferred.reject();
        }
    }
    if (params.data)
        params.data.environment = ko.utils.stringifyJson(window.iweb.Core.collectEnvironment());
    else
        params.data = {environment: ko.utils.stringifyJson(window.iweb.Core.collectEnvironment())}
    return params
}

App.fn._successFunc = function (data, deferred) {
    deferred.resolve();
}

window.processXHRError = function (rsl, state, xhr) {
    if (typeof rsl === 'string')
        rsl = JSON.parse(rsl)
    if (xhr.getResponseHeader && xhr.getResponseHeader("X-Error")) {
        u.showMessageDialog({type: "info", title: "提示", msg: rsl["message"], backdrop: true});
        if (rsl["operate"]) {
            eval(rsl["operate"]);
        }
        return false;
    }
    return true;
};

App.fn.setUserCache = function (key, value) {
    var userCode = this.getEnvironment().usercode;
    if (!userCode)return;
    localStorage.setItem(userCode + key, value);
}

App.fn.getUserCache = function (key) {
    var userCode = this.getEnvironment().usercode;
    if (!userCode)return;
    return localStorage.getItem(userCode + key);
}

App.fn.removeUserCache = function (key) {
    var userCode = this.getEnvironment().usercode;
    if (!userCode)return;
    localStorage.removeItem(userCode + key);
}

App.fn.setCache = function (key, value) {
    localStorage.setItem(key, value);
}

App.fn.getCache = function (key) {
    return localStorage.getItem(key);
}

App.fn.removeCache = function (key) {
    localStorage.removeItem(key)
}

App.fn.setSessionCache = function (key, value) {
    sessionStorage.setItem(key, value)
}

App.fn.getSessionCache = function (key) {
    return sessionStorage.getItem(key)
}

App.fn.removeSessionCache = function (key) {
    sessionStorage.removeItem(key)
}

App.fn.setEnable = function (enable) {
    u.each(this.elements, function (i, element) {
        if(element){
            element.querySelectorAll('[u-meta]').each(function () {
                if (this['u-meta']) {
                    var comp = this['u-meta'];
                    if (comp.setEnable)
                        comp.setEnable(enable)
                }
            })
        }

    })
}

var ServerEvent = function (app) {
    this.app = app
    this.datas = {}
    this.params = {}
    this.event = null
    this.ent = window.iweb.Core.collectEnvironment()
    if (!iweb.debugMode) {
        this.compression = true
    }
}

ServerEvent.DEFAULT = {
    async: true,
    singleton: true,
    url: (window.$ctx || '/iwebap') + '/evt/dispatch'
}

ServerEvent.fn = ServerEvent.prototype

ServerEvent.fn.addDataTable = function (dataTableId, rule) {
    var dataTable = this.app.getDataTable(dataTableId)
    this.datas[dataTableId] = dataTable.getDataByRule(rule)
    return this
}

ServerEvent.fn.setCompression = function (compression) {
    if (!iweb.browser.isIE8 && !window.pako && compression == true)
        iweb.log.error("can't compression, please include  pako!")
    else
        this.compression = compression
}

/**
 *
 * @param {Object} dataTabels
 * 格式1: ['dt1',{'dt2':'all'}]，格式2：['dt1', 'dt2']，格式3: ['dt1', 'dt2'], 'all'
 */
ServerEvent.fn.addDataTables = function (dataTables) {
    if (arguments.length == 2) {
        for (var i = 0; i < dataTables.length; i++) {
            var rule;
            if (typeof arguments[1] == 'string') {
                rule = arguments[1]
            } else if (u.isArray(arguments[1])) {
                rule = arguments[1][i]
            }
            this.addDataTable(dataTables[i], rule)
        }
    } else {
        for (var i = 0; i < dataTables.length; i++) {
            var dt = dataTables[i]
            if (typeof dt == 'string')
                this.addDataTable(dt)
            else {
                for (key in dt)
                    this.addDataTable(key, dt[key])
            }
        }
    }

    return this
}

ServerEvent.fn.addAllDataTables = function (rule) {
    var dts = this.app.dataTables
    for (var i = 0; i < dts.length; i++) {
        this.addDataTable(dts[i].id, rule)
    }
}


ServerEvent.fn.addParameter = function (key, value) {
    this.params[key] = value
    return this
}

ServerEvent.fn.setEvent = function (event) {
    //无用逻辑
    //if (true)
    //	this.event = event
    //else
    this.event = _formatEvent(event)
    return this
}

var _formatEvent = function (event) {
    return event
}


//	app.serverEvent().fire({
//		ctrl:'CurrtypeController',
//		event:'event1',
//		success:
//		params:
//	})
ServerEvent.fn.fire = function (p) {
    var self = this
//		params = $.extend(ServerEvent.DEFAULT, params);
    var data = this.getData();
    data.parameters = ko.utils.stringifyJson(this.params)
    var params = {
        type: p.type || "POST",
        data: p.params || {},
        url: p.url || ServerEvent.DEFAULT.url,
        async: typeof p.async == 'undefined' ? ServerEvent.DEFAULT.async : p.async,
        singleton: p.singleton || ServerEvent.DEFAULT.singleton,
        success: p.success,
        error: p.error,
        dataType: 'json'
    }
    params.data.ctrl = p.ctrl
    params.data.method = p.method
    if (this.event)
        params.data.event = ko.utils.stringifyJson(this.event)
    var preSuccess = p.preSuccess || function () {
        }
    var orignSuccess = p.success || function () {
        }
    var orignError = params.error //|| function(){}
    this.orignError = orignError
    var deferred = params.deferred;
    if (!deferred || !deferred.resolve) {
        deferred = {
            resolve: function () {
            }, reject: function () {
            }
        }
    }
    params.success = function (data, state, xhr) {
        if (typeof data === 'string')
            data = JSON.parse(data)
        if (self.processXHRError(self, data, state, xhr)) {
            preSuccess.call(null, data)
            self._successFunc(data, deferred)
            orignSuccess.call(null, data.custom)
            deferred.resolve();
        } else {
            deferred.reject();
        }
    }
    params.error = function (data, state, xhr) {
        if (typeof data === 'string')
            data = JSON.parse(data)
        if (self.processXHRError(self, data, state, xhr)) {
            if (orignError)
                orignError.call(null, data.custom)
//				self._successFunc(data, deferred)
        } else {
            deferred.reject();
        }
    }
    params.data = u.extend(params.data, data);
    u.ajax(params)

}

ServerEvent.fn.getData = function () {
    var envJson = ko.utils.stringifyJson(this.app.getEnvironment()),
        datasJson = ko.utils.stringifyJson(this.datas, function replacer(key, value) {
          if (typeof value === "undefined" || value == null) {
            return '';
          }
          return value;
        }),
        compressType = '',
        compression = false
    if (window.trimServerEventData) {
        datasJson = window.trimServerEventData(datasJson);
    }
    if (this.compression) {
        if (!iweb.browser.isIE8 && window.pako) {
            envJson = encodeBase64(window.pako.gzip(envJson));
            datasJson = encodeBase64(window.pako.gzip(datasJson));
            compression = true
            compressType = 'gzip'
        }
    }
    return {
        environment: envJson,
        dataTables: datasJson,
        compression: compression,
        compressType: compressType
    }
}

ServerEvent.fn._successFunc = function (data, deferred) {
    if (typeof data === 'string')
        data = JSON.parse(data)
    var dataTables = data.dataTables
    var dom = data.dom
    if (dom)
        this.updateDom(JSON.parse(dom))
    if (dataTables)
        this.updateDataTables(dataTables, deferred)
}

ServerEvent.fn.updateDataTables = function (dataTables, deferred) {
    for (var key in dataTables) {
        var dt = this.app.getDataTable(key)
        if (dt) {
            dt.setData(dataTables[key])
            dt.updateMeta(dataTables[key].meta)
        }
    }
}

ServerEvent.fn.setSuccessFunc = function (func) {
    this._successFunc = func
}

ServerEvent.fn.updateDom = function () {
    u.each(dom, function (i, n) {
        var vo = n.two
        var key = n.one;
        _updateDom(key, vo)
    });
}

//TODO 去除jQuery后有问题待修改
function _updateDom(key, vos) {
    for (var i in vos) {
        var vo = vos[i]
        for (var key in vo) {
            var props = vo[key]
            if (key == 'trigger') {
                u.trigger(key,props[0]);
            }
            else {
                if (u.isArray(props)) {
                    u.each(props, function (i, n) {
                        key[i](n)
                    });
                }
                else
                    try {
                        key[i](vo)
                    } catch (error) {
                        key[i](vo[i])
                    }
            }
        }
    }
}

ServerEvent.fn.processXHRError = function (self, rsl, state, xhr) {
    if (typeof rsl === 'string')
        rsl = JSON.parse(rsl)
    if (xhr.getResponseHeader && xhr.getResponseHeader("X-Error")) {
        if (self.orignError)
            self.orignError.call(self, rsl, state, xhr)
        else {
            if (u.showMessageDialog)
                u.showMessageDialog({type: "info", title: "提示", msg: rsl["message"], backdrop: true});
            else
                alert(rsl["message"])
            if (rsl["operate"]) {
                eval(rsl["operate"]);
            }
        }
        return false;
    }
    return true;
};

u.createApp = function () {
    var app = new App();
    if (arguments.length > 0){
        var arg = arguments[0];
        app.init(arg.model, arg.el);
    }
    return app;
}

var _getDataTables = function (app, viewModel) {
    for (var key in viewModel) {
        if (viewModel[key] instanceof u.DataTable) {
            viewModel[key].id = key
            viewModel[key].parent = viewModel
            app.addDataTable(viewModel[key])
        }
    }
}

/* ========================================================================
 * UUI: dataTable.js
 *
 * ========================================================================
 * Copyright 2016 yonyou, Inc.
 * ======================================================================== */

var Events = function () {
};

Events.fn = Events.prototype;
/**
 * 绑定事件
 * 支持的格式： 1. on(u.DataTable.ON_ROW_FOCUS, function() {}) // 普通
 * 2. on([u.DataTable.ON_INSERT, u.DataTable.ON_DELETE], function() {}) // 数组
 * 3. on({u.DataTable.ON_INSERT: function() {}, u.DataTable.ON_DELETE: function() {}}) // map
 */
Events.fn.on = function (name, callback, one) {
    var self = this, origCb = callback;
    if(Object.prototype.toString.call(name) == '[object Array]') {
        // 数组
        for(var i in name) {
            this.on(name[i], callback);
        }
        return this;
    } else if(typeof name == 'object'){
        // map
        for(var key in name) {
            this.on(key, name[key]);
        }
        return this;
    }
    if(one) {
        callback = function() {
            self.off(name, callback);
            origCb.apply(this, arguments);
        }
    }
    name = name.toLowerCase();
    this._events || (this._events = {});
    var events = this._events[name] || (this._events[name] = []);
    events.push({
        callback: callback
    })
    return this;
}

/**
 * 解绑事件
 * 
**/
Events.fn.off = function (name, callback) {
    if(Object.prototype.toString.call(name) == '[object Array]') {
        // 数组
        for(var i in name) {
            this.off(name[i], callback);
        }
        return this;
    } else if(typeof name == 'object'){
        // map
        for(var key in name) {
            this.off(key, name[key]);
        }
        return this;
    }
    var cbs = this._events[name];
    if(!cbs) return this;
    if(!callback) {
        // 解绑所有事件
        cbs = null;
    } else {
        for(var i = cbs.length - 1;i >= 0; i--) {
            if(cbs[i] == callback) {
                cbs.splice(i, 1);
            }
        }
    }
    return this;
}

/**
 * 
**/
Events.fn.one = function (name, callback) {
    this.on(name, callback, 1);
}

/**
 * 触发事件
 */
Events.fn.trigger = function (name) {
    name = name.toLowerCase()
    if (!this._events || !this._events[name]) return this;
    var args = Array.prototype.slice.call(arguments, 1);
    var events = this._events[name];
    for (var i = 0, count = events.length; i < count; i++) {
        events[i].callback.apply(this, args);
    }
    return this;
}


Events.fn.getEvent = function (name) {
    name = name.toLowerCase()
    this._events || (this._events = {})
    return this._events[name]
}

/**===========================================================================================================
 *
 * 数据模型
 *
 * ===========================================================================================================
 */

var DataTable = function (options) {
    options = options || {};
    this.id = options['id'];
    this.meta = DataTable.createMetaItems(options['meta']);
    this.enable = options['enable'] || DataTable.DEFAULTS.enable;
    this.pageSize = ko.observable(options['pageSize'] || DataTable.DEFAULTS.pageSize)
    this.pageIndex = ko.observable(options['pageIndex'] || DataTable.DEFAULTS.pageIndex)
    this.totalPages = ko.observable(options['totalPages'] || DataTable.DEFAULTS.totalPages)
    this.totalRow = ko.observable()
    this.pageCache = options['pageCache'] === undefined ? DataTable.DEFAULTS.pageCache : options['pageCache']
    this.rows = ko.observableArray([])
    this.selectedIndices = ko.observableArray([])
    this._oldCurrentIndex = -1;
    this.focusIndex = ko.observable(-1)
    this.cachedPages = []
    this.metaChange = {};
    this.valueChange = {};//ko.observable(1);
    this.currentRowChange = ko.observable(1);
    this.enableChange = ko.observable(1);
    this.params = options['params'] || {};
    this.master = options['master'] || '';
    this.allSelected = ko.observable(false);
    if (options['root']){
        this.root = options['root']
    }else{
        this.root = this;
    }
    if (options['ns']){
        this.ns = options['ns'];
    }else{
        this.ns = '';
    }
}

DataTable.fn = DataTable.prototype = new Events()

DataTable.DEFAULTS = {
    pageSize: 20,
    pageIndex: 0,
    totalPages: 20,
    pageCache: false,
    enable: true
}

DataTable.META_DEFAULTS = {
    enable: true,
    required: false,
    descs: {}
}
DataTable.createMetaItems = function (metas) {
    var newMetas = {};
    for (var key in metas) {
        var meta = metas[key]
        if (typeof meta == 'string')
            meta = {}
        //if (meta['type'] && meta['type'] === 'child'){
        //
        //}
        newMetas[key] = u.extend({}, DataTable.META_DEFAULTS, meta)
    }
    //默认创建一个$data字段
    // if (u.isEmptyObject(newMetas)){
    //     newMetas['$data'] = {};
    // }
    return newMetas
}

/**
 * 字段不存在时，创建字段
 * @param fieldName
 * @param options
 */
DataTable.fn.createField = function(fieldName, options){
    //字段不主动定义，则不创建
    //return;
    //有子表的情况不创建字段
    if (fieldName.indexOf('.') != -1){
        var fNames = fieldName.split('.');
        var _name = fNames[0];
        for(var i= 0, count = fNames.length; i< count; i++){
            if (this.meta[_name] && this.meta[_name]['type'] === 'child')
                return;
            if ((i+1) < count)
                _name = _name + '.' + fNames[i+1]
        }
    }
    if (!this.meta[fieldName]){
        this.meta[fieldName] = {}
    }
    if (typeof options === 'object'){
        for(var key in options){
            if (!this.meta[fieldName][key]){
                this.meta[fieldName][key] = options[key];
            }
        }
    }
    // 在顶层dataTable上定义field信息
    if (this.root !== this){
        var nsArr = this.ns.split('.')
        var _fieldMeta = this.root.meta
        for (var i = 0; i< nsArr.length; i++){
            _fieldMeta[nsArr[i]] = _fieldMeta[nsArr[i]] || {}
            _fieldMeta[nsArr[i]]['type'] = _fieldMeta[nsArr[i]]['type'] || 'child';
            _fieldMeta[nsArr[i]]['meta'] = _fieldMeta[nsArr[i]]['meta'] || {};
            _fieldMeta =  _fieldMeta[nsArr[i]]['meta'];
        }
        if (!_fieldMeta[fieldName]){
            _fieldMeta[fieldName] = {}
        }
        if (typeof options === 'object'){
            for(var key in options){
                if (!_fieldMeta[fieldName][key]){
                    _fieldMeta[fieldName][key] = options[key];
                }
            }
        }
    }

}


//事件类型
DataTable.ON_ROW_SELECT = 'select'
DataTable.ON_ROW_UNSELECT = 'unSelect'
DataTable.ON_ROW_ALLSELECT = 'allSelect'
DataTable.ON_ROW_ALLUNSELECT = 'allUnselect'
DataTable.ON_VALUE_CHANGE = 'valueChange'
DataTable.ON_CURRENT_VALUE_CHANGE = 'currentValueChange'  //当前行变化
//	DataTable.ON_AFTER_VALUE_CHANGE = 'afterValueChange'
//	DataTable.ON_ADD_ROW = 'addRow'
DataTable.ON_INSERT = 'insert'
DataTable.ON_UPDATE = 'update'
DataTable.ON_CURRENT_UPDATE = 'currentUpdate'
DataTable.ON_DELETE = 'delete'
DataTable.ON_DELETE_ALL = 'deleteAll'
DataTable.ON_ROW_FOCUS = 'focus'
DataTable.ON_ROW_UNFOCUS = 'unFocus'
DataTable.ON_LOAD = 'load'
DataTable.ON_ENABLE_CHANGE = 'enableChange'
DataTable.ON_META_CHANGE = 'metaChange'
DataTable.ON_ROW_META_CHANGE = 'rowMetaChange'
DataTable.ON_CURRENT_META_CHANGE = 'currentMetaChange'
DataTable.ON_CURRENT_ROW_CHANGE = 'currentRowChange'

DataTable.SUBMIT = {
    current: 'current',
    focus: 'focus',
    all: 'all',
    select: 'select',
    change: 'change',
    empty: 'empty',
    allSelect: 'allSelect',
    allPages: 'allPages'
}


DataTable.fn.addParam = function (key, value) {
    this.params[key] = value
}

DataTable.fn.addParams = function (params) {
    for (var key in params) {
        this.params[key] = params[key]
    }
}

DataTable.fn.getParam = function (key) {
    return this.params[key]
}

/**
 * 获取meta信息，先取row上的信息，没有时，取dataTable上的信息
 * @param {Object} fieldName
 * @param {Object} key
 * @param {Object} row
 */
DataTable.fn.getMeta = function (fieldName, key) {
    if (arguments.length === 0)
        return this.meta;
    else if (arguments.length === 1)
        return this.meta[fieldName];

    if(this.meta[fieldName] && typeof this.meta[fieldName][key] !== 'undefined'){
        return this.meta[fieldName][key];
    }else{
        return null;
    }
    
}

DataTable.fn.setMeta = function (fieldName, key, value) {
    if(!this.meta[fieldName])
        return;
    var oldValue = this.meta[fieldName][key]
    var currRow = this.getCurrentRow();
    this.meta[fieldName][key] = value
    if (this.metaChange[fieldName + '.' + key])
        this.metaChange[fieldName + '.' + key](-this.metaChange[fieldName + '.' + key]());
    //this.metaChange(- this.metaChange())
    if (key == 'enable')
        this.enableChange(-this.enableChange())
    this.trigger(DataTable.ON_META_CHANGE, {
        eventType: 'dataTableEvent',
        dataTable: this.id,
        field: fieldName,
        meta: key,
        oldValue: oldValue,
        newValue: value
    });
    if (currRow && !currRow.getMeta(fieldName, key, false)) {
        this.trigger(fieldName + '.' + key + '.' + DataTable.ON_CURRENT_META_CHANGE, {
            eventType: 'dataTableEvent',
            dataTable: this.id,
            oldValue: oldValue,
            newValue: value
        });
    }
}

DataTable.fn.setCurrentPage = function (pageIndex, notCacheCurrentPage) {
    if (pageIndex != this.pageIndex() && notCacheCurrentPage != true)
        this.cacheCurrentPage();
    this.pageIndex(pageIndex)
    var cachedPage = this.cachedPages[this.pageIndex()]
    if (cachedPage) {
        this.removeAllRows()
        this.setRows(cachedPage.rows)
        this.setRowsSelect(cachedPage.selectedIndcies)
    }
}

DataTable.fn.isChanged = function () {
    var rows = this.getAllRows()
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].status != Row.STATUS.NORMAL)
            return true
    }
    return false
}


/**
 * example: meta: {supplier: {meta: {precision:'3', default: '0239900x', display:'显示名称'}}}
 */
DataTable.fn.updateMeta = function (meta) {
    if (!meta) {
        return;
    }
    for (var fieldKey in meta) {
        for (var propKey in meta[fieldKey]) {
            var oldValue = this.meta[fieldKey][propKey]
            var newValue = meta[fieldKey][propKey]
            if (propKey === 'default') {
                if (!this.meta[fieldKey]['default']) {
                    this.meta[fieldKey]['default'] = {}
                }
                this.meta[fieldKey]['default'].value = meta[fieldKey][propKey]
            } else if (propKey === 'display') {
                if (!this.meta[fieldKey]['default']) {
                    this.meta[fieldKey]['default'] = {}
                }
                this.meta[fieldKey]['default'].display = meta[fieldKey][propKey]
            } else {
                this.meta[fieldKey][propKey] = meta[fieldKey][propKey]
            }
            if (this.metaChange[fieldKey + '.' + propKey])
                this.metaChange[fieldKey + '.' + propKey](-this.metaChange[fieldKey + '.' + propKey]());

            this.trigger(DataTable.ON_META_CHANGE, {
                eventType: 'dataTableEvent',
                dataTable: this.id,
                field: fieldKey,
                meta: propKey,
                oldValue: oldValue,
                newValue: newValue
            });
        }

    }
    //this.metaChange(- this.metaChange())
}


/**
 *设置数据
 *
 */
DataTable.fn.setData = function (data,options) {
    var newIndex = data.pageIndex || 0,
        newSize = data.pageSize || this.pageSize(),
        newTotalPages = data.totalPages || this.totalPages(),
        newTotalRow = data.totalRow || data.rows.length,
        select, focus,unSelect=options?options.unSelect:false; 
        //currPage,
        //type = data.type;

    this.pageCache = data.pageCache || this.pageCache
    if (this.pageCache === true) {
        this.updatePages(data.pages)
        if (newIndex != this.pageIndex()) {
            this.setCurrentPage(newIndex, true);
            this.totalPages(newTotalPages)
            this.totalRow(newTotalRow)
            return;
        }
        else {
            select = this.getPage(newIndex).selectedIndices
            focus = this.getPage(newIndex).focus
            this.setRows(this.getPage(newIndex).rows)
        }
    } else {
        select = data.select||(!unSelect?[0]:[]);
        focus = data.focus;
        this.setRows(data.rows)
    }
    this.pageIndex(newIndex)
    this.pageSize(newSize)
    this.totalPages(newTotalPages)
    this.totalRow(newTotalRow)

    this.updateSelectedIndices()

    if (select && select.length > 0 && this.rows().length > 0)
        this.setRowsSelect(select)
    if (focus)
        this.setRowFocus(focus)
};

/**
 * 获取数据,只取字段名与字段值
 */
DataTable.fn.getSimpleData = function(options){
    options = options || {}
    var rows,_rowData = [], type = options['type'] || 'all', fields = options['fields'] || null;

    if (type === 'all') {
        rows = this.rows.peek();
    }else if (type === 'current'){
        var currRow = this.getCurrentRow();
        rows = currRow == null ? [] :  [currRow];
    }else if (type === 'focus'){
        var focusRow = this.getFocusRow();
        rows = focusRow == null ? [] :  [focusRow];
    }else if (type === 'select'){
        rows = this.getSelectedRows();
    }else if (type === 'change'){
        rows = this.getChangedRows();
    }

    for(var i = 0; i< rows.length; i++){
        _rowData.push(rows[i].getSimpleData({fields:fields}));
    }
    return _rowData;
};

/**
 * 设置数据, 只设置字段值
 * @param {array} data
 *options{} unSelect为true：不选中，为false则选中，默认选中0行
 */
DataTable.fn.setSimpleData = function(data,options){
    this.clear();
    if (!data){
        // throw new Error("dataTable.setSimpleData param can't be null!");
        return;
    }
    
    var rows = [];
    if (!u.isArray(data))
        data = [data];
    for (var i =0; i< data.length; i++){
        var _data = data[i];
        /* 判断data中的字段在datatable中是否存在，如果不存在则创建 */
        // for(var f in _data){
        //     this.createField(f)
        // }
        if (typeof data[i] !== 'object')
            _data = {$data:data[i]}
        rows.push({
            status: Row.STATUS.NORMAL,
            data: _data
        })
    }
    var _data = {
        rows: rows
    }
    this.setData(_data,options);
};


/**
 * 追加数据
 * @param data
 */
DataTable.fn.addSimpleData = function(data){
    if (!data){
        throw new Error("dataTable.addSimpleData param can't be null!");
    }
    if (!u.isArray(data))
        data = [data];
    for (var i =0; i< data.length; i++){
        var r = this.createEmptyRow();
        r.setSimpleData(data[i]);
    }

}


/**
 * 清空datatable的所有数据以及分页数据以及index
 */
DataTable.fn.clear = function () {
    this.removeAllRows();
    this.cachedPages = [];
    this.totalPages(1);
    this.pageIndex(0);
    this.focusIndex(-1);
    this.selectedIndices([]);
}

/**
 * 更新分页数据
 */
DataTable.fn.updatePages = function (pages) {
    var pageSize = this.pageSize(), pageIndex = 0, page, r, row;
    var page, index, i, rows, focus, selectIndices, status, j, row, originRow;
    for (i = 0; i < pages.length; i++) {
        index = pages[i].index
        rows = pages[i].rows
        focus = pages[i].current
        selectIndices = pages[i].select
        status = pages[i].status
        if (status === 'del') {
            this.cachedPages[index] = null;
            continue;
        }
        if (!this.cachedPages[index]) {
            page = new Page({parent: this})
            page.rows = rows;
            for (var j = 0; j < page.rows.length; j++) {
                page.rows[j].rowId = page.rows[j].id
                delete page.rows[j].id
            }
            this.cachedPages[index] = page
        } else {
            //如果是当前页，先把this.rows数据更新到page中
            if (index == this.pageIndex()) {
                this.cacheCurrentPage();
            }
            page = this.cachedPages[index]
            for (var j = 0; j < rows.length; j++) {
                r = rows[j];
                if (!r.id)
                    r.id = Row.getRandomRowId()
                if (r.status == Row.STATUS.DELETE) {
                    this.removeRowByRowId(r.id)
                } else {
                    row = page.getRowByRowId(r.id)
                    if (row) {
                        page.updateRow(row, r);
                    } else {
                        r.rowId = r.id
                        delete r.id
                        page.rows.push(r);
                    }
                }
            }
        }
        page.selectedIndices = selectIndices;
        page.focus = focus;
    }
}

/**
 * 设置行数据
 * @param {Object} rows
 */
DataTable.fn.setRows = function (rows) {
    var insertRows = [], _id;
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i]
        _id = r.rowId || r.id;
        if (!_id)
            _id = Row.getRandomRowId()
        if (r.status == Row.STATUS.DELETE) {
            this.removeRowByRowId(_id)
        }
        else {
            var row = this.getRowByRowId(_id)
            if (row) {
                row.updateRow(r);
                if (!u.isEmptyObject(r.data)) {
                    this.trigger(DataTable.ON_UPDATE, {
                        index: i,
                        rows: [row]
                    })
                    if (row == this.getCurrentRow()) {
                        this.currentRowChange(-this.currentRowChange())
                        row.currentRowChange(-row.currentRowChange())
                        this.trigger(DataTable.ON_CURRENT_UPDATE, {
                            index: i,
                            rows: [row]
                        })
                    } else {
                        row.currentRowChange(-row.currentRowChange())
                    }
                }

            }
            else {
                row = new Row({parent: this, id: _id})
                row.setData(rows[i])
                insertRows.push(row)
//					this.addRow(row)
            }
        }
    }
    if (insertRows.length > 0)
        this.addRows(insertRows)
}

DataTable.fn.clearCache = function () {
    this.cachedPages = []
}

DataTable.fn.cacheCurrentPage = function () {
    if (this.pageCache && this.pageIndex() > -1) {
        var page = new Page({parent: this});
        page.focus = this.getFocusIndex();
        page.selectedIndices = this.selectedIndices().slice();
        var rows = this.rows.peek() //.slice();
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i].getData();
            r.rowId = r.id;
            delete r.id;
            page.rows.push(r)
        }
        //page.rows = this.rows().slice();
        this.cachedPages[this.pageIndex()] = page
    }
}

/**
 * 前端分页方法，不建议使用，建议在后端进行分页
 * @param allRows
 */
DataTable.fn.setPages = function (allRows) {
    var pageSize = this.pageSize(), pageIndex = 0, page;
    this.cachedPages = [];
    for (var i = 0; i < allRows.length; i++) {
        pageIndex = Math.floor(i / pageSize);
        if (!this.cachedPages[pageIndex]) {
            page = new Page({parent: this})
            this.cachedPages[pageIndex] = page
        }
        page.rows.push(allRows[i])
    }
    if (this.pageIndex() > -1)
        this.setCurrentPage(this.pageIndex());
    this.totalRow(allRows.length);
    this.totalPages(pageIndex + 1);
}

DataTable.fn.hasPage = function (pageIndex) {
    //return (this.pageCache && this.cachedPages[pageIndex]  && this.cachedPages[pageIndex].pageSize == this.pageSize()) ? true : false
    return (this.pageCache && this.cachedPages[pageIndex]) ? true : false
}

DataTable.fn.getPage = function (pageIndex) {
    if (this.pageCache) {
        return this.cachedPages[pageIndex]
    }
    return -1;
}

DataTable.fn.getPages = function () {
    if (this.pageCache) {
        return this.cachedPages
    }
    return [];
}

DataTable.fn.copyRow = function (index, row) {
    this.copyRows(index, [row])
}

DataTable.fn.copyRows = function (index, rows) {
    for(var i=0;i < rows.length;i++) {
        var newRow = new Row({parent: this})
        if (rows[i]) {
            newRow.setData(rows[i].getData())
        }
        this.insertRows(index === undefined ? this.rows().length : index, [newRow])
    }
}

/**
 *追加行
 */
DataTable.fn.addRow = function (row) {
    this.insertRow(this.rows().length, row)
}

/**
 *追加多行
 */
DataTable.fn.addRows = function (rows) {
    this.insertRows(this.rows().length, rows)
}

DataTable.fn.insertRow = function (index, row) {
    if (!row) {
        row = new Row({parent: this})
    }
    this.insertRows(index, [row])
}

DataTable.fn.insertRows = function (index, rows) {
//		if (this.onBeforeRowInsert(index,rows) == false)
//			return
    var args = [index, 0]
    for (var i = 0; i < rows.length; i++) {
        args.push(rows[i]);
    }
    this.rows.splice.apply(this.rows, args);

    this.updateSelectedIndices(index, '+', rows.length)
    this.updateFocusIndex(index, '+', rows.length)

    this.trigger(DataTable.ON_INSERT, {
        index: index,
        rows: rows
    })
    if (this.ns){
        //var fName = this.parent.ns + '.' + fieldName;
        if (this.root.valueChange[this.ns])
            this.root.valueChange[this.ns](-this.root.valueChange[this.ns]());
    }
}

/**
 * 创建空行
 */
DataTable.fn.createEmptyRow = function () {
    var r = new Row({parent: this})
    this.addRow(r)
    if (!this.getCurrentRow())
        this.setRowSelect(r);
    return r
}

DataTable.fn.removeRowByRowId = function (rowId) {
    var index = this.getIndexByRowId(rowId)
    if (index != -1)
        this.removeRow(index)
}

DataTable.fn.removeRow = function (index) {
    if (index instanceof Row) {
        index = this.getIndexByRowId(index.rowId)
    }
    this.removeRows([index]);
}

DataTable.fn.removeAllRows = function () {
    this.rows([])
    this.selectedIndices([])
    this.focusIndex(-1)
    this.trigger(DataTable.ON_DELETE_ALL)
    this.updateCurrIndex();
}

DataTable.fn.removeRows = function (indices) {
    indices = this._formatToIndicesArray(indices)
    indices = indices.sort()
    var rowIds = [], rows = this.rows(), deleteRows = [];
    for (var i = indices.length - 1; i >= 0; i--) {
        var index = indices[i]
        var delRow = rows[index];
        if (delRow == null) {
            continue;
        }
        rowIds.push(delRow.rowId)
        var deleteRow = rows.splice(index, 1);
        deleteRows.push(deleteRow[0]);
        this.updateSelectedIndices(index, '-')
        this.updateFocusIndex(index, '-')
    }
    this.rows(rows)
    this.deleteRows = deleteRows;
    this.trigger(DataTable.ON_DELETE, {
        indices: indices,
        rowIds: rowIds,
        deleteRows: deleteRows
    })
    this.updateCurrIndex();
}

/**
 * 设置行删除
 * @param {Object} index
 */
DataTable.fn.setRowDelete = function (index) {
    if (index instanceof Row) {
        index = this.getIndexByRowId(index.rowId)
    }
    this.setRowDelete([index])
}

/**
 * 设置所有行删除
 */
DataTable.fn.setAllRowsDelete = function () {
    var indices = new Array(this.rows().length)
    for (var i = 0; i < indices.length; i++) {
        indices[i] = i
    }
    this.setRowsDelete(indices)
}

/**
 * 设置行删除
 * @param {Array} indices
 */
DataTable.fn.setRowsDelete = function (indices) {
    indices = this._formatToIndicesArray(indices)
    for (var i = 0; i < indices.length; i++) {
        var row = this.getRow(indices[i])
        if (row.status == Row.STATUS.NEW) {
            this.rows(this.rows().splice(indices[i], 1));
            this.updateSelectedIndices(indices[i], '-')
            this.updateFocusIndex(index, '-')
        }
        else {
            row.status = Row.STATUS.FALSE_DELETE
        }
    }
    var rowIds = this.getRowIdsByIndices(indices)
    this.trigger(DataTable.ON_ROW_DELETE, {
        falseDelete: true,
        indices: indices,
        rowIds: rowIds
    })
}

DataTable.fn.toggleAllSelect = function(){
    if (this.allSelected()){
        this.setAllRowsUnSelect();
    }else{
        this.setAllRowsSelect();
    }

};

DataTable.fn.setAllRowsSelect = function () {
    var indices = new Array(this.rows().length)
    for (var i = 0; i < indices.length; i++) {
        indices[i] = i
    }
    this.setRowsSelect(indices);
    this.allSelected(true);
    this.trigger(DataTable.ON_ROW_ALLSELECT, {})
}

/**
 * 设置选中行，清空之前已选中的所有行
 */
DataTable.fn.setRowSelect = function (index) {
    if (index instanceof Row) {
        index = this.getIndexByRowId(index.rowId)
    }
    this.setRowsSelect([index])
    this.setRowFocus(this.getSelectedIndex())
}

DataTable.fn.setRowsSelect = function (indices) {
    indices = indices || -1;
    if (indices == -1) {
        this.setAllRowsUnSelect({quiet: true})
        return;
    }
    indices = this._formatToIndicesArray(indices);
    var sIns = this.selectedIndices();
    if (u.isArray(indices) && u.isArray(sIns) && indices.join() == sIns.join()) {
        // 避免与控件循环触发
        return;
    }
    this.setAllRowsUnSelect({quiet: true});
    this.selectedIndices(indices);
//		var index = this.getSelectedIndex()
//		this.setCurrentRow(index)
    var rowIds = this.getRowIdsByIndices(indices);
    this.currentRowChange(-this.currentRowChange());
    this.trigger(DataTable.ON_ROW_SELECT, {
        indices: indices,
        rowIds: rowIds
    })
    this.updateCurrIndex();
}


/**
 * 添加选中行，不会清空之前已选中的行
 */
DataTable.fn.addRowSelect = function (index) {
    if (index instanceof Row) {
        index = this.getIndexByRowId(index.rowId)
    }
    this.addRowsSelect([index])
}

/**
 * 添加选中行，不会清空之前已选中的行
 */
DataTable.fn.addRowsSelect = function (indices) {
    indices = this._formatToIndicesArray(indices)
    var selectedIndices = this.selectedIndices().slice()
    for (var i = 0; i < indices.length; i++) {
        var ind = indices[i], toAdd = true
        for (var j = 0; j < selectedIndices.length; j++) {
            if (selectedIndices[j] == ind) {
                toAdd = false
            }
        }
        if (toAdd) {
            selectedIndices.push(indices[i])
        }
    }
    this.selectedIndices(selectedIndices)
//		var index = this.getSelectedIndex()
//		this.setCurrentRow(index)
    var rowIds = this.getRowIdsByIndices(indices)
    this.trigger(DataTable.ON_ROW_SELECT, {
        indices: indices,
        rowIds: rowIds
    })
    this.updateCurrIndex();
}

/**
 * 根据索引取rowid
 * @param {Object} indices
 */
DataTable.fn.getRowIdsByIndices = function (indices) {
    var rowIds = []
    for (var i = 0; i < indices.length; i++) {
        rowIds.push(this.getRow(indices[i]).rowId)
    }
    return rowIds
}

/**
 * 全部取消选中
 */
DataTable.fn.setAllRowsUnSelect = function (options) {
    this.selectedIndices([])
    if (!(options && options.quiet)) {
        this.trigger(DataTable.ON_ROW_ALLUNSELECT)
    }
    this.updateCurrIndex();
    this.allSelected(false);
}

/**
 * 取消选中
 */
DataTable.fn.setRowUnSelect = function (index) {
    if (index instanceof Row) {
        index = this.getIndexByRowId(index.rowId)
    }
    this.setRowsUnSelect([index])
}

DataTable.fn.setRowsUnSelect = function (indices) {
    indices = this._formatToIndicesArray(indices)
    var selectedIndices = this.selectedIndices().slice()

    // 避免与控件循环触发
    if (selectedIndices.indexOf(indices[0]) == -1) return;

    for (var i = 0; i < indices.length; i++) {
        var index = indices[i]
        var pos = selectedIndices.indexOf(index)
        if (pos != -1)
            selectedIndices.splice(pos, 1)
    }
    this.selectedIndices(selectedIndices)
    var rowIds = this.getRowIdsByIndices(indices)
    this.trigger(DataTable.ON_ROW_UNSELECT, {
        indices: indices,
        rowIds: rowIds
    })
    this.updateCurrIndex();
    this.allSelected(false);
}

/**
 *
 * @param {Object} index 要处理的起始行索引
 * @param {Object} type   增加或减少  + -
 */
DataTable.fn.updateSelectedIndices = function (index, type, num) {
    if (!u.isNumber(num)) {
        num = 1
    }
    var selectedIndices = this.selectedIndices().slice()
    if (selectedIndices == null || selectedIndices.length == 0)
        return
    for (var i = 0, count = selectedIndices.length; i < count; i++) {
        if (type == '+') {
            if (selectedIndices[i] >= index)
                selectedIndices[i] = parseInt(selectedIndices[i]) + num
        }
        else if (type == '-') {
            if (selectedIndices[i] >= index && selectedIndices[i] <= index + num - 1) {
                selectedIndices.splice(i, 1)
            }
            else if (selectedIndices[i] > index + num - 1)
                selectedIndices[i] = selectedIndices[i] - num
        }
    }
    this.selectedIndices(selectedIndices)
//		var currIndex = this.getSelectedIndex()
//		this.setCurrentRow(currIndex)
}

DataTable.fn.updateFocusIndex = function (opIndex, opType, num) {
    if (!u.isNumber(num)) {
        num = 1
    }
    if (opIndex <= this.focusIndex() && this.focusIndex() != -1) {
        if (opType === '+') {
            this.focusIndex(this.focusIndex() + num)
        } else if (opType === '-') {
            if (this.focusIndex() >= opIndex && this.focusIndex() <= opIndex + num - 1) {
                this.focusIndex(this.focusIndex() - 1)
            } else if (this.focusIndex() > opIndex + num - 1) {
                this.focusIndex(this.focusIndex() - num)
            }
        }
    }
}

/**
 * 获取选中行索引，多选时，只返回第一个行索引
 */
DataTable.fn.getSelectedIndex = function () {
    var selectedIndices = this.selectedIndices()
    if (selectedIndices == null || selectedIndices.length == 0)
        return -1
    return selectedIndices[0]
};

/**
 *获取选中的所有行索引数组索引
 */
DataTable.fn.getSelectedIndices = function () {
    var selectedIndices = this.selectedIndices()
    if (selectedIndices == null || selectedIndices.length == 0)
        return []
    return selectedIndices
};

/**
 * 兼容保留，不要用
 */
DataTable.fn.getSelectedIndexs = function () {
    return this.getSelectedIndices();
}

/**
 * 获取焦点行
 */
DataTable.fn.getFocusIndex = function () {
    return this.focusIndex()
}

/**
 * 根据行号获取行索引
 * @param {String} rowId
 */
DataTable.fn.getIndexByRowId = function (rowId) {
    var rows = this.rows();
    for (var i = 0, count = rows.length; i < count; i++) {
        if (rows[i].rowId == rowId)
            return i
    }
    return -1
}

/**
 * 获取所有行数据
 */
DataTable.fn.getAllDatas = function () {
    var rows = this.getAllRows()
    var datas = []
    for (var i = 0, count = rows.length; i < count; i++)
        if (rows[i])
            datas.push(rows[i].getData())
    return datas
}

/**
 * 获取当前页数据
 */
DataTable.fn.getData = function () {
    var datas = [], rows = this.rows();
    for (var i = 0; i < rows.length; i++) {
        datas.push(rows[i].getData())
    }
    return datas
}

DataTable.fn.getDataByRule = function (rule) {
    var returnData = {}, datas = null, rows;
    returnData.meta = this.meta
    returnData.params = this.params
    rule = rule || DataTable.SUBMIT.current
    if (rule == DataTable.SUBMIT.current) {
        datas = []
        var currIndex = this.focusIndex()
        if (currIndex == -1)
            currIndex = this.getSelectedIndex()
        rows = this.rows();
        for (var i = 0, count = rows.length; i < count; i++) {
            if (i == currIndex)
                datas.push(rows[i].getData())
            else
                datas.push(rows[i].getEmptyData())
        }

    }
    else if (rule == DataTable.SUBMIT.focus) {
        datas = []
        rows = this.rows();
        for (var i = 0, count = rows.length; i < count; i++) {
            if (i == this.focusIndex())
                datas.push(rows[i].getData())
            else
                datas.push(rows[i].getEmptyData())
        }
    }
    else if (rule == DataTable.SUBMIT.all) {
        datas = this.getData()
    }
    else if (rule == DataTable.SUBMIT.select) {
        datas = this.getSelectedDatas(true)
    }
    else if (rule == DataTable.SUBMIT.change) {
        datas = this.getChangedDatas()
    }
    else if (rule === DataTable.SUBMIT.empty) {
        datas = []
    }
    if (this.pageCache && datas != null) {
        datas = [{index: this.pageIndex(), select: this.getSelectedIndexs(), focus: this.focusIndex(), rows: datas}]
    }
    if (rule == DataTable.SUBMIT.allSelect) {
        datas = []
        var totalPages = this.totalPages();
        //缓存页数据
        for (var i = 0; i < totalPages; i++) {
            if (i == this.pageIndex()) {
                //当前页数据
                datas.push({
                    index: this.pageIndex(),
                    select: this.getSelectedIndexs(),
                    focus: this.focusIndex(),
                    rows: this.getSelectedDatas()
                });
            } else {
                var page = this.cachedPages[i];
                if (page) {
                    datas.push({
                        index: i,
                        select: page.selectedIndices,
                        focus: page.focus,
                        rows: page.getSelectDatas()
                    });
                }
            }
        }
    } else if (rule == DataTable.SUBMIT.allPages) {
        datas = []
        var totalPages = this.totalPages();
        //缓存页数据
        for (var i = 0; i < totalPages; i++) {
            if (i == this.pageIndex()) {
                //当前页数据
                datas.push({
                    index: this.pageIndex(),
                    select: this.getSelectedIndexs(),
                    focus: this.focusIndex(),
                    rows: this.getData()
                });
            } else {
                var page = this.cachedPages[i];
                if (page) {
                    datas.push({index: i, select: page.selectedIndices, focus: page.focus, rows: page.getData()});
                }
            }
        }
    }
    if (this.pageCache) {
        returnData.pages = datas;
    } else {
        returnData.rows = datas
        returnData.select = this.getSelectedIndexs()
        returnData.focus = this.getFocusIndex()
    }

    returnData.pageSize = this.pageSize()
    returnData.pageIndex = this.pageIndex()
    returnData.isChanged = this.isChanged()
    returnData.master = this.master
    returnData.pageCache = this.pageCache
    return returnData
}

/**
 * 获取选中行数据
 */
DataTable.fn.getSelectedDatas = function (withEmptyRow) {
    var selectedIndices = this.selectedIndices()
    var datas = []
    var sIndices = []
    for (var i = 0, count = selectedIndices.length; i < count; i++) {
        sIndices.push(selectedIndices[i])
    }
    var rows = this.rows();
    for (var i = 0, count = rows.length; i < count; i++) {
        if (sIndices.indexOf(i) != -1)
            datas.push(rows[i].getData())
        else if (withEmptyRow == true)
            datas.push(rows[i].getEmptyData())
    }
    return datas
};

/**
 * 取选中行
 */
DataTable.fn.getSelectedRows = function (){
    var selectedIndices = this.selectedIndices();
    var selectRows = [];
    var rows = this.rows.peek();
    var sIndices = []
    for (var i = 0, count = selectedIndices.length; i < count; i++) {
        sIndices.push(selectedIndices[i])
    }
    for (var i = 0, count = rows.length; i < count; i++) {
        if (sIndices.indexOf(i) != -1)
            selectRows.push(rows[i])
    }
    return selectRows
}

DataTable.fn.refSelectedRows = function () {
    return ko.pureComputed({
        read: function () {
            var ins = this.selectedIndices() || []
            var rs = this.rows()
            var selectedRows = []
            for (var i = 0; i < ins.length; i++) {
                selectedRows.push(rs[i])
            }
            return selectedRows
        }, owner: this
    })
}

/**
 * 绑定字段值
 * @param {Object} fieldName
 */
DataTable.fn.ref = function (fieldName) {
    this.createField(fieldName);
    if (!this.valueChange[fieldName])
        this.valueChange[fieldName] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.valueChange[fieldName]();
            this.currentRowChange();
            var row = this.getCurrentRow()
            if (row) {
                return row.getChildValue(fieldName)
            }
            else
                return ''
        },
        write: function (value) {
            var row = this.getCurrentRow()
            if (row)
                row.setChildValue(fieldName, value);
                //row.setValue(fieldName, value)
        },
        owner: this
    })
}

/**
 * 绑定字段属性
 * @param {Object} fieldName
 * @param {Object} key
 */
DataTable.fn.refMeta = function (fieldName, key) {
    if (!this.metaChange[fieldName + '.' + key])
        this.metaChange[fieldName + '.' + key] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.metaChange[fieldName + '.' + key]();
            this.currentRowChange();
            return this.getMeta(fieldName, key)
        },
        write: function (value) {
            this.setMeta(fieldName, key, value)
        },
        owner: this
    })
}

DataTable.fn.refRowMeta = function (fieldName, key) {
    if (!this.metaChange[fieldName + '.' + key])
        this.metaChange[fieldName + '.' + key] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.metaChange[fieldName + '.' + key]();
            this.currentRowChange();
            var row = this.getCurrentRow()
            if (row)
                return row.getMeta(fieldName, key)
            else
                return this.getMeta(fieldName, key)
        },
        write: function (value) {
            var row = this.getCurrentRow()
            if (row)
                row.setMeta(fieldName, value)
        },
        owner: this
    })
}

DataTable.fn.getRowMeta = function (fieldName, key) {
    var row = this.getCurrentRow()
    if (row)
        return row.getMeta(fieldName, key)
    else
        return this.getMeta(fieldName, key)
}

DataTable.fn.refEnable = function (fieldName) {
    return ko.pureComputed({
        //enable优先级： dataTable.enable >  row上的enable >  field中的enable定义
        read: function () {
            this.enableChange();
            if (!fieldName)
                return this.enable;
            var fieldEnable = this.getRowMeta(fieldName, 'enable')
            if (typeof fieldEnable == 'undefined' || fieldEnable == null)
                fieldEnable = true;
            return fieldEnable && this.enable
//				return this.enable && (this.getMeta(fieldName, 'enable') || false)
        },
        owner: this
    })
}

DataTable.fn.isEnable = function (fieldName) {
    var fieldEnable = this.getMeta(fieldName, 'enable')
    if (typeof fieldEnable == 'undefined' || fieldEnable == null)
        fieldEnable = true
    return fieldEnable && this.enable
}

DataTable.fn.getValue = function (fieldName, row) {
    row = row || this.getCurrentRow()
    if (row)
        return row.getValue(fieldName)
    else
        return ''
}



DataTable.fn.setValue = function (fieldName, value, row, ctx) {
    if (arguments.length === 1){
        value = fieldName;
        fieldName = '$data';
    }

    row = row ? row : this.getCurrentRow()
    if (row)
        row.setValue(fieldName, value, ctx)
}

DataTable.fn.setEnable = function (enable) {
    if (this.enable == enable) return
    //当传入的参数不为false时，默认enable为true
    if (enable===false){
        enable=false;
    }else{
        enable=true;
    }
    this.enable = enable
    this.enableChange(-this.enableChange())
    this.trigger(DataTable.ON_ENABLE_CHANGE, {
        enable: this.enable
    })
}

/**
 * 获取当前操作行
 * 规则： focus 行优先，没有focus行时，取第一选中行
 */
DataTable.fn.getCurrentRow = function () {
    if (this.focusIndex() != -1)
        return this.getFocusRow()
    var index = this.getSelectedIndex()
    if (index == -1)
        return null
    else
        return this.getRow(index)
}


DataTable.fn.updateCurrIndex = function () {
    var currentIndex = this.focusIndex() != -1 ? this.focusIndex() : this.getSelectedIndex();
    if (this._oldCurrentIndex != currentIndex) {
        this._oldCurrentIndex = currentIndex;
        this.trigger(DataTable.ON_CURRENT_ROW_CHANGE)
        this.currentRowChange(-this.currentRowChange());
        if (this.ns){
            if (this.root.valueChange[this.ns])
                this.root.valueChange[this.ns](-this.root.valueChange[this.ns]());
        }

    }
}

/**
 * 获取焦点行
 */
DataTable.fn.getFocusRow = function () {
    if (this.focusIndex() != -1)
        return this.getRow(this.focusIndex())
    else
        return null
}

/**
 * 设置焦点行
 * @param {Object} index 行对象或者行index
 * @param quiet 不触发事件
 * @param force 当index行与已focus的行相等时，仍然触发事件
 */
DataTable.fn.setRowFocus = function (index, quiet, force) {
    var rowId = null
    if (index instanceof Row) {
        index = this.getIndexByRowId(index.rowId)
        rowId = index.rowId
    }
    if (index === -1 || (index === this.focusIndex() && !force)) {
        return;
    }
    this.focusIndex(index)
    if (quiet) {
        return;
    }
    this.currentRowChange(-this.currentRowChange())
    if (!rowId) {
        rowId = this.getRow(index).rowId
    }
    this.trigger(DataTable.ON_ROW_FOCUS, {
        index: index,
        rowId: rowId
    })
    this.updateCurrIndex();
}

/**
 * 焦点行反选
 */
DataTable.fn.setRowUnFocus = function () {
    this.currentRowChange(-this.currentRowChange())
    var indx = this.focusIndex(), rowId = null;
    if (indx !== -1) {
        rowId = this.getRow(indx).rowId
    }
    this.trigger(DataTable.ON_ROW_UNFOCUS, {
        index: indx,
        rowId: rowId
    })
    this.focusIndex(-1)
    this.updateCurrIndex();
}

DataTable.fn.getRow = function (index) {
    //return this.rows()[index]   //modify by licza.   improve performance
    return this.rows.peek()[index]
};

/**
 * 根据rowid取row对象
 * @param rowid
 * @returns {*}
 */
DataTable.fn.getRowByRowId = function (rowid) {
    var rows = this.rows.peek();
    for (var i = 0, count = rows.length; i < count; i++) {
        if (rows[i].rowId == rowid)
            return rows[i]
    }
    return null
}

/**
 * 取行索引
 * @param row
 * @returns {*}
 */
DataTable.fn.getRowIndex = function (row){
    var rows = this.rows.peek();
    for (var i = 0, count = rows.length; i < count; i++) {
        if (rows[i].rowId === row.rowId)
            return i;
    }
    return -1;
};

DataTable.fn.getAllRows = function () {
    return this.rows.peek();
}

DataTable.fn.getAllPageRows = function () {
    var datas = [], rows;
    for (var i = 0; i < this.totalPages(); i++) {
        rows = [];
        if (i == this.pageIndex()) {
            rows = this.getData();
        } else {
            var page = this.cachedPages[i];
            if (page) {
                rows = page.getData();
            }
        }
        for (var j = 0; j < rows.length; j++) {
            datas.push(rows[j]);
        }
    }
    return datas;
}

/**
 * 获取变动的数据(新增、修改)
 */
DataTable.fn.getChangedDatas = function (withEmptyRow) {
    var datas = [], rows = this.rows();
    for (var i = 0, count = rows.length; i < count; i++) {
        if (rows[i] && rows[i].status != Row.STATUS.NORMAL) {
            datas.push(rows[i].getData())
        }
        else if (withEmptyRow == true) {
            datas.push(rows[i].getEmptyData())
        }
    }
    return datas
};

/**
 * 取改变的行
 */
DataTable.fn.getChangedRows = function(){
    var changedRows = [], rows = this.rows.peek();
    for (var i = 0, count = rows.length; i < count; i++) {
        if (rows[i] && rows[i].status != Row.STATUS.NORMAL) {
            changedRows.push(rows[i])
        }
    }
    return changedRows
}

DataTable.fn._formatToIndicesArray = function (indices) {
    if (typeof indices == 'string' || typeof indices == 'number') {
        indices = [indices]
    } else if (indices instanceof Row) {
        indices = this.getIndexByRowId(indices.rowId)
    } else if (u.isArray(indices) && indices.length > 0 && indices[0] instanceof Row) {
        for (var i = 0; i < indices.length; i++) {
            indices[i] = this.getIndexByRowId(indices[i].rowId)
        }
    }
    return indices;
};


/**
 * row :   {data:{}}
 * @constructor
 */
var Page = function (options) {
    this.focus = options['focus'] || null;
    this.selectedIndices = options['selectedIndices'] || null;
    this.rows = options['rows'] || []
    this.parent = options['parent'] || null;
}

Page.fn = Page.prototype

Page.fn.getData = function () {
    var datas = [], row, meta;
    meta = this.parent.getMeta()
    for (var i = 0; i < this.rows.length; i++) {
        row = this.rows[i];
        datas.push({'id': row.rowId, 'status': row.status, data: row.data});
    }
    return datas
}

Page.fn.getSelectDatas = function () {
    var datas = [], row;
    for (var i = 0; i < this.rows.length; i++) {
        row = this.rows[i];
        datas.push({'id': row.rowId, 'status': row.status, data: row.data});
    }
    for (var i = 0; i < this.selectedIndices.length; i++) {
        row = this.rows[this.selectedIndices[i]];
        datas.push({'id': row.rowId, 'status': row.status, data: row.data});
    }
    return datas
}

Page.fn.getRowByRowId = function (rowid) {
    for (var i = 0, count = this.rows.length; i < count; i++) {
        if (this.rows.rowId == rowid)
            return this.rows[i]
    }
    return null
}

Page.fn.removeRowByRowId = function (rowid) {
    for (var i = 0, count = this.rows.length; i < count; i++) {
        if (this.rows.rowId == rowid)
            this.rows.splice(i, 1);
    }
}

Page.fn.getSelectRows = function () {
    var rows = [];
    for (var i = 0; i < this.selectedIndices.length; i++) {
        rows.push(this.rows[this.selectedIndices[i]])
    }
    return rows
}

Page.fn.getRowByRowId = function (rowid) {
    for (var i = 0, count = this.rows.length; i < count; i++) {
        if (this.rows[i].rowId == rowid)
            return this.rows[i]
    }
    return null
}

Page.fn.setRowValue = function (rowIndex, fieldName, value) {
    var row = this.rows[rowIndex]
    if (row) {
        row.data[fieldName]['value'] = value
        if (row.status != Row.STATUS.NEW)
            row.status = Row.STATUS.UPDATE
    }
}

Page.fn.getRowValue = function (rowIndex, fieldName) {
    var row = this.rows[rowIndex]
    if (row) {
        return row.data[fieldName]['value']
    }
    return null
}

Page.fn.setRowMeta = function (rowIndex, fieldName, metaName, value) {
    var row = this.rows[rowIndex]
    if (row) {
        var meta = row[fieldName].meta
        if (!meta)
            meta = row[fieldName].meta = {}
        meta[metaName] = value
        if (row.status != Row.STATUS.NEW)
            row.status = Row.STATUS.UPDATE
    }
}

Page.fn.getRowMeta = function (rowIndex, fieldName, metaName) {
    var row = this.rows[rowIndex]
    if (row) {
        var meta = row[fieldName].meta
        if (!meta)
            return null
        else
            return meta[metaName]
    }
    return null
}


Page.fn.updateRow = function (originRow, newRow) {
    originRow.status = originRow.status
    //this.rowId = data.rowId
    if (!newRow.data) return;
    for (var key in newRow.data) {
        if (originRow.data[key]) {
            var valueObj = newRow.data[key]
            if (typeof valueObj == 'string' || typeof valueObj == 'number' || valueObj === null)
                originRow.data[key]['value'] = valueObj
            //this.setValue(key, this.formatValue(key, valueObj))
            else {
//					this.setValue(key, valueObj.value)

                if (valueObj.error) {
                    u.showMessageDialog({title: "警告", msg: valueObj.error, backdrop: true});
                } else {
                    //this.setValue(key, this.formatValue(key, valueObj.value), null)
                    originRow.data[key]['value'] = valueObj.value
                    for (var k in valueObj.meta) {
                        originRow.data[key]['meta'] = originRow.data[key]['meta'] || {}
                        originRow.data[key]['meta'][k] = valueObj.meta[k]
                    }
                }
            }
        }
    }
}


/**===========================================================================================================
 *
 * 行模型
 *
 * {id:'xxx', parent:dataTable1}
 *
 * data:{value:'v1',meta:{}}
 *
 * ===========================================================================================================
 */
var Row = function (options) {
    var self = this;
    this.rowId = options['id'] || Row.getRandomRowId()
    this.status = Row.STATUS.NEW
    //this.selected = ko.observable(false);
    //this.selected.subscribe(function(value){
    //    if (value === true){
    //        self.parent.addRowSelect(self);
    //    }else{
    //        self.parent.setRowUnSelect(self);
    //    }
    //
    //})
    this.parent = options['parent']
    this.initValue = null
    this.data = {}
    this.metaChange = {}//ko.observable(1)
    this.valueChange = {};
    this.currentRowChange = ko.observable(1);
    this.selected = ko.pureComputed({
        read: function () {
            var index = this.parent.getRowIndex(this);
            var selectindices = this.parent.getSelectedIndices();
            return selectindices.indexOf(index) != -1;
        },
        owner: this

    })
    this.focused = ko.pureComputed({
        read: function () {
            var index = this.parent.getRowIndex(this);
            var focusIndex = this.parent.getFocusIndex()
            return focusIndex == index;
        },
        owner: this

    })
    this.init()
}

Row.STATUS = {
    NORMAL: 'nrm',
    UPDATE: 'upd',
    NEW: 'new',
    DELETE: 'del',
    FALSE_DELETE: 'fdel'
}

Row.fn = Row.prototype = new Events()

/**
 * Row初始化方法
 * @private
 */
Row.fn.init = function () {
    var meta = this.parent.meta;

    for (var key in meta) {
        var targetData;
        if (key.indexOf('.') > 0){
            var keys = key.split('.');
            targetData =  this.data[keys[0]] = this.data[keys[0]] || {};
            for(var i = 1; i< keys.length; i++){
                targetData[keys[i]] = targetData[keys[i]] || {};
                targetData = targetData[keys[i]];
            }
        }else{
            this.data[key] = this.data[key] || {}
            targetData = this.data[key];
        }
        targetData.value = null;
        //this.data[key] = {}
        //处理子表
        if (meta[key]['type'] && meta[key]['type'] === 'child'){
            targetData.isChild = true;
            //ns 是多级数据时的空间名： 最顶层的dataTable没有ns。  f1.f2.f3
            var ns = this.parent.ns === '' ? key : this.parent.ns + '.' + key
            targetData.value = new u.DataTable({root:this.parent.root,ns:ns,meta:meta[key]['meta']});
        }
        //添加默认值
        else if (meta[key]['default']) {
            var defaults = meta[key]['default']
            if (typeof defaults === 'object'){
                for (var k in defaults) {
                    if (k == 'value'){
                        if (typeof defaults[k] === 'function')
                            targetData.value = this.formatValue(key,defaults[k]());
                        else
                            targetData.value = this.formatValue(key,defaults[k]);
                    }
                    else {
                        targetData.meta = targetData.meta || {}
                        targetData.meta[k] = defaults[k]
                    }
                }
            }else{
                if (typeof defaults === 'function')
                    targetData.value = this.formatValue(key, defaults());
                else
                    targetData.value = this.formatValue(key,defaults);
            }
        }
    }
}

Row.fn.toggleSelect = function(type){
    var index = this.parent.getRowIndex(this);
    var selectindices = this.parent.getSelectedIndices();
    if (selectindices.indexOf(index) != -1){
        this.parent.setRowUnSelect(index);
    }else{
        if (type === 'single')
            this.parent.setRowSelect(index);
        else
            this.parent.addRowSelect(index);
    }
};

/**
 * 行点击事件
 */
Row.fn.singleSelect = function(){
    this.toggleSelect('single');
};

Row.fn.multiSelect = function(){
    this.toggleSelect('multi');
};

Row.fn.ref = function (fieldName) {
    this.parent.createField(fieldName);
    if (!this.valueChange[fieldName])
        this.valueChange[fieldName] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.valueChange[fieldName]();
            this.currentRowChange();
            return this.getChildValue(fieldName)
            //var value = this._getField(fieldName)['value'];
            //return value;
        },
        write: function (value) {
            this.setChildValue(fieldName, value);
            //this.setValue(fieldName, value)
        },
        owner: this
    })
}


/**
 * 绑定子表行
 * @param fieldName
 */
//Row.fn.refChildRows = function(fieldName){
//    if (!this.valueChange[fieldName])
//        this.valueChange[fieldName] = ko.observable(1);
//    return ko.pureComputed({
//        read: function () {
//            this.valueChange();
//            this.currentRowChange();
//            var childDt = this._getField(fieldName)['value'];
//            if (!(childDt instanceof u.DataTable)){
//                throw new Error("refChildRows('" + fieldName + "') error, field is not a child datatable!");
//            }
//            return childDt.rows.peek();
//        },
//        //write: function (value) {
//        //    this.setValue(fieldName, value)
//        //},
//        owner: this
//    })
//}

Row.fn.refMeta = function (fieldName, key) {
    if (!this.metaChange[fieldName + '.' + key])
        this.metaChange[fieldName + '.' + key] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.metaChange[fieldName + '.' + key]()
            return this.getMeta(fieldName, key)
        },
        write: function (value) {
            this.setMeta(fieldName, key, value)
        },
        owner: this
    })
}
Row.fn.refCombo = function (fieldName, datasource) {
    if (!this.valueChange[fieldName])
        this.valueChange[fieldName] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.valueChange[fieldName]();
            this.currentRowChange();
            var ds = u.getJSObject(this.parent.parent, datasource)
            if (this._getField(fieldName)['value'] === undefined || this._getField(fieldName)['value'] === "") return "";
            var v = this._getField(fieldName)['value'];
            var valArr = typeof v === 'string' ? v.split(',') : [v];

            var nameArr = []

            for (var i = 0, length = ds.length; i < length; i++) {
                for (var j = 0; j < valArr.length; j++) {
                    var value = ds[i]['pk'] || ds[i]['value'] || '';
                    if (value == valArr[j]) {
                        nameArr.push(ds[i].name)
                    }
                }
            }

            return nameArr.toString();
        },
        write: function (value) {

            this.setValue(fieldName, value)
        },
        owner: this
    })
}
Row.fn.refDate = function (fieldName, format) {
    if (!this.valueChange[fieldName])
        this.valueChange[fieldName] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.valueChange[fieldName]();
            this.currentRowChange();
            if (!this._getField(fieldName)['value']) return "";
            var valArr = this._getField(fieldName)['value']
            if (!valArr) return "";
            valArr = moment(valArr).format(format)
            return valArr;
        },
        write: function (value) {

            this.setValue(fieldName, value)
        },
        owner: this
    })
}

// 刘云燕提交
Row.fn.refEnum = function (fieldName) {
    this.parent.createField(fieldName);
    if (!this.valueChange[fieldName])
        this.valueChange[fieldName] = ko.observable(1);
    return ko.pureComputed({
        read: function () {
            this.valueChange[fieldName]();
            this.currentRowChange();
            if (!this._getField(fieldName)['value']) return "";
            var valArr = this._getField(fieldName)['value']
            if (!valArr) return "";
            if(valArr == "N")
                valArr = "否";
            else if(valArr == "Y")
                valArr = "是";
            return valArr;
        },
        write: function (value) {

            this.setValue(fieldName, value)
        },
        owner: this
    })
}

/**
 *获取row中某一列的值
 */
Row.fn.getValue = function (fieldName) {
    return this._getField(fieldName)['value']
}

/**
 * 获取子表值 ，如果fieldName对应了一个子表，返回该子表的行数组
 * @param fieldName
 */
Row.fn.getChildValue = function(fieldName){
    var nameArr = fieldName.split('.');
    var _name = nameArr[0];
    for (var i = 0, count = nameArr.length; i<count; i++){
        var _value = this.getValue(_name);
        //最后一级
        if (i == count -1){
            if (_value instanceof u.DataTable){
                return _value.rows.peek();
            }else{
                return _value;
            }
        }else{
            if (_value instanceof u.DataTable){
                _value = _value.getCurrentRow();
                if (!_value)
                    return '';
                else
                    return _value.getChildValue(fieldName.replace(_name + '.', ''))
            }else{
                _name = _name + '.' + nameArr[i+1];
            }

        }
    }
    return '';
};

Row.fn.setChildValue = function(fieldName, value){
    var nameArr = fieldName.split('.');
    var _name = nameArr[0];
    var _field = this.data[_name];//_field保存当前_name对应的数据
    for (var i = 0, count = nameArr.length; i<count; i++){
        // var _field = this.data[_name];
        // if (!_field)
        //     throw new Error('field:' + fieldName + ' not exist in dataTable:' + this.root.id + '!');
        //最后一级
        if (i == count -1){
            if (_field['value'] instanceof u.DataTable){
                //暂不处理
            }else{
                //_field['value'] = value;
                this.setValue(fieldName, value);
            }
        }else{
			if (_field && _field['value'] instanceof u.DataTable){
                var row = _field['value'].getCurrentRow();
                if (row)
                    row.setChildValue(fieldName.replace(_name + '.', ''), value)
            }else{
            	_name = nameArr[i + 1];
            	_field = _field[_name];//多层嵌套时_field取子项对应的数据
                // _name = _name + '.' + nameArr[i];
                
            }

        }
    }
};


var eq = function (a, b) {
    if ((a === null || a === undefined || a === '') && (b === null || b === undefined || b === '')) return true;
    if (u.isNumber(a) && u.isNumber(b) && parseFloat(a) == parseFloat(b)) return true;
    if (a + '' == b + '')  return true;
    return false;
}

Row.fn._triggerChange = function(fieldName, oldValue, ctx){
    this._getField(fieldName).changed = true
    if (this.status != Row.STATUS.NEW)
        this.status = Row.STATUS.UPDATE
    if (this.valueChange[fieldName])
        this.valueChange[fieldName](-this.valueChange[fieldName]())
    if (this.parent.getCurrentRow() == this && this.parent.valueChange[fieldName])
        this.parent.valueChange[fieldName](-this.parent.valueChange[fieldName]());
    if (this.parent.ns){
        var fName = this.parent.ns + '.' + fieldName;
        if (this.parent.root.valueChange[fName])
            this.parent.root.valueChange[fName](-this.parent.root.valueChange[fName]());
    }

    var event = {
        eventType: 'dataTableEvent',
        dataTable: this.parent.id,
        rowId: this.rowId,
        field: fieldName,
        oldValue: oldValue,
        newValue: this.getValue(fieldName),
        ctx: ctx || ""
    }
    this.parent.trigger(DataTable.ON_VALUE_CHANGE, event);
    this.parent.trigger(fieldName + "." + DataTable.ON_VALUE_CHANGE, event);
    if (this == this.parent.getCurrentRow())
        this.parent.trigger(fieldName + "." + DataTable.ON_CURRENT_VALUE_CHANGE, event);

};

/**
 *设置row中某一列的值
 */
Row.fn.setValue = function (fieldName, value, ctx, options) {
    if (arguments.length === 1){
        value = fieldName;
        fieldName = '$data';
    }
    var oldValue = this.getValue(fieldName) || ""
    if (eq(oldValue, value)) return;
    this._getField(fieldName)['value'] = value;
    this._triggerChange(fieldName, oldValue, ctx);
    // this._getField(fieldName).changed = true
    // if (this.status != Row.STATUS.NEW)
    //     this.status = Row.STATUS.UPDATE
    // if (this.valueChange[fieldName])
    //     this.valueChange[fieldName](-this.valueChange[fieldName]())
    // if (this.parent.getCurrentRow() == this && this.parent.valueChange[fieldName])
    //     this.parent.valueChange[fieldName](-this.parent.valueChange[fieldName]());
    // if (this.parent.ns){
    //     var fName = this.parent.ns + '.' + fieldName;
    //     if (this.parent.root.valueChange[fName])
    //         this.parent.root.valueChange[fName](-this.parent.root.valueChange[fName]());
    // }

    // var event = {
    //     eventType: 'dataTableEvent',
    //     dataTable: this.parent.id,
    //     rowId: this.rowId,
    //     field: fieldName,
    //     oldValue: oldValue,
    //     newValue: value,
    //     ctx: ctx || ""
    // }
    // this.parent.trigger(DataTable.ON_VALUE_CHANGE, event);
    // this.parent.trigger(fieldName + "." + DataTable.ON_VALUE_CHANGE, event);
    // if (this == this.parent.getCurrentRow())
    //     this.parent.trigger(fieldName + "." + DataTable.ON_CURRENT_VALUE_CHANGE, event);
}

/**
 *获取row中某一列的属性
 */
Row.fn.getMeta = function (fieldName, key, fetchParent) {
    if (arguments.length == 0) {
        var mt = {}
        for (var k in this.data) {
            mt[k] = this.data[k].meta ? this.data[k].meta : {}
        }
        return mt
    }
    var meta = this._getField(fieldName).meta
    if (meta && meta[key] !== undefined && meta[key] !== null && meta[key] !== '')
        return meta[key]
    else if (typeof fetchParent == 'undefined' || fetchParent != false)
        return this.parent.getMeta(fieldName, key)
    return undefined;
}

/**
 *设置row中某一列的属性
 */
Row.fn.setMeta = function (fieldName, key, value) {
    var meta = this._getField(fieldName).meta
    if (!meta)
        meta = this._getField(fieldName).meta = {}
    var oldValue = meta[key]
    if (eq(oldValue, value)) return;
    meta[key] = value
    //this.metaChange(- this.metaChange())
    if (this.metaChange[fieldName + '.' + key]) {
        this.metaChange[fieldName + '.' + key](-this.metaChange[fieldName + '.' + key]());
    }

    if (key == 'enable')
        this.parent.enableChange(-this.parent.enableChange())
    if (this.parent.getCurrentRow() == this) {
        if (this.parent.metaChange[fieldName + '.' + key])
            this.parent.metaChange[fieldName + '.' + key](-this.parent.metaChange[fieldName + '.' + key]());
        this.parent.trigger(fieldName + '.' + key + '.' + DataTable.ON_CURRENT_META_CHANGE, {
            eventType: 'dataTableEvent',
            dataTable: this.parent.id,
            oldValue: oldValue,
            newValue: value
        });
        //this.parent.metaChange(- this.parent.metaChange())
    }
    this.parent.trigger(DataTable.ON_ROW_META_CHANGE, {
        eventType: 'dataTableEvent',
        dataTable: this.parent.id,
        field: fieldName,
        meta: key,
        oldValue: oldValue,
        newValue: value,
        row: this
    });

    this.parent.trigger(fieldName + '.' + key + '.' + DataTable.ON_ROW_META_CHANGE, {
        eventType: 'dataTableEvent',
        dataTable: this.parent.id,
        field: fieldName,
        meta: key,
        oldValue: oldValue,
        newValue: value,
        row: this
    });
}

/**
 * [_setData description]
 * @param {[type]} sourceData 
 * @param {[type]} targetData 
 * @param {[type]} subscribe  
 * @param {[type]} parentKey  [父项key，数据项为数组时获取meta值用]
 */
Row.fn._setData = function(sourceData, targetData, subscribe, parentKey){
    for (var key in sourceData) {
    	var _parentKey = parentKey || null;
        //if (targetData[key]) {
        targetData[key] = targetData[key] || {};
        var valueObj = sourceData[key]
        if (typeof valueObj != 'object')
            this.parent.createField(key);
        //if (typeof this.parent.meta[key] === 'undefined') continue;
        if (valueObj == null ||  typeof valueObj != 'object'){
            targetData[key]['value'] = this.formatValue(key, valueObj)
            if (subscribe === true && (oldValue !== targetData[key]['value'])){
                    this._triggerChange(key, oldValue);
                }
        }
        else {
            if (valueObj.error) {
                u.showMessageDialog({title: "警告", msg: valueObj.error, backdrop: true});
            } else if (valueObj.value || valueObj.value === null  || valueObj.meta){
                var oldValue = targetData[key]['value'];
                targetData[key]['value'] = this.formatValue(key, valueObj.value)
                if (subscribe === true && (oldValue !== targetData[key]['value'])){
                    this._triggerChange(key, oldValue);
                }
                for (var k in valueObj.meta) {
                    this.setMeta(key, k, valueObj.meta[k])
                }
            }else if (u.isArray(valueObj)){
                targetData[key].isChild = true;
                //ns 是多级数据时的空间名： 最顶层的dataTable没有ns。  f1.f2.f3
                var _key = _parentKey == null ? key : _parentKey + '.' + key;
                var ns = this.parent.ns === '' ? key : this.parent.ns + '.' + _key
              if(this.parent.meta[_key]){
            	var meta = this.parent.meta[_key]['meta']
                targetData[key].value = new u.DataTable({root:this.parent.root,ns:ns,meta:meta});
                targetData[key].value.setSimpleData(valueObj);
              }
            }else{
            	_parentKey = _parentKey == null ? key : _parentKey + '.' + key;
                this._setData(valueObj, targetData[key], null, _parentKey);
            }
        }
        //}
    }

}

/**
 *设置Row数据
 *@subscribe 是否触发监听  
 */
Row.fn.setData = function (data, subscribe) {
    this.status = data.status
    var sourceData = data.data,
        targetData = this.data;
     this._setData(sourceData, targetData,subscribe);

    // 如果有一天，规则改成：定义dataTable的时候必须定义所有字段信息才能设置数据。放开下面这段代码
    //var meta = this.parent.meta;
    //for (var key in meta){
    //    var oldValue = newValue = null;
    //    //子数据
    //    if (meta[key]['type'] && meta[key]['type'] === 'child'){
    //        targetData[key].isChild = true;
    //        //ns 是多级数据时的空间名： 最顶层的dataTable没有ns。  f1.f2.f3
    //        var ns = this.parent.ns === '' ? key : this.parent.ns + '.' + key
    //        var meta = this.parent.meta[key]['meta']
    //        targetData[key].value = new u.DataTable({root:this.parent.root,ns:ns,meta:meta});
    //        if (typeof sourceData[key] === 'object')
    //            targetData[key].value.setSimpleData(sourceData[key]);
    //    }
    //    //存在多级关系
    //    else if (key.indexOf('.') != -1){
    //        var keys = key.split('.');
    //        var _fieldValue = sourceData;
    //        var _targetField = targetData;
    //        for(var i = 0; i< keys.length; i++){
    //            _fieldValue = _fieldValue[keys[i]];
    //            _targetField = _targetField[keys[i]];
    //        }
    //        oldValue = _targetField['value'];
    //        _targetField['value'] = this.formatValue(key, _fieldValue)
    //        newValue = _targetField['value'];
    //    }
    //    // 通过 setSimpleData 设置的数据
    //    else if (sourceData[key] == null ||  typeof sourceData[key] != 'object'){
    //        oldValue = targetData[key]['value'];
    //        targetData[key]['value'] = this.formatValue(key, sourceData[key])
    //        newValue = targetData[key]['value'];
    //    }
    //    else{
    //        var valueObj = sourceData[key];
    //        if (valueObj.error) {
    //            u.showMessageDialog({title: "警告", msg: valueObj.error, backdrop: true});
    //        } else if (valueObj.value || valueObj.value === null || valueObj.meta){
    //            oldValue = targetData[key]['value'];
    //            targetData[key]['value'] = this.formatValue(key, valueObj.value)
    //            newValue = targetData[key]['value'];
    //            for (var k in valueObj.meta) {
    //                this.setMeta(key, k, valueObj.meta[k])
    //            }
    //        }
    //    }
    //    if (subscribe === true && (oldValue !== newValue)){
    //        this._triggerChange(key, oldValue);
    //    }
    //
    //}
};



Row.fn.setSimpleData = function(data){
    var allData = {};
    allData.data = data;
    allData.status = 'nrm';
    this.setData(allData, true);
    this.currentRowChange(-this.currentRowChange());
}


/**
 * 格式化数据值
 * @private
 * @param {Object} field
 * @param {Object} value
 */
Row.fn.formatValue = function (field, value) {
    var type = this.parent.getMeta(field, 'type')
    if (!type) return value
    if (type == 'date' || type == 'datetime') {
        return _formatDate(value)
    }
    return value
}

Row.fn.updateRow = function (row) {
    this.setData(row)
}

/**
 * @private
 * 提交数据到后台
 */
/**
 * @private
 * 提交数据到后台
 */
Row.fn.getData = function () {
    var data = ko.toJS(this.data)
    var meta = this.parent.getMeta()
    for (var key in meta) {
        if (meta[key] && meta[key].type) {
            if (meta[key].type == 'date' || meta[key].type == 'datetime') {
                if(key.indexOf('.')>0){//大于0说明是多级json
                    var keys=key.split('.');
                    var _keyValue=data;
                    for(var i=0,count=keys.length;i<count;i++){
                        _keyValue=_keyValue[keys[i]];
                    }
                    _keyValue.value =_dateToUTCString(_keyValue.value);
                  
                }else{
                    data[key].value = _dateToUTCString(data[key].value)
                }
            } else if(meta[key].type == 'child') {
                data[key].value = this.getValue(key).getDataByRule(DataTable.SUBMIT.all);
            }
        }
    }
    return {'id': this.rowId, 'status': this.status, data: data}
}

Row.fn.getEmptyData = function () {
    return {'id': this.rowId, 'status': this.status, data: {}}
};

Row.fn._getSimpleData = function(data){
    var _data = {};
    var meta = this.parent.getMeta() || {};
    for(var key in data){
        if (key === 'meta' || u.isEmptyObject(data[key])){
            continue;
        }else if (data[key].isChild) {
            _data[key] = data[key].value?data[key].value.getSimpleData():{};
        }else if (key === '$data'){  //处理一维数组： [1,2,3]
            _data = data[key].value
        }else if (typeof data[key].value !== 'undefined'){
           //如果类型为boolean，无论值为false、true都应该等于他本身
            if(meta[key] && meta[key].type==='boolean'){
                _data[key] = data[key].value?true:false;//默认值可能是null
            }else{
                _data[key] = data[key].value;
            }
            if (meta[key] && meta[key].type) {
                if (meta[key].type == 'date' || meta[key].type == 'datetime') {

                    _data[key] = _dateToUTCString(data[key].value)
                }
            }
        }else if(typeof data[key].value !== 'undefined'){
            _data[key] = undefined;
        }else{
            _data[key] = this._getSimpleData(data[key])
        }
    }
    return _data;

}

Row.fn.getSimpleData = function(options){
    options = options || {}
    var fields = options['fields'] || null;
    var meta = this.parent.getMeta();
    var data = this.data;
    var _data = this._getSimpleData(data); //{};
    // for (var key in meta) {
    //    if (fields && fields.indexOf(key) == -1)
    //        continue;
    //    if (meta[key] && meta[key].type) {
    //        if (meta[key].type == 'date' || meta[key].type == 'datetime') {
    //            data[key].value = _dateToUTCString(data[key].value)
    //        }
    //    }
    //    _data[key] = data[key].value;
    // }
    return _data;

};

Row.fn._findField = function(fieldName){
    var rat = this.data[fieldName];
    if (!rat) {
        var fnames = fieldName.split('.'); //多级field
        if (fnames.length > 1){
            var tempField = this.data
            for (var i = 0; i < fnames.length; i++){
                tempField = tempField[fnames[i]];
                if (!tempField){
                    break;
                }
            }
            rat = tempField;
        }
    }
    return rat || null;

}

Row.fn._getField = function (fieldName) {
    var rat = this._findField(fieldName);
    if (!rat) {
        var msg = 'field:' + fieldName + ' not exist in dataTable:' + this.parent.root.id + '!'
        console.error(msg);
        throw new Error(msg);
    }
    return rat;
}


/*
 * 生成随机行id
 * @private
 */
Row.getRandomRowId = function () {
    var _id = setTimeout(function () {})
    return  _id + '';
};

var _formatDate = function (value) {
    if (!value) return value
    var date = new Date();
    date.setTime(value);
    //如果不能转为Date 直接返回原值
    if (isNaN(date)){
        return value
    }
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (parseInt(month) < 10) month = "0" + month;
    var day = date.getDate();
    if (parseInt(day) < 10) day = "0" + day;
    var hours = date.getHours();
    if (parseInt(hours) < 10) hours = "0" + hours;
    var minutes = date.getMinutes();
    if (parseInt(minutes) < 10) minutes = "0" + minutes;
    var seconds = date.getSeconds();
    if (parseInt(seconds) < 10) seconds = "0" + seconds;
    var mill = date.getMilliseconds();
    var formatString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds ; //+ "." + mill;
    return formatString;
}

var _dateToUTCString = function (date) {
    if (!date) return ''
    if(typeof date==='number')
        return date
    if (date.indexOf("-") > -1)
        date = date.replace(/\-/g, "/");
    var utcString = Date.parse(date);
    if (isNaN(utcString)) return "";
    return utcString;
}


u.Row = Row;
u.DataTable = DataTable;

/**
 * Created by dingrf on 2016/4/5.
 */

u.EnableMixin = {
    init: function(){
        var self = this;
        //处理只读
        this.dataModel.refEnable(this.field).subscribe(function(value) {
            self.setEnable(value);
        });
        this.setEnable(this.dataModel.isEnable(this.field));

    },
    methods:{
        setEnable: function(enable){
                if (enable === true || enable === 'true') {
                    this.enable = true;
                    this.element.removeAttribute('readonly');
                    u.removeClass(this.element.parentNode,'disablecover');
                } else if (enable === false || enable === 'false') {
                    this.enable = false;
                    this.element.setAttribute('readonly', 'readonly');
                    u.addClass(this.element.parentNode,'disablecover');
                }
        }
    }
}
/**
 * Created by dingrf on 2016/4/6.
 */

u.RequiredMixin = {
    init: function(){
        var self = this;
        this.required = this.getOption('required');
        this.dataModel.refRowMeta(this.field, "required").subscribe(function(value) {
            self.setRequired(event.newValue);
        });
        //this.setRequired(this.dataModel.getMeta(this.field, "required"));

    },
    methods:{
        setRequired: function (required) {
            if (required === true || required === 'true') {
                this.required = true;
            } else if (required === false || required === 'false') {
                this.required = false;
            }
        },
    }
}
/**
 * Created by dingrf on 2016/4/6.
 */

u.ValidateMixin = {
    init: function(){
        this.placement = this.getOption('placement');
        this.tipId = this.getOption('tipId');
        this.errorMsg = this.getOption('errorMsg');
        this.nullMsg = this.getOption('nullMsg');
        this.regExp = this.getOption('regExp');
        this.successId=this.getOption('successId');
        this.hasSuccess=this.getOption('hasSuccess');
        this.notipFlag=this.getOption('notipFlag');

        // if (this.validType) {
            this.validate = new u.Validate({
                el: this.element,
                single: true,
                validMode: 'manually',
                required: this.required,
                validType: this.validType,
                placement: this.placement,
                tipId: this.tipId,
                successId:this.successId,
                notipFlag:this.notipFlag,
                hasSuccess:this.hasSuccess,
                errorMsg: this.errorMsg,
                nullMsg: this.nullMsg,
                maxLength: this.maxLength,
                minLength: this.minLength,
                max: this.max,
                min: this.min,
                maxNotEq: this.maxNotEq,
                minNotEq: this.minNotEq,
                reg: this.regExp
            });
        // };

    },
    methods:{
        /**
         *校验
         */
        doValidate: function (options) {
            if (this.validate) {
                if (options && options['trueValue'] === true) {
                    options['showMsg'] = options['showMsg'] || false;
                    var result = this.validate.check({pValue: this.getValue(), showMsg: options['showMsg']});
                }
                else{
                    var result = this.validate.check();
                }
                result.comp = this;
                return result;
            } else {
                return {passed:true,comp:this}
            }
        },
        /**
         * 是否需要清除数据
         */
        _needClean: function () {
            if (this.validate)
                return this.validate._needClean();
            else return false
        }
    }
}
/**
 * Created by dingrf on 2016/4/6.
 */


u.ValueMixin = {
    init: function(){
        var self = this;
        this.dataModel.ref(this.field).subscribe(function(value) {
            self.modelValueChange(value)
        });
        this.modelValueChange(this.dataModel.getValue(this.field));

    },
    methods:{
        /**
         * 模型数据改变
         * @param {Object} value
         */
        modelValueChange: function (value) {
            if (this.slice) return;
            if (value === null || typeof value == "undefined")
                value = "";
            this.trueValue = this.formater ? this.formater.format(value) : value;
            //this.element.trueValue = this.trueValue;
            this.showValue = this.masker ? this.masker.format(this.trueValue).value : this.trueValue;
            this.setShowValue(this.showValue);

            //this.trueValue = value;
            //this.showValue = value;
            //this.setShowValue(this.showValue);
        },

        ///**
        // * 设置模型值
        // * @param {Object} value
        // */
        //setModelValue: function (value) {
        //    if (!this.dataModel) return;
        //    this.dataModel.setValue(this.field, value)
        //},
        /**
         * 设置控件值
         * @param {Object} value
         */
        setValue: function (value) {
            this.trueValue = this.formater ? this.formater.format(value) : value;
            this.showValue = this.masker ? this.masker.format(this.trueValue).value : this.trueValue;
            this.setShowValue(this.showValue);
            this.slice = true;
            this.dataModel.setValue(this.field, this.trueValue);
            this.slice = false;
        },
        /**
         * 取控件的值
         */
        getValue: function () {
            return this.trueValue;
        },
        setShowValue: function (showValue) {
            this.showValue = showValue;
            this.element.value = showValue;
            this.element.title = showValue;

        },
        getShowValue: function () {
            return this.showValue
        },
        setModelValue: function (value) {
            if (!this.dataModel) return
            this.dataModel.setValue(this.field, value)
        },
    }
}
/**
 * Created by dingrf on 2016/1/15.
 */

/**
 * adapter基类
 */

u.BaseAdapter = u.Class.create({
    /**
     *
     * @param comp
     * @param options ：
     *      el: '#content',  对应的dom元素
     *      options: {},     配置
     *      model:{}        模型，包括数据和事件
     */
    initialize: function (options) {
        //组合mixin中的方法
        for(var i in this.mixins){
            var mixin = this.mixins[i];
            for (var key in mixin['methods']){
                if (!this[key]){
                    this[key] = mixin['methods'][key];
                }
            }
        }

        //this.comp = comp;
        this.element = options['el'];
        this.options = options['options'];
        this.viewModel = options['model'];
        this.dataModel = null;
        this.mixins = this.mixins || [];
        this.parseDataModel();
        this.init();
        //执行mixin中的初始化方法
        for(var i in this.mixins){
            var mixin = this.mixins[i];
            if (mixin['init'])
                mixin.init.call(this);
        }

    },
    parseDataModel: function () {
        if (!this.options || !this.options["data"]) return;
        this.field = this.options["field"];
        var dtId = this.options["data"];
        this.dataModel = u.getJSObject(this.viewModel, this.options["data"]);
        if (this.dataModel){
            var opt = {};
            if (this.options.type === 'u-date'){
                opt.type = 'date'
            }
            if (this.field)
                this.dataModel.createField(this.field, opt);
        }
    },
    getOption: function(key){
        return this.dataModel.getRowMeta(this.field, key) || this.options[key];
    },
    init: function(){

    }
});
var BaseComponent = u.Class.create({
    initialize: function (element) {
        if (u.isDomElement(element)){
            this.element = element;
            this.options = {};
        }else{
            this.element = element['el'];
            this.options = element;
        }
        this.element = typeof this.element === 'string' ? document.querySelector(this.element) : this.element;

        this.compType = this.compType || this.constructor.compType;
        this.element[this.compType] = this;
        this.element['init'] = true;
        this.init();
    },
    /**
     * 绑定事件
     * @param {String} name
     * @param {Function} callback
     */
    on: function (name, callback) {
        name = name.toLowerCase()
        this._events || (this._events = {})
        var events = this._events[name] || (this._events[name] = [])
        events.push({
            callback: callback
        })
        return this;
    },
    /**
     * 触发事件
     * @param {String} name
     */
    trigger: function (name) {
        name = name.toLowerCase()
        if (!this._events || !this._events[name]) return this;
        var args = Array.prototype.slice.call(arguments, 1);
        var events = this._events[name];
        for (var i = 0, count = events.length; i < count; i++) {
            events[i].callback.apply(this, args);
        }
        return this;

    },
    /**
     * 初始化
     */
    init: function(){},
    /**
     * 渲染控件
     */
    render: function(){},
    /**
     * 销毁控件
     */
    destroy: function(){
        delete this.element['comp'];
        this.element.innerHTML = '';
    },
    /**
     * 增加dom事件
     * @param {String} name
     * @param {Function} callback
     */
    addDomEvent: function (name, callback) {
        u.on(this.element, name, callback)
        return this
    },
    /**
     * 移除dom事件
     * @param {String} name
     */
    removeDomEvent: function (name, callback) {
        u.off(this.element,name,callback);
        return this
    },
    setEnable: function (enable) {
        return this
    },
    /**
     * 判断是否为DOM事件
     */
    isDomEvent: function (eventName) {
        if (this.element['on' + eventName] === undefined)
            return false
        else
            return true
    },
    createDateAdapter: function(options){
        var opt = options['options'],
            model = options['model'];
        var Adapter = u.compMgr.getDataAdapter(this.compType, opt['dataType']);
        if (Adapter){
            this.dataAdapter = new Adapter(this, options);
        }
    },
    Statics: {
        compName: '',
        EVENT_VALUE_CHANGE: 'valueChange',
        getName: function () {
            return this.compName
        }
    }
})

function adjustDataType(options){
    var types = ['integer', 'float', 'currency', 'percent', 'string', 'textarea'];
    var _type = options['type'],
        _dataType = options['dataType'];
    if (types.indexOf(_type) != -1){
        options['dataType'] = _type;
        options['type'] = 'originText';
    }
}


u.BaseComponent = BaseComponent

/**
 * Created by dingrf on 2016/3/4.
 */

/**
 * 加载控件
 */

if (document.readyState && document.readyState === 'complete'){
    u.compMgr.updateComp();
}else{
    u.on(window, 'load', function() {

        //扫描并生成控件
        u.compMgr.updateComp();
    });
}
u.Text = u.BaseComponent.extend({
    _Constant: {
        NO_MAX_ROWS: -1,
        MAX_ROWS_ATTRIBUTE: 'maxrows'
    },

    _CssClasses: {
        LABEL: 'u-label',
        INPUT: 'u-input',
        IS_DIRTY: 'is-dirty',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_INVALID: 'is-invalid',
        IS_UPGRADED: 'is-upgraded'
    },

    init: function () {
        var oThis = this;
        this.maxRows = this._Constant.NO_MAX_ROWS;
        this.label_ = this.element.querySelector('.' + this._CssClasses.LABEL);
        this._input = this.element.querySelector('input');

        if (this._input) {
            if (this._input.hasAttribute(
                    /** @type {string} */ (this._Constant.MAX_ROWS_ATTRIBUTE))) {
                this.maxRows = parseInt(this._input.getAttribute(
                    /** @type {string} */ (this._Constant.MAX_ROWS_ATTRIBUTE)), 10);
                if (isNaN(this.maxRows)) {
                    this.maxRows = this._Constant.NO_MAX_ROWS;
                }
            }

            this.boundUpdateClassesHandler = this._updateClasses.bind(this);
            this.boundFocusHandler = this._focus.bind(this);
            this.boundBlurHandler = this._blur.bind(this);
            this.boundResetHandler = this._reset.bind(this);
            this._input.addEventListener('input', this.boundUpdateClassesHandler);
            if(u.isIE8){
                this._input.addEventListener('propertychange', function(){
                    oThis._updateClasses();
                });
            }
            this._input.addEventListener('focus', this.boundFocusHandler);
            if(u.isIE8 || u.isIE9){
                if(this.label_){
                    this.label_.addEventListener('click', function(){
                        this._input.focus();
                    }.bind(this));
                }
            }
            
            this._input.addEventListener('blur', this.boundBlurHandler);
            this._input.addEventListener('reset', this.boundResetHandler);

            if (this.maxRows !== this._Constant.NO_MAX_ROWS) {
                // TODO: This should handle pasting multi line text.
                // Currently doesn't.
                this.boundKeyDownHandler = this._down.bind(this);
                this._input.addEventListener('keydown', this.boundKeyDownHandler);
            }
            var invalid = u.hasClass(this.element, this._CssClasses.IS_INVALID);
            this._updateClasses();
            u.addClass(this.element, this._CssClasses.IS_UPGRADED);
            if (invalid) {
                u.addClass(this.element, this._CssClasses.IS_INVALID);
            }
        }
    },

    /**
     * Handle input being entered.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _down: function (event) {
        var currentRowCount = event.target.value.split('\n').length;
        if (event.keyCode === 13) {
            if (currentRowCount >= this.maxRows) {
                event.preventDefault();
            }
        }
    },
    /**
     * Handle focus.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _focus : function (event) {
        u.addClass(this.element, this._CssClasses.IS_FOCUSED);
    },
    /**
     * Handle lost focus.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _blur : function (event) {
        u.removeClass(this.element, this._CssClasses.IS_FOCUSED);
    },
    /**
     * Handle reset event from out side.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _reset : function (event) {
        this._updateClasses();
    },
    /**
     * Handle class updates.
     *
     * @private
     */
    _updateClasses : function () {
        this.checkDisabled();
        this.checkValidity();
        this.checkDirty();
    },

// Public methods.

    /**
     * Check the disabled state and update field accordingly.
     *
     * @public
     */
    checkDisabled : function () {
        if (this._input.disabled) {
            u.addClass(this.element, this._CssClasses.IS_DISABLED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DISABLED);
        }
    },
    /**
     * Check the validity state and update field accordingly.
     *
     * @public
     */
    checkValidity : function () {
        if (this._input.validity) {
            if (this._input.validity.valid) {
                u.removeClass(this.element, this._CssClasses.IS_INVALID);
            } else {
                u.addClass(this.element, this._CssClasses.IS_INVALID);
            }
        }
    },
    /**
     * Check the dirty state and update field accordingly.
     *
     * @public
     */
    checkDirty: function () {
        if (this._input.value && this._input.value.length > 0) {
            u.addClass(this.element, this._CssClasses.IS_DIRTY);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DIRTY);
        }
    },
    /**
     * Disable text field.
     *
     * @public
     */
    disable: function () {
        this._input.disabled = true;
        this._updateClasses();
    },
    /**
     * Enable text field.
     *
     * @public
     */
    enable: function () {
        this._input.disabled = false;
        this._updateClasses();
    },
    /**
     * Update text field value.
     *
     * @param {string} value The value to which to set the control (optional).
     * @public
     */
    change: function (value) {
        this._input.value = value || '';
        this._updateClasses();
    }


});



//if (u.compMgr)
//    u.compMgr.addPlug({
//        name:'text',
//        plug: u.Text
//    })

u.compMgr.regComp({
    comp: u.Text,
    compAsString: 'u.Text',
    css: 'u-text'
});

u.FloatAdapter = u.BaseAdapter.extend({
    mixins:[u.ValueMixin,u.EnableMixin, u.RequiredMixin, u.ValidateMixin],
    init: function () {
        var self = this;
        this.element = this.element.nodeName === 'INPUT' ? this.element : this.element.querySelector('input');
        if (!this.element){
            throw new Error('not found INPUT element, u-meta:' + JSON.stringify(this.options));
        };
        this.maskerMeta = u.core.getMaskerMeta('float') || {};
        this.validType = 'float';
        this.maskerMeta.precision = this.getOption('precision') || this.maskerMeta.precision;
        this.max = this.getOption('max') || "10000000000000000000";
        this.min = this.getOption('min') || "-10000000000000000000";
        this.maxNotEq = this.getOption('maxNotEq');
        this.minNotEq = this.getOption('minNotEq');

        //处理数据精度
        this.dataModel.refRowMeta(this.field, "precision").subscribe(function(precision){
            if(precision === undefined) return;
            self.setPrecision(precision)
        });
        this.formater = new u.NumberFormater(this.maskerMeta.precision);
        this.masker = new u.NumberMasker(this.maskerMeta);
        u.on(this.element, 'focus', function(){
            if(self.enable){
                self.onFocusin()
            }
        })

        u.on(this.element, 'blur',function(){
            if(self.enable){
                if (!self.doValidate() && self._needClean()) {
                    if (self.required && (self.element.value === null || self.element.value === undefined || self.element.value === '')) {
                        // 因必输项清空导致检验没通过的情况
                        self.setValue('')
                    } else {
                        self.element.value = self.getShowValue()
                    }
                }
                else
                    self.setValue(self.element.value)
            }
        });


    },
    /**
     * 修改精度
     * @param {Integer} precision
     */
    setPrecision: function (precision) {
        if (this.maskerMeta.precision == precision) return;
        this.maskerMeta.precision = precision
        this.formater = new u.NumberFormater(this.maskerMeta.precision);
        this.masker = new u.NumberMasker(this.maskerMeta);
        var currentRow = this.dataModel.getCurrentRow();
        if (currentRow) {
            var v = this.dataModel.getCurrentRow().getValue(this.field)
            this.showValue = this.masker.format(this.formater.format(v)).value
        } else {
            this.showValue = this.masker.format(this.formater.format(this.trueValue)).value
        }

        this.setShowValue(this.showValue)
    },
    onFocusin: function () {
        var v = this.dataModel.getCurrentRow().getValue(this.field), vstr = v + '', focusValue = v;
        if (u.isNumber(v) && u.isNumber(this.maskerMeta.precision)) {
            if (vstr.indexOf('.') >= 0) {
                var sub = vstr.substr(vstr.indexOf('.') + 1);
                if (sub.length < this.maskerMeta.precision || parseInt(sub.substr(this.maskerMeta.precision)) == 0) {
                    focusValue = this.formater.format(v)
                }
            } else if (this.maskerMeta.precision > 0) {
                focusValue = this.formater.format(v)
            }
        }
        focusValue = parseFloat(focusValue) || '';
        this.setShowValue(focusValue)
    },
    _needClean: function () {
        return true
    }
});

u.compMgr.addDataAdapter({
        adapter: u.FloatAdapter,
        name: 'float'
    });
/**
 * 货币控件
 */
u.CurrencyAdapter = u.FloatAdapter.extend({
    init: function () {
        var self = this;
        u.CurrencyAdapter.superclass.init.apply(this);

        this.maskerMeta = iweb.Core.getMaskerMeta('currency') || {};
        this.maskerMeta.precision = this.getOption('precision') || this.maskerMeta.precision;
        this.maskerMeta.curSymbol = this.getOption('curSymbol') || this.maskerMeta.curSymbol;
        this.validType = 'float';
        this.dataModel.on(this.field + '.curSymbol.' + u.DataTable.ON_CURRENT_META_CHANGE, function (event) {
            self.setCurSymbol(event.newValue)
        });
        this.formater = new u.NumberFormater(this.maskerMeta.precision);
        this.masker = new CurrencyMasker(this.maskerMeta);
    },
    /**
     * 修改精度
     * @param {Integer} precision
     */
    setPrecision: function (precision) {
        if (this.maskerMeta.precision == precision) return
        this.maskerMeta.precision = precision
        this.formater = new u.NumberFormater(this.maskerMeta.precision);
        this.masker = new u.CurrencyMasker(this.maskerMeta);
        var currentRow = this.dataModel.getCurrentRow();
        if (currentRow) {
            var v = this.dataModel.getCurrentRow().getValue(this.field)
            this.showValue = this.masker.format(this.formater.format(v)).value
        } else {
            this.showValue = this.masker.format(this.formater.format(this.trueValue)).value
        }
        this.setShowValue(this.showValue)
    },
    /**
     * 修改币符
     * @param {String} curSymbol
     */
    setCurSymbol: function (curSymbol) {
        if (this.maskerMeta.curSymbol == curSymbol) return
        this.maskerMeta.curSymbol = curSymbol
        this.masker.formatMeta.curSymbol = this.maskerMeta.curSymbol
        this.element.trueValue = this.trueValue
        this.showValue = this.masker.format(this.trueValue).value
        this.setShowValue(this.showValue)

    },
    onFocusin: function (e) {
        var v = this.getValue(), vstr = v + '', focusValue = v
        if (u.isNumber(v) && u.isNumber(this.maskerMeta.precision)) {
            if (vstr.indexOf('.') >= 0) {
                var sub = vstr.substr(vstr.indexOf('.') + 1)
                if (sub.length < this.maskerMeta.precision || parseInt(sub.substr(this.maskerMeta.precision)) == 0) {
                    focusValue = this.formater.format(v)
                }
            } else if (this.maskerMeta.precision > 0) {
                focusValue = this.formater.format(v)
            }
        }
        this.setShowValue(focusValue)

    }
})

u.compMgr.addDataAdapter({
        adapter: u.CurrencyAdapter,
        name: 'currency'
    });


u.IntegerAdapter = u.BaseAdapter.extend({
    mixins:[u.ValueMixin,u.EnableMixin, u.RequiredMixin, u.ValidateMixin],
    init: function () {
        var self = this;
        this.element = this.element.nodeName === 'INPUT' ? this.element : this.element.querySelector('input');
        if (!this.element){
            throw new Error('not found INPUT element, u-meta:' + JSON.stringify(this.options));
        };
        this.validType = this.options['validType'] || 'integer';
        this.max = this.options['max'];
        this.min = this.options['min'];
        this.maxNotEq = this.options['maxNotEq'];
        this.minNotEq = this.options['minNotEq'];
        this.maxLength = this.options['maxLength'] ? options['maxLength'] : 25;
        this.minLength = this.options['mixLength'] ? options['mixLength'] : 0;
        if (this.dataModel) {
            this.min = this.dataModel.getMeta(this.field, "min") !== undefined ? this.dataModel.getMeta(this.field, "min") : this.min;
            this.max = this.dataModel.getMeta(this.field, "max") !== undefined ? this.dataModel.getMeta(this.field, "max") : this.max;
            this.minNotEq = this.dataModel.getMeta(this.field, "minNotEq") !== undefined ? this.dataModel.getMeta(this.field, "minNotEq") : this.minNotEq;
            this.maxNotEq = this.dataModel.getMeta(this.field, "maxNotEq") !== undefined ? this.dataModel.getMeta(this.field, "maxNotEq") : this.maxNotEq;
            this.minLength = u.isNumber(this.dataModel.getMeta(this.field, "minLength")) ? this.dataModel.getMeta(this.field, "minLength") : this.minLength;
            this.maxLength = u.isNumber(this.dataModel.getMeta(this.field, "maxLength")) ? this.dataModel.getMeta(this.field, "maxLength") : this.maxLength;
        }
        u.on(this.element, 'focus', function(){
            if(self.enable){
                self.setShowValue(self.getValue())
            }
        })

        u.on(this.element, 'blur',function(){
            if(self.enable){
                if (!self.doValidate() && self._needClean()) {
                    if (self.required && (self.element.value === null || self.element.value === undefined || self.element.value === '')) {
                        // 因必输项清空导致检验没通过的情况
                        self.setValue('')
                    } else {
                        self.element.value = self.getShowValue()
                    }
                }
                else
                    self.setValue(self.element.value)
            }
        });
    }
});
u.compMgr.addDataAdapter({
        adapter: u.IntegerAdapter,
        name: 'integer'
    });


/**
 * 百分比控件
 */
u.PercentAdapter = u.FloatAdapter.extend({
    init: function () {
        u.PercentAdapter.superclass.init.apply(this);
        this.validType = 'float';
        this.maskerMeta = iweb.Core.getMaskerMeta('percent') || {};
        this.maskerMeta.precision = this.getOption('precision') || this.maskerMeta.precision;
        if (this.maskerMeta.precision){
            this.maskerMeta.precision = parseInt(this.maskerMeta.precision) + 2;
        }
        this.formater = new u.NumberFormater(this.maskerMeta.precision);
        this.masker = new PercentMasker(this.maskerMeta);
    }
});
u.compMgr.addDataAdapter(
    {
        adapter: u.PercentAdapter,
        name: 'percent'
    });



u.StringAdapter = u.BaseAdapter.extend({
    mixins:[u.ValueMixin,u.EnableMixin, u.RequiredMixin, u.ValidateMixin],
    init: function(){
        var self = this;
        this.element = this.element.nodeName === 'INPUT' ? this.element : this.element.querySelector('input');
        if (!this.element){
            throw new Error('not found INPUT element, u-meta:' + JSON.stringify(this.options));
        };
        this.validType = this.options['validType'] || 'string';
        this.minLength = this.getOption('minLength');
        this.maxLength = this.getOption('maxLength');

        u.on(this.element, 'focus', function(){
            if(self.enable){
                self.setShowValue(self.getValue())
            }
        })

        u.on(this.element, 'blur',function(e){
            if(self.enable){
                if (!self.doValidate() && self._needClean()) {
                    if (self.required && (self.element.value === null || self.element.value === undefined || self.element.value === '')) {
                        // 因必输项清空导致检验没通过的情况
                        self.setValue('')
                    } else {
                        self.element.value = self.getShowValue()
                    }
                }
                else
                    self.setValue(self.element.value)
            }
        });
    }
});
u.compMgr.addDataAdapter({
        adapter: u.StringAdapter,
        name: 'string'
    });

	

u.TextAreaAdapter = u.BaseAdapter.extend({
    mixins:[u.ValueMixin,u.EnableMixin, u.RequiredMixin, u.ValidateMixin],
    init: function () {
        var self = this;
        this.element = this.element.nodeName === 'TEXTAREA' ? this.element : this.element.querySelector('textarea');
        if (!this.element){
            throw new Error('not found TEXTAREA element, u-meta:' + JSON.stringify(this.options));
        };

        u.on(this.element, 'focus', function () {
            self.setShowValue(self.getValue())
        });
        u.on(this.element, 'blur', function () {
            self.setValue(self.element.value)
        })
    }
});

u.compMgr.addDataAdapter({
        adapter: u.TextAreaAdapter,
        name: 'textarea'
    })

/**
 * Created by dingrf on 2016/1/25.
 */

u.TextFieldAdapter = u.BaseAdapter.extend({
    /**
     *
     * @param comp
     * @param options ：
     *      el: '#content',  对应的dom元素
     *      options: {},     配置
     *      model:{}        模型，包括数据和事件
     */
    initialize: function (options) {
        u.TextFieldAdapter.superclass.initialize.apply(this, arguments);
        //this.comp = comp;
        //this.element = options['el'];
        //this.options = options['options'];
        //this.viewModel = options['model'];
        var dataType = this.dataModel.getMeta(this.field,'type') || 'string';
        //var dataType = this.options['dataType'] || 'string';

        this.comp = new u.Text(this.element);
        this.element['u.Text'] = this.comp;


        if (dataType === 'float'){
            this.trueAdpt = new u.FloatAdapter(options);
        }
        else if (dataType === 'string'){
            this.trueAdpt = new u.StringAdapter(options);
        }
        else if (dataType === 'integer'){
            this.trueAdpt = new u.IntegerAdapter(options);
        }else{
            throw new Error("'u-text' only support 'float' or 'string' or 'integer' field type, not support type: '" + dataType + "', field: '" +this.field+ "'");
        }
        u.extend(this, this.trueAdpt);


        this.trueAdpt.comp = this.comp;
        this.trueAdpt.setShowValue = function (showValue) {
            this.showValue = showValue;
            //if (this.comp.compType === 'text')
            this.comp.change(showValue);
            this.element.title = showValue;
        }
        return this.trueAdpt;
    }
});

u.compMgr.addDataAdapter(
    {
        adapter: u.TextFieldAdapter,
        name: 'u-text'
        //dataType: 'float'
    })
/**
 * Created by dingrf on 2015-11-20.
 */

u.Combo = u.BaseComponent.extend({
    init: function () {
        this.mutilSelect = this.options['mutilSelect'] || false;
        if (u.hasClass(this.element, 'mutil-select')){
            this.mutilSelect = true
        }

        this.onlySelect = this.options['onlySelect'] || false;
        if(this.mutilSelect)
            this.onlySelect = true;

        this.comboDatas = [];
        var i, option, datas = [], self = this;
        //u.addClass(this.element, 'u-text')
        new u.Text(this.element);
        var options = this.element.getElementsByTagName('option');
        for (i = 0; i < options.length; i++) {
            option = options[i];
            datas.push({value: option.value, name: option.text});
        }

        this.setComboData(datas);
        this._input = this.element.querySelector("input");
        if(this.onlySelect){
            setTimeout(function(){
                self._input.setAttribute('readonly','readonly');
            },1000);
            
        }else{
            u.on(this._input, 'blur', function(e){
                var v = this.value;
                /*校验数值是否存在于datasource的name中*/
                for(var i = 0; i< self.comboDatas.length;i++){
                    if(v == self.comboDatas[i].name){
                        v = self.comboDatas[i].value;
                        break;
                    }
                    
                }
                self.setValue(v);
            })
        }
        this._combo_name_par=this.element.querySelector(".u-combo-name-par");
        u.on(this._input, 'focus', function (e) {
            self._inputFocus = true;
            self.show(e);
            u.stopEvent(e);
        })
        u.on(this._input, 'blur', function(e){
            self._inputFocus = false;
        })
        this.iconBtn = this.element.querySelector("[data-role='combo-button']");
        if (this.iconBtn){
            u.on(this.iconBtn, 'click', function(e){
                self.show(e);
                u.stopEvent(e);
            })
        }
    },

    show: function (evt) {
        var self = this,width=this.element.offsetWidth;
        u.showPanelByEle({
            ele:this._input,
            panel:this._ul,
            position:"bottomLeft"
        });
        u.on(document.body,'scroll',function(){
            u.showPanelByEle({
                ele:self._input,
                panel:self._ul,
                position:"bottomLeft"
            });
        })    
	    this._ul.style.width = width + 'px';
        u.addClass(this._ul, 'is-animating');
        this._ul.style.zIndex = u.getZIndex();
        u.addClass(this._ul, 'is-visible');

        var callback = function (e) {
            if(e === evt || e.target === this._input || self._inputFocus == true) return;
            if(this.mutilSelect && (u.closest(e.target,'u-combo-ul') === self._ul || u.closest(e.target, 'u-combo-name-par') || u.closest(e.target, 'u-combo-name')) ) return;
            u.off(document,'click',callback);
            // document.removeEventListener('click', callback);
            this.hide();
        }.bind(this);
        u.on(document,'click',callback);
        // document.addEventListener('click', callback);

    },

    hide: function () {
        u.removeClass(this._ul, 'is-visible');
        this._ul.style.zIndex = -1;
        this.trigger('select', {value: this.value});
    },

    /**
     * 设置下拉数据
     * @param datas  数据项
     * @param options  指定name value对应字段 可以为空
     */
    setComboData: function (datas, options) {
        var i, li, self = this;
        if (!options)
            this.comboDatas = datas;
        else{
            this.comboDatas = []
            for(var i = 0; i< datas.length; i++){
                this.comboDatas.push({name:datas[i][options.name],value:datas[i][options.value]});
            }
        }
        if (!this._ul) {
            this._ul = u.makeDOM('<ul class="u-combo-ul"></ul>');
            // this.element.parentNode.appendChild(this._ul);
            document.body.appendChild(this._ul);
        }
        this._ul.innerHTML = '';
        //TODO 增加filter
        for (i = 0; i < this.comboDatas.length; i++) {
            li = u.makeDOM('<li class="u-combo-li">' + this.comboDatas[i].name + '</li>');//document.createElement('li');
            li._index = i;
            u.on(li, 'click', function () {
                self.selectItem(this._index);
            })
            var rippleContainer = document.createElement('span');
            u.addClass(rippleContainer, 'u-ripple');
            li.appendChild(rippleContainer);
            new URipple(li)
            this._ul.appendChild(li);
        }
    },

    selectItem: function (index) {
        var self = this;
        
        if (this.mutilSelect){
            var val = this.comboDatas[index].value;
            var name = this.comboDatas[index].name;
            var index = (this.value + ',').indexOf(val + ',');
            var l = val.length + 1;
            var flag;
            if (index != -1){ // 已经选中
                this.value = this.value.substring(0,index) + this.value.substring(index + l)  
                flag = '-' 
            }else{
                this.value = (!this.value) ? val + ',' : this.value + val + ',';
                flag = '+'
            }
            
            if(flag == '+'){
                var nameDiv= u.makeDOM('<div class="u-combo-name" key="' + val + '">'+ name + /*<a href="javascript:void(0)" class="remove">x</a>*/'</div>');
                var parNameDiv=u.makeDOM('<div class="u-combo-name-par" style="position:absolute"></div>');
                /*var _a = nameDiv.querySelector('a');
                u.on(_a, 'click', function(){
                    var values = self.value.split(',');
                    values.splice(values.indexOf(val),1);
                    self.value = values.join(',');
                    self._combo_name_par.removeChild(nameDiv);
                    self._updateItemSelect();
                    self.trigger('select', {value: self.value, name: name});
                });*/
                if(!this._combo_name_par){
                    this._input.parentNode.insertBefore(parNameDiv, this._input);
                    this._combo_name_par=parNameDiv;
                }
                this._combo_name_par.appendChild(nameDiv);
            }else{
                if(this._combo_name_par){
                    var comboDiv = this._combo_name_par.querySelector('[key="'+val+'"]');
                    if(comboDiv)
                        comboDiv.remove();
                }
            }
            

            this._updateItemSelect();

            // this.trigger('select', {value: this.value, name: name});
        }else{
            this.value = this.comboDatas[index].value;
            this._input.value = this.comboDatas[index].name;
            this._updateItemSelect();
            // this.trigger('select', {value: this.value, name: this._input.value});
        }

        
    },

    _updateItemSelect: function() {
        var lis = this._ul.querySelectorAll('.u-combo-li')
        if (this.mutilSelect){
            var values = this.value.split(',');
            for(var i=0;i<lis.length;i++) {
                if(values.indexOf(this.comboDatas[i].value) > -1) {
                    u.addClass(lis[i], 'is-selected');
                } else {
                    u.removeClass(lis[i], 'is-selected');
                }
            }
            /*根据多选区域div的高度调整input的高度*/
            var h = this._combo_name_par.offsetHeight;
            if(h < 25)
                h = 25
            this._input.style.height = h + 'px';
        } else {
            for(var i=0;i<lis.length;i++) {
                if(this.value == this.comboDatas[i].value) {
                    u.addClass(lis[i], 'is-selected');
                } else {
                    u.removeClass(lis[i], 'is-selected');
                }
            }

        }
    },

    /**
     *设置值
     * @param value
     */
    setValue: function(value){
        var self = this;
        value = value + '';
    	value = value || '';
    	
        var values = value.split(',');
        if (this.mutilSelect === true) {
            if(self._combo_name_par)
                self._combo_name_par.innerHTML = '';
            this.value = '';
        }
        if(!value) {
            this._input.value = '';
            this.value = '';
        }
        this.comboDatas.forEach(function(item, index){
            if (this.mutilSelect === true){
                if (values.indexOf(item.value) != -1){
                    this.selectItem(index)
                }
            }else {
                if (item.value === value) {
                    this.selectItem(index);
                    return;
                }
            }
        }.bind(this));
        if(!this.onlySelect){
            this.value = value;
            this.trigger('select', {value: this.value, name: this._input.value});
        }
    },

    /**
     * 设置显示名
     * @param name
     */
    setName: function(name){
        this.comboDatas.forEach(function(item, index){
            if(item.name === name){
                this.selectItem(index);
                return;
            }
        }.bind(this));
    }

});

u.compMgr.regComp({
    comp: u.Combo,
    compAsString: 'u.Combo',
    css: 'u-combo'
})
u.ComboboxAdapter = u.BaseAdapter.extend({
    mixins:[u.ValueMixin,u.EnableMixin, u.RequiredMixin, u.ValidateMixin],
    init: function () {
        var self = this;
        //u.ComboboxAdapter.superclass.initialize.apply(this, arguments);
        this.datasource = u.getJSObject(this.viewModel, this.options['datasource']);
        this.mutil = this.options.mutil || false;
        this.onlySelect = this.options.onlySelect || false;
        this.validType = 'combobox';
        this.comp = new u.Combo({el:this.element,mutilSelect:this.mutil,onlySelect:this.onlySelect});
        this.element['u.Combo'] = this.comp;
        if (this.datasource){
            this.comp.setComboData(this.datasource);
        }else{
            if(u.isIE8 || u.isIE9)
                alert("IE8/IE9必须设置datasource");
        }
        ////TODO 后续支持多选
        //if (this.mutil) {
        //    //$(this.comboEle).on("mutilSelect", function (event, value) {
        //    //    self.setValue(value)
        //    //})
        //}
        this.comp.on('select', function(event){
            // self.slice = true;
            // if(self.dataModel)
            //     self.dataModel.setValue(self.field, event.value);
            // self.slice = false;
            self.setValue(event.value);
        });
        //if(this.dataModel){
        //    this.dataModel.ref(this.field).subscribe(function(value) {
        //        self.modelValueChange(value)
        //    })
        //}
    },
    modelValueChange: function (value) {
        if (this.slice) return;
        //this.trueValue = value;
        if (value === null || typeof value == "undefined")
            value = "";
        this.comp.setValue(value);
        this.trueValue = this.formater ? this.formater.format(value) : value;
        //this.element.trueValue = this.trueValue;
        this.showValue = this.masker ? this.masker.format(this.trueValue).value : this.trueValue;
        this.setShowValue(this.showValue);
    },
    //setValue: function (value) {
    //    this.trueValue = value;
    //    this.slice = true;
    //    this.setModelValue(this.trueValue);
    //    this.slice = false;
    //},
    //getValue: function () {
    //    return this.trueValue
    //},
    setEnable: function (enable) {
        var self = this;
        if (enable === true || enable === 'true') {
            this.enable = true;
            this.element.removeAttribute('readonly');
            this.comp._input.removeAttribute('readonly');
            u.removeClass(this.element.parentNode,'disablecover');
            u.on(this.comp._input, 'focus', function (e) {
                self.comp.show(e);
                u.stopEvent(e);
            })
            if (this.comp.iconBtn){
                u.on(this.comp.iconBtn, 'click', function(e){
                    self.comp.show(e);
                    u.stopEvent(e);
                })
            }
        } else if (enable === false || enable === 'false') {
            this.enable = false;
            this.element.setAttribute('readonly', 'readonly');
            this.comp._input.setAttribute('readonly', 'readonly');
            u.addClass(this.element.parentNode,'disablecover');
            u.off(this.comp._input, 'focus')
            if (this.comp.iconBtn){
                u.off(this.comp.iconBtn, 'click')
            }
        }
    }
});

u.compMgr.addDataAdapter(
    {
        adapter: u.ComboboxAdapter,
        name: 'u-combobox'
    });






u.Button = u.BaseComponent.extend({
    init:function(){
        var rippleContainer = document.createElement('span');
        u.addClass(rippleContainer, 'u-button-container');
        this._rippleElement = document.createElement('span');
        u.addClass(this._rippleElement, 'u-ripple');
        if (u.isIE8)
            u.addClass(this._rippleElement, 'oldIE');
        rippleContainer.appendChild(this._rippleElement);
        u.on(this._rippleElement, 'mouseup', this.element.blur);
        this.element.appendChild(rippleContainer);

        u.on(this.element, 'mouseup', this.element.blur);
        u.on(this.element, 'mouseleave', this.element.blur);
        this.ripple = new u.Ripple(this.element)
    }

});


u.compMgr.regComp({
    comp: u.Button,
    compAsString: 'u.Button',
    css: 'u-button'
})

u.Tooltip = function(element,options){
	this.init(element,options)
	//this.show()
}


u.Tooltip.prototype = {
    defaults:{
        animation: true,
        placement: 'top',
        //selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="left: 50%;"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
            selector: 'body',
            padding: 0
        }
    },
    init: function (element,options) {
		this.element = element
        this.options = u.extend({}, this.defaults, options);
        this._viewport = this.options.viewport && document.querySelector(this.options.viewport.selector || this.options.viewport);

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]
            if (trigger == 'click') {
                u.on(this.element, 'click', this.toggle.bind(this));
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
                u.on(this.element, eventIn, this.enter.bind(this));
                u.on(this.element, eventOut, this.leave.bind(this));
            }
        }
        this.options.title = this.options.title || this.element.getAttribute('title');
        this.element.removeAttribute('title');
        if (this.options.delay && typeof this.options.delay == 'number') {
            this.options.delay = {
                show: this.options.delay,
                hide: this.options.delay
            }
        };
        //tip模板对应的dom
        this.tipDom = u.makeDOM(this.options.template);
        this.arrrow = this.tipDom.querySelector('.tooltip-arrow');
        // tip容器,默认为当前元素的parent
        this.container = this.options.container ? document.querySelector(this.options.container) : this.element.parentNode;
    },
    enter: function(){
        var self = this;
        clearTimeout(this.timeout);
        this.hoverState = 'in';
        if (!this.options.delay || !this.options.delay.show) return this.show();

        this.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show()
        }, this.options.delay.show)
    },
    leave: function(){
        var self = this;
        clearTimeout(this.timeout);
        self.hoverState = 'out'
        if (!self.options.delay || !self.options.delay.hide) return self.hide()
        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    },
    show: function(){
        var self = this;
        this.tipDom.querySelector('.tooltip-inner').innerHTML = this.options.title;
        this.tipDom.style.zIndex = u.getZIndex();
        this.container.appendChild(this.tipDom);
        /*var placement = this.options.placement;
        var pos = this.getPosition()
        var actualWidth = this.tipDom.offsetWidth
        var actualHeight = this.tipDom.offsetHeight
        var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

        this.applyPlacement(calculatedOffset, placement)*/
        u.addClass(this.tipDom,'active');
        u.showPanelByEle({
            ele:this.element,
            panel:this.tipDom,
            position:'topCenter'
        });
        u.on(document.body,'scroll',function(){
            u.showPanelByEle({
                ele:self.element,
                panel:self.tipDom,
                position:"bottomLeft"
            });
        })   
    },
    hide: function(){
		if (this.container.contains(this.tipDom)){
			u.removeClass(this.tipDom, 'active');
			this.container.removeChild(this.tipDom);
		}
    },
    applyPlacement: function(offset, placement){
        var width = this.tipDom.offsetWidth
        var height = this.tipDom.offsetHeight

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt(this.tipDom.style.marginTop, 10)
        var marginLeft = parseInt(this.tipDom.style.marginTop, 10)

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop))  marginTop = 0
        if (isNaN(marginLeft)) marginLeft = 0

        offset.top = offset.top + marginTop
        offset.left = offset.left + marginLeft

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        this.tipDom.style.left = offset.left + 'px';
        this.tipDom.style.top = offset.top + 'px';

        u.addClass(this.tipDom,'active');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth = this.tipDom.offsetWidth
        var actualHeight =this.tipDom.offsetHeight

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
        }
        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

        if (delta.left) offset.left += delta.left
        else offset.top += delta.top

        var isVertical = /top|bottom/.test(placement)
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

        //$tip.offset(offset)
        this.tipDom.style.left = offset.left + 'px';
        this.tipDom.style.top = offset.top - 4 + 'px';

       // this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)

    },
    getCalculatedOffset: function(placement, pos, actualWidth, actualHeight){
        return placement == 'bottom' ? {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2} :
            placement == 'top' ? {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2} :
                placement == 'left' ? {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth} :
                    /* placement == 'right' */ {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left + pos.width
                }
    },
    getPosition: function(el){
        el = el || this.element;
        var isBody = el.tagName == 'BODY';
        var elRect = el.getBoundingClientRect()
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = u.extend({}, elRect, {width: elRect.right - elRect.left, height: elRect.bottom - elRect.top})
        }
        var elOffset = isBody ? {top: 0, left: 0} : {top:el.offsetTop, left: el.offsetLeft};
        var scroll = {scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : el.scrollTop}
        var outerDims = isBody ? {width: window.innerWidth || document.body.clientWidth, height: window.innerHeight || document.body.clientHeight} : null
		//return u.extend({}, elRect, scroll, outerDims, elOffset)
        return u.extend({}, elRect, scroll, outerDims)

    },
    getViewportAdjustedDelta: function(placement, pos, actualWidth, actualHeight){
        var delta = {top: 0, left: 0}
        if (!this._viewport) return delta

        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
        var viewportDimensions = this.getPosition(this._viewport)

        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
            if (topEdgeOffset < viewportDimensions.top) { // top overflow
                delta.top = viewportDimensions.top - topEdgeOffset
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth
            if (leftEdgeOffset < viewportDimensions.left) { // left overflow
                delta.left = viewportDimensions.left - leftEdgeOffset
            } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
            }
        }

        return delta
    },
    replaceArrow: function(delta, dimension, isHorizontal){
        if (isHorizontal){
            this.arrow.style.left = 50 * (1 - delta / dimension) + '%';
            this.arrow.style.top = '';
        }else{
            this.arrow.style.top = 50 * (1 - delta / dimension) + '%';
            this.arrow.style.left = '';
        }
    },
    destory: function(){

    },
    setTitle :function(title){
        this.options.title = title;
    }

};

  var URipple = function URipple(element) {
    if (u.isIE8) return;
    this._element = element;

    // Initialize instance.
    this.init();
  };
  //window['URipple'] = URipple;

  URipple.prototype._down = function(event) {
    if (!this._rippleElement.style.width && !this._rippleElement.style.height) {
      var rect = this._element.getBoundingClientRect();
      this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
      this._rippleElement.style.width = this.rippleSize_ + 'px';
      this._rippleElement.style.height = this.rippleSize_ + 'px';
    }

    u.addClass(this._rippleElement, 'is-visible');

    if (event.type === 'mousedown' && this._ignoringMouseDown) {
      this._ignoringMouseDown = false;
    } else {
      if (event.type === 'touchstart') {
        this._ignoringMouseDown = true;
      }
      var frameCount = this.getFrameCount();
      if (frameCount > 0) {
        return;
      }
      this.setFrameCount(1);
      var t = event.currentTarget || event.target || event.srcElement;
      var bound = t.getBoundingClientRect();
      var x;
      var y;
      // Check if we are handling a keyboard click.
      if (event.clientX === 0 && event.clientY === 0) {
        x = Math.round(bound.width / 2);
        y = Math.round(bound.height / 2);
      } else {
        var clientX = event.clientX ? event.clientX : event.touches[0].clientX;
        var clientY = event.clientY ? event.clientY : event.touches[0].clientY;
        x = Math.round(clientX - bound.left);
        y = Math.round(clientY - bound.top);
      }
      this.setRippleXY(x, y);
      this.setRippleStyles(true);
      if(window.requestAnimationFrame)
        window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
  };

  /**
   * Handle mouse / finger up on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
  URipple.prototype._up = function(event) {
    var self = this;
    // Don't fire for the artificial "mouseup" generated by a double-click.
    if (event && event.detail !== 2) {
      u.removeClass(this._rippleElement,'is-visible')
    }
    // Allow a repaint to occur before removing this class, so the animation
    // shows for tap events, which seem to trigger a mouseup too soon after
    // mousedown.
    window.setTimeout(function() {
      u.removeClass(self._rippleElement,'is-visible')
    }, 0);
  };

  /**
   * Initialize element.
   */
  URipple.prototype.init = function() {
    var self = this;
    if (this._element) {
      this._rippleElement = this._element.querySelector('.u-ripple');
      if (!this._rippleElement){
        this._rippleElement = document.createElement('span');
        u.addClass(this._rippleElement,'u-ripple');
        this._element.appendChild(this._rippleElement);
        this._element.style.overflow = 'hidden';
        this._element.style.position = 'relative';
      }
      this.frameCount_ = 0;
      this.rippleSize_ = 0;
      this.x_ = 0;
      this.y_ = 0;

      // Touch start produces a compat mouse down event, which would cause a
      // second ripples. To avoid that, we use this property to ignore the first
      // mouse down after a touch start.
      this._ignoringMouseDown = false;
      u.on(this._element, 'mousedown',function(e){self._down(e);})
      u.on(this._element, 'touchstart',function(e){self._down(e);})

      u.on(this._element, 'mouseup',function(e){self._up(e);})
      u.on(this._element, 'mouseleave',function(e){self._up(e);})
      u.on(this._element, 'touchend',function(e){self._up(e);})
      u.on(this._element, 'blur',function(e){self._up(e);})

      /**
       * Getter for frameCount_.
       * @return {number} the frame count.
       */
      this.getFrameCount = function() {
        return this.frameCount_;
      };

      /**
       * Setter for frameCount_.
       * @param {number} fC the frame count.
       */
      this.setFrameCount = function(fC) {
        this.frameCount_ = fC;
      };

      /**
       * Getter for _rippleElement.
       * @return {Element} the ripple element.
       */
      this.getRippleElement = function() {
        return this._rippleElement;
      };

      /**
       * Sets the ripple X and Y coordinates.
       * @param  {number} newX the new X coordinate
       * @param  {number} newY the new Y coordinate
       */
      this.setRippleXY = function(newX, newY) {
        this.x_ = newX;
        this.y_ = newY;
      };

      /**
       * Sets the ripple styles.
       * @param  {boolean} start whether or not this is the start frame.
       */
      this.setRippleStyles = function(start) {
        if (this._rippleElement !== null) {
          var transformString;
          var scale;
          var size;
          var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';

          if (start) {
            scale = 'scale(0.0001, 0.0001)';
            size = '1px';
          } else {
            scale = '';
            size = this.rippleSize_ + 'px';
          }

          transformString = 'translate(-50%, -50%) ' + offset + scale;

          this._rippleElement.style.webkitTransform = transformString;
          this._rippleElement.style.msTransform = transformString;
          this._rippleElement.style.transform = transformString;

          if (start) {
            u.removeClass(this._rippleElement,'is-animating')
          } else {
            u.addClass(this._rippleElement,'is-animating')
          }
        }
      };

      /**
       * Handles an animation frame.
       */
      this.animFrameHandler = function() {
        if (this.frameCount_-- > 0) {
          window.requestAnimationFrame(this.animFrameHandler.bind(this));
        } else {
          this.setRippleStyles(false);
        }
      };
    }
  };

  u.Ripple = URipple;






	u.Validate = u.BaseComponent.extend({
		
		init : function() {
			var self = this
			this.$element =this.element			
			this.$form = this.form
			this.options = u.extend({}, this.DEFAULTS, this.options);
			this.required = false
			this.timeout = null
			//所有属性优先级 ：  options参数  > attr属性  > 默认值
			this.required = this.options['required']  ? this.options['required']  : false
			this.validType = this.options['validType'] ? this.options['validType'] : null
			//校验模式  blur  submit
			this.validMode = this.options['validMode'] ? this.options['validMode'] : u.Validate.DEFAULTS.validMode
			//空提示
			this.nullMsg = this.options['nullMsg'] ? this.options['nullMsg'] : u.Validate.NULLMSG[this.validType]
			//是否必填
			if (this.required && !this.nullMsg)
				this.nullMsg = u.Validate.NULLMSG['required']
			//错误必填
			this.errorMsg = this.options['errorMsg'] ? this.options['errorMsg'] : u.Validate.ERRORMSG[this.validType]
			//正则校验
			this.regExp = this.options['reg'] ? this.options['reg']: u.Validate.REG[this.validType]
			try{
				if(typeof this.regExp == 'string')
					this.regExp = eval(this.regExp)
			}catch(e){

			}
			
			this.notipFlag=this.options['notipFlag'];// 错误信息提示方式是否为tip，默认为true
			this.hasSuccess=this.options['hasSuccess'];//是否含有正确提示
			
			//提示div的id 为空时使用tooltop来提示
			this.tipId = this.options['tipId'] ? this.options['tipId'] : null
			//校验成功提示信息的div
			this.successId=this.options['successId'] ? this.options['successId'] : null;
			
			// 要求显示成功提示，并没有成功提示dom的id时，则创建成功提示dom
			if(this.hasSuccess&&!this.successId){
				this.successId=u.makeDOM('<span class="u-form-control-success fa fa-check-circle" ></span>');
				
				if(this.$element.nextSibling){
					this.$element.parentNode.insertBefore(this.successId,this.$element.nextSibling);
				}else{
					this.$element.parentNode.appendChild(this.successId);
				}

			}
			//不是默认的tip提示方式并且tipId没有定义时创建默认tipid	
			if(this.notipFlag&&!this.tipId){
				this.tipId=u.makeDOM('<span class="u-form-control-info fa fa-exclamation-circle "></span>');
				this.$element.parentNode.appendChild(this.tipId);

				if(this.$element.nextSibling){
					this.$element.parentNode.insertBefore(this.tipId,this.$element.nextSibling);
				}else{
					this.$element.parentNode.appendChild(this.tipId);
				}
			}
			//提示框位置
			this.placement = this.options['placement'] ? this.options['placement'] : u.Validate.DEFAULTS.placement
			//
			this.minLength = this.options['minLength'] > 0 ? this.options['minLength'] : null
			this.maxLength = this.options['maxLength'] > 0 ? this.options['maxLength'] : null
			this.min = this.options['min'] !== undefined  ? this.options['min'] : null
			this.max = this.options['max'] !== undefined ? this.options['max'] : null
			this.minNotEq = this.options['minNotEq'] !== undefined ? this.options['minNotEq'] : null
			this.maxNotEq = this.options['maxNotEq'] !== undefined ? this.options['maxNotEq'] : null
			this.min = u.isNumber(this.min) ? this.min : null
			this.max = u.isNumber(this.max) ? this.max : null
			this.minNotEq = u.isNumber(this.minNotEq) ? this.minNotEq : null
			this.maxNotEq = u.isNumber(this.maxNotEq) ? this.maxNotEq : null
			this.create()
		}
	});
		
	
	

	
	u.Validate.fn = u.Validate.prototype
	//u.Validate.tipTemplate = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow tooltip-arrow-c"></div><div class="tooltip-arrow"></div><div class="tooltip-inner" style="color:#ed7103;border:1px solid #ed7103;background-color:#fff7f0;"></div></div>'
	
	u.Validate.DEFAULTS = {
			validMode: 'blur',
			placement: "top"
		}
	
	u.Validate.NULLMSG = {
		"required": trans('validate.required', "不能为空！"),
		"integer": trans('validate.integer', "请填写整数！"),
		"float": trans('validate.float', "请填写数字！"),
		"zipCode": trans('validate.zipCode', "请填写邮政编码！"),
		"phone": trans('validate.phone', "请填写手机号码！"),
		"landline": trans('validate.landline', "请填写座机号码！"),
		"email": trans('validate.email', "请填写邮箱地址！"),
		"url": trans('validate.url', "请填写网址！"),
		"datetime": trans('validate.datetime', "请填写日期！")

	}

	u.Validate.ERRORMSG = {
		"integer": trans('validate.error_integer', "整数格式不对！"),
		"float": trans('validate.error_float', "数字格式不对！"),
		"zipCode": trans('validate.error_zipCode', "邮政编码格式不对！"),
		"phone": trans('validate.error_phone', "手机号码格式不对！"),
		"landline": trans('validate.error_landline', "座机号码格式不对！"),
		"email": trans('validate.error_email', "邮箱地址格式不对！"),
		"url": trans('validate.error_url', "网址格式不对！"),
		"datetime": trans('validate.error_datetime', "日期格式不对！")
	}

	u.Validate.REG = {
		"integer": /^-?\d+$/,
		"float": /^-?\d+(\.\d+)?$/,
		"zipCode": /^[0-9]{6}$/,
		"phone": /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/,
		"landline": /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,
		"email": /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		"url": /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
		"datetime": /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/
	}

	

	

	u.Validate.fn.create = function() {
		var self = this
		u.on(this.element,'blur', function(e) {
			if (self.validMode == 'blur'){
				self.passed = self.doValid()
				
			}
		})
		u.on(this.element,'focus', function(e) {
			//隐藏错误信息
			self.hideMsg()
		})
		u.on(this.element,'change', function(e) {
			//隐藏错误信息
			self.hideMsg()
		})	
		u.on(this.element,'keydown', function(e) {
			var event = window.event || e;
			if(self["validType"] == "float"){
				var tmp = self.element.value;
				if(event.shiftKey){
					event.returnValue=false;
					return false;
				}else if(event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {
					// tab键 左箭头 右箭头 delete键
					return true;
				}else if(event.ctrlKey && (event.keyCode == 67 || event.keyCode == 86)){
					//复制粘贴
					return true;
				}else if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=96&&event.keyCode<=105)||(u.inArray(event.keyCode,[8,110,190,189,109]) > -1))){
					event.returnValue=false;
					return false;
				}else if((!tmp || tmp.indexOf(".") > -1) && (event.keyCode == 190 || event.keyCode == 110 )){
					event.returnValue=false;
					return false;
					
				}

				if(tmp && (tmp+'').split('.')[0].length >= 25) {
					return false;
					
				}

			}
			if(self["validType"] == "integer"){
				var tmp = self.element.value

				 if(event.shiftKey){
					event.returnValue=false;
					return false;
				}else if(event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {
					// tab键 左箭头 右箭头 delete键
					return true;
				}else if(event.ctrlKey && (event.keyCode == 67 || event.keyCode == 86)){
					//复制粘贴
					return true;
				}else if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=96&&event.keyCode<=105)||(u.inArray(event.keyCode,[8,109,189]) > -1))){
					event.returnValue=false;
					return false;
				}

				if(tmp && (tmp+'').split('.')[0].length >= 25) {
					return false;
				}
			}

		})
	}

	u.Validate.fn.updateOptions = function(options){

	}

	u.Validate.fn.doValid = function(options) {
		var self=this;
		var pValue;
		this.showMsgFlag = true;
		if(options){
			pValue = options.pValue;
			this.showMsgFlag = options.showMsg;
		}
		this.needClean = false
		if (this.element && this.element.getAttribute("readonly")) return true
		var value = null
		if (typeof pValue != 'undefined')
			value = pValue
		else if(this.element)
			value = this.element.value


		if (this.isEmpty(value) && this.required) {
			this.showMsg(this.nullMsg)
			return {passed:false,Msg:this.nullMsg}
		} else if(this.isEmpty(value) && !this.required){
			return {passed:true}
		}
		if (this.regExp) {
			var reg = new RegExp(this.regExp);
			if (typeof value == 'number')
				value = value + ""
			var r = value.match(reg);
			if (r === null || r === false){
				this.showMsg(this.errorMsg)
				this.needClean = true
				return {passed:false,Msg:this.errorMsg}
			}
		}
		if (this.minLength){
			if (value.lengthb() < this.minLength){
				var Msg = "输入长度不能小于" + this.minLength + "位";
				this.showMsg(Msg)
				return {passed:false,Msg:Msg}
			}
		}
		if (this.maxLength){
			if (value.lengthb() > this.maxLength){
				var Msg = "输入长度不能大于" + this.maxLength + "位";
				this.showMsg(Msg)
				return {passed:false,Msg:Msg}
			}
		}
		if (this.max != undefined && this.max != null){
			if (parseFloat(value) > this.max){
				var Msg = "输入值不能大于" + this.max;
				this.showMsg(Msg)
				return {passed:false,Msg:Msg}
			}
		}
		if(this.min != undefined && this.min != null){
			if (parseFloat(value) < this.min){
				var Msg = "输入值不能小于" + this.min;
				this.showMsg(Msg)
				return {passed:false,Msg:Msg}
			}
		}
		if (this.maxNotEq != undefined && this.maxNotEq != null){
			if (parseFloat(value) >= this.maxNotEq){
				var Msg = "输入值不能大于或等于" + this.maxNotEq;
				this.showMsg(Msg)
				return {passed:false,Msg:Msg}
			}
		}
		if(this.minNotEq != undefined && this.minNotEq != null){
			if (parseFloat(value) <= this.minNotEq){
				var Msg = "输入值不能小于或等于" + this.minNotEq;
				this.showMsg(Msg)
				return {passed:false,Msg:Msg}
			}
		}
		//succes时，将成功信息显示
		if(this.successId){
			// u.addClass(this.element.parentNode,'u-has-success');
			var successDiv=this.successId;
			var successleft=this.$element.offsetLeft+this.$element.offsetWidth+5;
			var successtop=this.$element.offsetTop+10;
			if(typeof successDiv==='string')
				successDiv = document.getElementById(successDiv);
			successDiv.style.display='inline-block';
			successDiv.style.top=successtop+'px';
			successDiv.style.left=successleft+'px';
			clearTimeout(this.timeout)
			this.timeout = setTimeout(function(){
				// self.tooltip.hide();
				successDiv.style.display='none';
			},3000)
			
		}
		return {passed:true}
	}
	
	u.Validate.fn.check = u.Validate.fn.doValid;

//	Validate.fn.getValue = function() {
//		var inputval
//		if (this.$element.is(":radio")) {
//			inputval = this.$form.find(":radio[name='" + this.$element.attr("name") + "']:checked").val();
//		} else if (this.$element.is(":checkbox")) {
//			inputval = "";
//			this.$form.find(":checkbox[name='" + obj.attr("name") + "']:checked").each(function() {
//				inputval += $(this).val() + ',';
//			})
//		} else if (this.$element.is('div')) {
//			inputval = this.$element[0].trueValue;
//		} else {
//			inputval = this.$element.val();
//		}
//		inputval = $.trim(inputval);
//		return this.isEmpty(inputval) ? "" : inputval;
//	}

    u.Validate.fn.some = Array.prototype.some ?
		Array.prototype.some : function() {
			var flag;
			for (var i = 0; i < this.length; i++) {
				if (typeof arguments[0] == "function") {
					flag = arguments[0](this[i])
					if (flag) break;
				}
			}
			return flag;
		};

	u.Validate.fn.getValue = function() {
		var inputval = '';
		//checkbox、radio为u-meta绑定时
		var bool = this.some.call(this.$element.querySelectorAll('[type="checkbox"],[type="radio"]'), function(ele) {
			return ele.type == "checkbox" || ele.type == "radio"
		});
		if (this.$element.childNodes.length > 0 && bool) {
			var eleArr = this.$element.querySelectorAll('[type="checkbox"],[type="radio"]')
			var ele = eleArr[0]
			if (ele.type == "checkbox") {
				this.$element.querySelectorAll(":checkbox[name='" + $(ele).attr("name") + "']:checked").each(function() {
					inputval += $(this).val() + ',';
				})
			} else if (ele.type == "radio") {
				inputval = this.$element.querySelectorAll(":radio[name='" + $(ele).attr("name") + "']:checked").value;
			}
		} else if (this.$element.is(":radio")) { //valid-type 绑定
			inputval = this.$element.parent().querySelectorAll(":radio[name='" + this.$element.attr("name") + "']:checked").val();
		} else if (this.$element.is(":checkbox")) {
			inputval = "";
			this.$element.parent().find(":checkbox[name='" + this.$element.attr("name") + "']:checked").each(function() {
				inputval += $(this).val() + ',';
			})
		} else if (this.$element.find('input').length > 0){
			inputval = this.$element.find('input').val()
		}else {
			inputval = this.$element.val();
		}
		inputval = inputval.trim;
		return this.isEmpty(inputval) ? "" : inputval;
	}

	u.Validate.fn.isEmpty = function(val) {
		return val === "" || val === undefined || val === null //|| val === $.trim(this.$element.attr("tip"));
	}

	u.Validate.fn.showMsg = function(msg) {
		

		if(this.showMsgFlag == false || this.showMsgFlag == 'false'){
			return;
		}
		var self = this
		if (this.tipId) {
			this.$element.style.borderColor='rgb(241,90,74)';
			var tipdiv=this.tipId;
			var left=this.$element.offsetLeft;
			var top=this.$element.offsetTop+this.$element.offsetHeight+4;
			if(typeof tipdiv==='string'){
				tipdiv = document.getElementById(tipdiv);
			}
			tipdiv.innerHTML = msg;
			tipdiv.style.left=left+'px';
			tipdiv.style.top=top+'px';
			tipdiv.style.display = 'block';
			// u.addClass(tipdiv.parentNode,'u-has-error');
			// $('#' + this.tipId).html(msg).show()
		} else {
			var tipOptions = {
				"title": msg,
				"trigger": "manual",
				"selector": "validtip",
				"placement": this.placement,
				"container":"body"
			}
			if (this.options.tipTemplate)
				tipOptions.template = this.options.tipTemplate
			if(!this.tooltip)
				this.tooltip = new u.Tooltip(this.element,tipOptions)
			this.tooltip.setTitle(msg);
			this.tooltip.show();
			
		}
		clearTimeout(this.timeout)
		this.timeout = setTimeout(function(){
			// self.tooltip.hide();
			self.hideMsg();
		},3000)
	}
	u.Validate.fn.hideMsg = function() {
		//隐藏成功信息
		// if(this.successId||this.tipId){
		// 	document.getElementById(this.successId).style.display='none';
		// 	document.getElementById(this.tipId).style.display='none';
		// }
		
		// u.removeClass(this.element.parentNode,'u-has-error');
		// u.removeClass(this.element.parentNode,'u-has-success');
		

		if (this.tipId) {
			var tipdiv =this.tipId;
			if(typeof tipdiv==='string' ){
				tipdiv = document.getElementById(tipdiv);
			}
			tipdiv.style.display='none';
			this.$element.style.borderColor='';
			// u.removeClass(tipdiv.parentNode,'u-has-error');
		} else {
			if(this.tooltip)
			this.tooltip.hide()
		}
			
	}

	/**
	 * 只有单一元素时使用
	 */
	u.Validate.fn._needClean = function(){
		return true;//this.validates[0].needClean
	}

	u.validate=function(element){
        var self = this,options,childEle;
        if(typeof element==='string'){
            element=document.querySelector(element);
        }
        //element本身需要校验
        if(element.attributes["validate"]){
        	options=element.attributes["validate"]?JSON.parse(element.attributes["validate"].value):{};
            options=u.extend({el:element},options);
            element['u.Validate']=new u.Validate(options);
        }

        //element是个父元素，校验子元素
        childEle=element.querySelectorAll('[validate]');
        u.each(childEle,function(i,child){
           if(!child['u.Validate']){//如果该元素上没有校验
            options=child.attributes["validate"]?JSON.parse(child.attributes["validate"].value):{};
            options=u.extend({el:child},options);
            child['u.Validate']=new u.Validate(options);
           }
        });
    }

    // 对某个dom容器内的元素进行校验
    u.doValidate=function (element){
        var passed=true,childEle,result;
        if(typeof element==='string'){
            element=document.querySelector(element);
        }
        childEle=element.querySelectorAll('input');
        u.each(childEle,function(i,child){
           if(child['u.Validate']&&child['u.Validate'].check){
            result = child['u.Validate'].check({trueValue:true,showMsg:true});
            if (typeof result === 'object')
                passed = result['passed']  && passed
            else
                passed = result && passed
           }
        });
       return passed;
    }
	if (u.compMgr)   
	u.compMgr.regComp({
		comp: u.Validate,
		compAsString: 'u.Validate',
		css: 'u-validate'
	})
	