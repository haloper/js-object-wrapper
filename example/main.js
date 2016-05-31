(function() {

	var ObjectWrapper = window.ObjectWrapper.noConflict();

	var data = ObjectWrapper({
		name: {
			first: "",
			last: ""
		},
		sex: "",
		age: 0
	});

	//use cookie for storage
	var storage = {
		get: function(key) {
				var cookies = document.cookie.split(';');
				var key = key + "=";
			    
			    for(var i = 0; i <cookies.length; i++) {
			        var cookie = cookies[i];
			        while (cookie.charAt(0)==' ') {
			            cookie = cookie.substring(1);
			        }
			        if (cookie.indexOf(key) == 0) {
			            return cookie.substring(key.length, cookie.length);
			        }
			    }
			    return "";
		},
		set : function(key, value) {
			var expires = new Date();
		    expires.setTime(expires.getTime() + (24*60*60*1000));
		    document.cookie = key + "=" + value + "; " + "expires=" + expires.toUTCString();
		}

	}

	loadData();
	initForm();

	function initForm() {
		data.forEachAll(function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			var element = document.getElementById(snapKey);
			if(element) {
				element.onchange = function() {
					data.get(path).set(key, this.value);
				}	
			}
			
		})
	}

	function loadData() {
		data.forEachAll(function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			var storeValue = storage.get(snapKey);
			if(storeValue !== "") {
				this.get(path).set(key, storeValue)
			}
		});
		data.snapshot();
	}

	function saveData() {
		data.change(function(key, current, before, path) {
			var snapKey = this.snapKey(path, key);
			storage.set(snapKey, current);
		});
		data.snapshot();
	}

	
	



})();