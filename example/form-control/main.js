(function() {

	var ObjectWrapper = window.ObjectWrapper.noConflict();

	var data = ObjectWrapper({
		name: {
			first: "",
			last: ""
		},
		sex: "male",
		age: "25",
		interest: []
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
	bindFormEvent();

	function bindFormEvent() {
		data.forEachAll(function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			var elements = [].concat(document.getElementById(snapKey) 
				|| [].slice.call(document.getElementsByName(snapKey)));

			for(var i=0;i<elements.length;i++) {
				elements[i].onchange = function() {
					onChangeForm.call(this, key, path);
				};
			}
		});
		document.getElementById("save").onclick = function() {
			saveData();
			setButtonDisable(true);
		}
		document.getElementById("reset").onclick = function() {
			data.restore();
			loadData();
			setButtonDisable(true);
		}
	}

	function onChangeForm(key, path) {
		var value = data.get(path).get(key);
		if(this.type === "checkbox") {
			if(!(value instanceof Array)) value = [].concat(value); 
			if(this.checked) value.push(this.value);
			else {
				var index = value.indexOf(this.value);
				if(index >= 0) value.splice(index, 1);
			}

		}
		else value = this.value;
		data.get(path).set(key, value);
		setButtonDisable(!data.changed());
	}

	function setButtonDisable(disabled) {
		document.getElementById("save").disabled = disabled;
		document.getElementById("reset").disabled = disabled;
	}

	function setForm(id, value) {
		var element = document.getElementById(id) || document.getElementsByName(id);
		if(element.length) {
			for(var i=0;i<element.length;i++) {
				element[i].checked = value instanceof Array 
				? value.indexOf(element[i].value) >= 0 
				: element[i].value === value;
			}
		}
		else element.value = value;

	}

	function loadData() {
		data.forEachAll(function(key, value, path) {
			var snapKey = this.snapKey(path, key);
			var storeValue = storage.get(snapKey);
			if(storeValue !== "") {
				if(value instanceof Array) {
					storeValue = storeValue.split(",");
				}
				this.get(path).set(key, storeValue)
			}
			setForm(snapKey, storeValue || value);
		});
		data.snapshot();
	}

	function saveData() {
		data.changed(function(key, current, before, path) {
			var snapKey = this.snapKey(path, key);
			storage.set(snapKey, current);
		});
		data.snapshot();
	}

})();