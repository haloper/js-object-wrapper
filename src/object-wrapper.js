/*!
 * JavaScript Object Wrapper 1.0
 * https://github.com/haloper/js-object-wrapper
 *
 * Released under the MIT license
 */
(function (factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) { //AMD(RequireJS) 사용 시
		define(factory);
	} else if (typeof exports === 'object') { //CommonJS 사용 시
		module.exports = factory();
	} else {
		var oldObjectWrapper = window.ObjectWrapper;
		var objectWrapper = window.ObjectWrapper = factory();

		objectWrapper.noConflict = function () {
			window.ObjectWrapper = oldObjectWrapper;
			return objectWrapper;
		};
	}
}(function () {
	'use strict';
	function factory(source) {
		return new api(source);
	}
	
	function api(source, path) {
		
		if(typeof source === "object") {
			this.data = source;
		}
		else {
			this.data = {};
		}
		
		if(path instanceof Array) {
			this.path = path;
		}
		else {
			this.path = [];
		}
		
		this.getPathObj = function(path) {
			
			if(!(path instanceof Array)) {
				path = this.path;
			}
			
			var retObj = this.data;
			if( path instanceof Array) {
				for(var i=0;i<path.length;i++) {
					retObj = retObj[path[i]];
				}
			}
			return retObj;
		}
		
		this.setArray = function(keyArray, value) {
			var leafKey = this.getPathObj();
			for(var i=0;i<keyArray.length - 1;i++) {
				if(typeof leafKey[keyArray[i]] === "undefined") {
					leafKey[keyArray[i]] = {};
				}
				leafKey = leafKey[keyArray[i]];
			}
			leafKey[keyArray[keyArray.length - 1]] = value;
			return this;
		}
		
		this.hasChild = function(obj) {
			return obj instanceof Object 
				&& Object.keys(obj).length > 0
				&& !(obj instanceof Array);
		}
	}
	
	api.prototype.clear = function() {
		this.data = {};
	}
	
	api.prototype.set = function() {
		var keyArray, value;
		if(arguments.length == 2 && arguments[0] instanceof Array) {
			keyArray = arguments[0];; 
			value = arguments[1];
		} 
		else {
			var argus = [].slice.call(arguments);
			keyArray = argus.slice(0, -1);
			value = argus[argus.length - 1];
		}
		return this.setArray(keyArray, value);
	}
	
	api.prototype.get = function(key) {
		
		var _path = this.path;
		if(key instanceof Array) {
			_path = this.path.concat(key.slice(0, -1));
			key = key[key.length - 1];
		}
		
		var pathObj = this.getPathObj(_path);
		
		if(this.hasChild(pathObj[key])) {
			var subPath = this.path.slice(0);
			subPath.push(key);
			return new api(this.data, subPath);
		}
		else {
			return pathObj[key];
		}
	}
	
	
	api.prototype.child = api.prototype.get;
	
	api.prototype.parent = function() {
		return new api(this.data, this.path.slice(0, -1));
	}
	
	api.prototype.root = function() {
		return new api(this.data, []);
	}
	
	api.prototype.value = function() {
		return this.getPathObj();
	}
	
	api.prototype.contain = function(key) {
		return typeof this.getPathObj()[key] !== "undefined";
	}
	
	api.prototype.remove = function(key) {
		delete this.getPathObj()[key];
	}
	
	api.prototype.keys = function(path) {
		return Object.keys(this.getPathObj(path));
	}
	
	api.prototype.values = function(path) {
		if(typeof Object.values === "function") { //for firefox
			return Object.values(this.getPathObj(path));
		}
		else {
			var array = [];
			this.forEach(function(key, value) {
				array.push(value);
			}, path);
			return array;
		}
	}
	
	api.prototype.forEach = function(callback) {
		var path = arguments.length > 1 ? arguments[1] : undefined;
		var keys = this.keys(path);
		var obj = this.getPathObj(path);
		if(!path instanceof Array) {
			path = this.path;
		}
		keys.forEach(function(key) {
			callback.call(this, key, obj[key], path);
		}, this);
	}
	
	api.prototype.forEachAll = function(callback) {
		var path = arguments.length > 1 ? arguments[1] : undefined;
		if(!(path instanceof Array)) {
			path = this.path;
		}
		this.forEach(function(key, value, _path) {
			if(this.hasChild(value)) {
				var subPath = _path.slice(0);
				subPath.push(key);
				this.forEachAll(callback, subPath);
			}
			else {
				callback(key, value, _path);
			}
		}, path);
	}
	
	return factory;
}));
