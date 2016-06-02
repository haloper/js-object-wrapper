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

	}

	//get obj from current path
	api.prototype._getPathObj = function(path) {

		path = path instanceof Array ? path : this.path;
		
		var retObj = this.data;
		if(path instanceof Array) {
			for(var i=0;i<path.length;i++) {
				retObj = retObj[path[i]];
				if(typeof retObj === "undefined") break;
			}
		}
		return retObj;
	}
	
	//set value to keyArray path
	api.prototype._setArray = function(keyArray, value) {
		var leafKey = this._getPathObj();
		for(var i=0;i<keyArray.length - 1;i++) {
			if(typeof leafKey[keyArray[i]] === "undefined") leafKey[keyArray[i]] = {};
			leafKey = leafKey[keyArray[i]];
		}
		leafKey[keyArray[keyArray.length - 1]] = value;
		return this;
	}
	
	//Check obj has child (other object)
	api.prototype._hasChild = function(obj) {
		return obj instanceof Object 
			&& this.keys(obj).length > 0
			&& !(obj instanceof Array);
	}

	//Check keys in the keyArray are correct
	api.prototype._checkKeyArray = function(keyArray) {

		var isOK = keyArray instanceof Array && keyArray.length !== 0;

		keyArray.forEach(function(key) {
			if(typeof key === "object") return false;
		});
		return isOK;
	}

	//clone object
	//If source is an Array then this function will be called recursively
	api.prototype.cloneObject = function (source) {
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
		else if(!this._hasChild(source)) target = {};
		else throw TypeError("This object can't be cloned : " + source);

		return target;
	}

	//Check equal two values
	//This function can't check objects
	api.prototype.equalValue = function (source, target) {
		if(typeof source !== "object" || typeof target !== "object")
			return source === target;	

		else if(source instanceof Date && target instanceof Date)
			return source.getTime() === target.getTime();

		else if(source instanceof Array && target instanceof Array) {
			if(source.length != target.length) return false;
			for(var i=0;i<source.length;i++) {
				if(!this.equalValue(source[i], target[i])) {
					return false;
				}
			}
			return true;
		}

		//if source is {} and target is {}
		else if(!this._hasChild(source) && !this._hasChild(target)) return true;

		else return false;

	}
	
	//Clear datas in the object
	api.prototype.clear = function() {
		this.data = {};
		this.path = [];
		this.snapData = {};
	}
	
	//Set value
	api.prototype.set = function() {
		var keyArray, value;
		//set([key1, ..., keyN], value);
		if(arguments.length == 2 && arguments[0] instanceof Array) {
			keyArray = arguments[0];; 
			value = arguments[1];
		}
		//set(key1, ..., keyN, value);
		else {
			var argus = [].slice.call(arguments);
			keyArray = argus.slice(0, -1);
			value = argus[argus.length - 1];
		}

		if(!this._checkKeyArray(keyArray)) 
			throw Error("Key is not valid : " + keyArray);

		return this._setArray(keyArray, value);
	}
	
	//Get value
	api.prototype.get = function(key) {
		
		var _path = this.path;

		//get(key1, ..., keyN) -> change key to Array
		if(arguments.length > 1) 
			key = [].slice.call(arguments);	

		if(key instanceof Array) {
			_path = this.path.concat(key.slice(0, -1));
			key = key[key.length - 1];
		}

		var pathObj = this._getPathObj(_path);

		if(typeof pathObj === 'undefined')
			return pathObj;

		if(typeof key === 'undefined') return this;
		//if pathObj has child then return new obj-wrapper object
		else if(this._hasChild(pathObj[key])) {
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
		return this._getPathObj();
	}
	
	api.prototype.contain = function(key) {
		return typeof this._getPathObj()[key] !== "undefined";
	}
	
	api.prototype.remove = function(key) {
		delete this._getPathObj()[key];
	}
	
	//Get keys in the obj
	api.prototype.keys = function() {
		if(Object.keys) return Object.keys;

		return function(obj) {
			if (typeof obj !== "object")
			    throw new TypeError('obj have to be Object');
			var keys=[], p;
			for (p in obj) if (Object.prototype.hasOwnProperty.call(obj,p)) keys.push(p);
			return keys;
		}
		
	}();
	
	//Foreach all elements on the current path or the path from arguments
	api.prototype.forEach = function(callback) {
		var path = (arguments.length > 1 && arguments[1] instanceof Array) ? arguments[1] : this.path;
		var keys = this.keys(this._getPathObj(path));
		var obj = this._getPathObj(path);

		keys.forEach(function(key) {
			callback.call(this, key, obj[key], path);
		}, this);
	}
	
	//Foreach all elements in the all keys of the object
	api.prototype.forEachAll = function(callback) {
		var path = (arguments.length > 1 && arguments[1] instanceof Array) ? arguments[1] : this.path;

		//Call callback function on the all path that even don't have child.
		var callEvenPath = arguments.length > 2 && arguments[2];

		this.forEach(function(key, value, _path) {
			if(this._hasChild(value)) {
				if(callEvenPath) callback.call(this, key, value, _path);

				var subPath = _path.slice(0);
				subPath.push(key);
				this.forEachAll(callback, subPath, callEvenPath);
			}
			else callback.call(this, key, value, _path);
		}, path);
	}

	//Find key and return Array that has result
	api.prototype.findKey = function(keyword) {
		var result = [];
		this.forEachAll(function(key, value, path) {
			if(keyword.test(key)) {
				if(this._hasChild(value)) {
					var subPath = path.slice(0);
					subPath.push(key);
					result.push(new api(this.data, subPath));	
				}
				else result.push(value);
			}
		}, undefined, true);
		return result;
	}
	
	//Make snapshot data
	api.prototype.snapshot = function() {
		this.snapData = {};
		this.forEachAll(function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			this.snapData[snapKey] = this.cloneObject(value);
		});
	}

	//Check the data have changed after snapshot
	api.prototype.changed = function(callback) {
		var result = false;
		var snapshotKeys = this.keys(this.snapData);
		this.forEachAll(function() {
			var _snapshotKeys = snapshotKeys; //closure
			return function(key, value, path) {
				var snapKey = this.snapKey(path, key);
				if(!this.equalValue(value, this.snapData[snapKey])) {
					result = true;
					if(callback) callback.call(this, key, value, this.snapData[snapKey], path);
				}
				//Remove keys in the snapshotKeys after comparison
				var index = _snapshotKeys.indexOf(snapKey);
				if(index >= 0) _snapshotKeys.splice(index, 1);
			}
		}());
		//Process remaining snapshot keys
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

	//Restore from snapshot data
	api.prototype.restore = function() {
		this.data = {};
		var snapshotKeys = this.keys(this.snapData);
		snapshotKeys.forEach(function(snapKey) {
			var restoreSnapKey = this.restoreSnapKey(snapKey);
			this.set(restoreSnapKey, this.snapData[snapKey]);
		}, this);
	}

	//Check this ObjectWrapper object to eqaul the other object 
	api.prototype.equal = function(obj) {
		var result = true;
		//check count of root's child
		if(this.keys(this._getPathObj()).length !== this.keys(obj).length) return false

		this.forEachAll(function(key, value, path) {
			var objValue = obj;
			for(var i=0;i<path.length;i++) {
				objValue = objValue[path[i]] || objValue;
			}
			objValue = objValue[key];
			//check child count
			if(this._hasChild(value)) {
				if(this.keys(value).length !== this.keys(objValue).length) result = false;
			}
			else {
				//check value
				if(!this.equalValue(value, objValue)) result = false;	
			}
			
		}, undefined, true);
		return result;
	}

	//From ObjectWrapper object(this) to map
	api.prototype.toMap = function() {
		this.snapshot();
		return this.snapData;
	}

	//From map to ObjectWrapper object(this)
	api.prototype.fromMap = function(map) {
		for(var key in map) { 
		    var array = this.restoreSnapKey(key);
		    this.set(array, map[key]);
		}
		return this;
	}

	//Generate snapKey, key values join with "_"
	api.prototype.snapKey = function(path, key) {
		path.map(function(_path) {
			return _path.replace(/_/g, "_\\");
		})
		key = key.replace(/_/g, "_\\");
		return [].concat(path).concat([key]).join("_");
	}

	//Restore snapKey
	api.prototype.restoreSnapKey = function(snapKey) {
		return snapKey.split(/_(?!\\)/).map(function(key) {
			return key.replace(/_\\/g, "_");
		});
	}

	return factory;
}));
