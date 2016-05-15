/*!
 * JavaScript Object Wrapper 1.0
 * https://github.com/haloper/js-object-wrapper
 *
 * Released under the MIT license
 */
(function (factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) define(factory); //for AMD(RequireJS)
	else if (typeof exports === 'object') module.exports = factory(); //for CommonJS
	else {
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

		this.data = typeof source === "object" ? source : {};

		this.path = path instanceof Array ? path : [];		
		
		this.getPathObj = function(path) {

			path = path instanceof Array ? path : this.path;
			
			var retObj = this.data;
			if( path instanceof Array) {
				for(var i=0;i<path.length;i++) {
					retObj = retObj[path[i]];
					if(typeof retObj === "undefined") break;
				}
			}
			return retObj;
		}
		
		this.setArray = function(keyArray, value) {
			var leafKey = this.getPathObj();
			for(var i=0;i<keyArray.length - 1;i++) {
				if(typeof leafKey[keyArray[i]] === "undefined") leafKey[keyArray[i]] = {};
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

		this.checkKeyArray = function(keyArray) {

			var isOK = keyArray instanceof Array && keyArray.length !== 0;

			keyArray.forEach(function(key) {
				isOK = typeof key === "object" ? false : isOK;
			});
			return isOK;
		}

		this.cloneObject = function (source) {
			var target;
			if(typeof source !== "object") target = source;	
			else if(source instanceof Date) {
				target = new Date();
				target.setTime(source.getTime());
			}
			else if(source instanceof Array) {
				target = [];
				for(var i=0;i<source.length;i++) {
					target[i] = this.cloneObject(source[i]);
				}
			}
			else if(!this.hasChild(source))	target = {};

			return target;
		}

		this.equalObject = function (source, target) {
			if(typeof source !== "object" || typeof target !== "object")
				return source === target;	

			else if(source instanceof Date && target instanceof Date)
				return source.getTime() === target.getTime();

			else if(source instanceof Array && target instanceof Array) {
				for(var i=0;i<source.length;i++) {
					if(!this.equalObject(source[i], target[i])) {
						return false;
					}
				}
				return true;
			}

			else if(!this.hasChild(source) && !this.hasChild(target)) return true;

			else return false;

		}

		this.snapKey = function(path, key) {
			path.map(function(_path) {
				return _path.replace(/_/g, "_\\");
			})
			key = key.replace(/_/g, "_\\");
			return [].concat(path).concat([key]).join("_");
		}

		this.restoreSnapKey = function(snapKey) {
			return snapKey.split(/_(?!\\)/).map(function(key) {
				return key.replace(/_\\/g, "_");
			});
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
		if(!this.checkKeyArray(keyArray)) 
			throw Error("Key is not valid : " + keyArray);

		return this.setArray(keyArray, value);
	}
	
	api.prototype.get = function(key) {
		
		var _path = this.path;
		if(arguments.length > 1) 
			key = [].slice.call(arguments);	
		if(key instanceof Array) {
			_path = this.path.concat(key.slice(0, -1));
			key = key[key.length - 1];
		}

		
		var pathObj = this.getPathObj(_path);

		if(typeof pathObj === 'undefined')
			return pathObj;

		
		if(this.hasChild(pathObj[key])) {
			var subPath = _path.slice(0);
			subPath.push(key);
			return new api(this.data, subPath);
		}
		else return pathObj[key];
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
		if(!path instanceof Array)
			path = this.path;

		keys.forEach(function(key) {
			callback.call(this, key, obj[key], path);
		}, this);
	}
	
	api.prototype.forEachAll = function(callback) {
		var path = arguments.length > 1 ? arguments[1] : undefined;
		if(!(path instanceof Array))
			path = this.path;

		var callEvenPath = arguments.length > 2 ? arguments[2] : undefined;
		this.forEach(function(key, value, _path) {
			if(this.hasChild(value)) {
				if(callEvenPath) callback.call(this, key, value, _path);

				var subPath = _path.slice(0);
				subPath.push(key);
				this.forEachAll(callback, subPath, callEvenPath);
			}
			else callback.call(this, key, value, _path);
		}, path);
	}

	api.prototype.findKey = function(keyword) {
		var result = [];
		this.forEachAll(function(key, value, path) {
			if(keyword.test(key)) {
				if(this.hasChild(value)) {
					var subPath = path.slice(0);
					subPath.push(key);
					result.push(new api(this.data, subPath));	
				}
				else result.push(value);
			}
		}, undefined, true);
		return result;
	}
	
	api.prototype.snapshot = function() {
		this.snapData = {};
		this.forEachAll(function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			this.snapData[snapKey] = this.cloneObject(value);
		});
	}

	api.prototype.changed = function(callback) {
		var result = false;
		var size = 0;
		var snapshotKeys = Object.keys(this.snapData);
		this.forEachAll(function() {
			var _snapshotKeys = snapshotKeys;
			return function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			if(!this.equalObject(value, this.snapData[snapKey])) {
				result = true;
				if(callback) callback.call(this, key, value, this.snapData[snapKey], path);
			}
			var index = _snapshotKeys.indexOf(snapKey);
			if(index >= 0) _snapshotKeys.splice(index, 1);
			size++;
			}
		}());
		if(snapshotKeys.length > 0) {
			if(callback) {
				snapshotKeys.forEach(function(snapKey) {
					var restoreSnapKey = this.restoreSnapKey(snapKey);
					var key = restoreSnapKey.pop();
					callback.call(this, key, undefined, this.snapData[snapKey], restoreSnapKey);
				}, this);
			}
			result = true;
		}
		return result;
	}

	api.prototype.restore = function() {
		this.data = {};
		var snapshotKeys = Object.keys(this.snapData);
		snapshotKeys.forEach(function(snapKey) {
			var restoreSnapKey = this.restoreSnapKey(snapKey);
			this.set(restoreSnapKey, this.snapData[snapKey]);
		}, this);
	}

	api.prototype.equal = function(obj) {
		var result = true;
		//check count of root's child
		if(Object.keys(this.data).length !== Object.keys(obj).length) return false

		this.forEachAll(function(key, value, path) {
			var objValue = obj;
			for(var i=0;i<path.length;i++) {
				objValue = objValue[path[i]];
			}
			objValue = objValue[key];
			//check child count
			if(this.hasChild(value)) {
				if(Object.keys(value).length !== Object.keys(objValue).length) result = false;
			}
			else {
				//check value
				if(!this.equalObject(value, objValue)) result = false;	
			}
			
		}, undefined, true);
		return result;
	}

	api.prototype.toMap = function() {
		this.snapshot();
		return this.snapData;
	}

	api.prototype.fromMap = function(map) {
		for(var key in map) { 
		    var array = this.restoreSnapKey(key);
		    this.set(array, map[key]);
		}
		return this;
	}

	api.prototype.getSnapKey = function(path, key) {
		return this.snapKey(path, key);
	}

	return factory;
}));
