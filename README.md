# js-object-wrapper
Javascript Object Wrapper

## Basic Usage

Define:

```javascript
var obj = ObjectWrapper({
				name: {
					first : "Jin Hoon",
					last: "Kim",
					wife: {
						name : "Nara"
					}
				},
				nickname: "haloper",
				hobby: ["game", "movie"]
			});
```

Get, Set, Value:

```javascript
obj.get("name").get("first"); 	// "Jin Hoon"
obj.get("hobby"); 					// ["game", "movie"]
obj.value();							// obj object
obj.get("name").value();			// name object

obj.get("name").set("full name", "Kim Jin Hoon");
obj.get("name").get("full name");						//"Kim Jin Hoon";

obj.get(["name", "first"]);									// "Jin Hoon"
obj.set(["name", "wife", "nickname"], "shine");
obj.get("name").get(["wife", "nickname"]); 			//shine"
```

Parent, Child and Root:

```javascript
var child = obj.child("name").child("wife"); 	// wife wrapped object
child.parent().value(); 								// name object
child.parent().parent().value(); 					// root object
child.root().value();									// root object
```

Contain:

```javascript
obj.get("name").contain("first"); 	//true
obj.contain("name"); 					//true
obj.contain("first"); 					//false
```

ForEachAll:

```javascript
var count = 0;
obj.forEachAll(function(key, value, path) {
	// key : "first"
	// value : "Jin Hoon"
	// path : ["name"]
	// ...
	console.log(key + "|" + value + "|" + path)
	count++;
	
});
count; 	//count = 7
```

FindKeys:

```javascript
var result = obj.findKey(/wife/);
result.length; 		// 1
```

Snapshot and check change:

```javascript
obj.snapshot();
obj.get("name").get("first"); 				// Jin Hoon
obj.get("name").set("first", "Ha Ram");
obj.changed();								// true
obj.get("name").set("first", "Jin Hoon");
obj.changed();								// false
```

Changed callback:

```javascript
obj.snapshot();
obj.get("name").set("first", "Han Kyul");
obj.changed(function(key, current, before, path) {
	key;		// first
	current;	// Jin Hoon
	before;		// Han Kyul
	path;		// name
});		// true
```

Restore:

```javascript
obj.get("name").set("first", "Jin Hoon");
obj.snapshot();
obj.get("name").set("first", "Ha ram");
obj.changed();				// true
obj.restore();
obj.get("name", "first");	// Jin Hoon
obj.changed();				// false
```

Equal:

```javascript
var source = ObjectWrapper({
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			});

source.equal({
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			});								// true

source.equal({
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1),
				sex: "male"
			});								// false
```

ToMap and FromMap:

```javascript
var obj = ObjectWrapper({
	name: {
		first : "Jin Hoon",
		last: "Kim"
	},
	nick_name: "haloper",
	full_name: "Kim Jin Hoon"
});

var map = obj.toMap();
//map : {
//	name_first: "Jin Hoon",
//	name_last: "Kim",
//	nick_\name: "haloper",
//	full_\name: "Kim Jin Hoon"
//}

var fromMap = ObjectWrapper().fromMap(map);
obj.equal(fromMap.value());			//true
```

## Namespace conflicts

```javascript
var objectWrapper = ObjectWrapper.noConflict();
var obj = objectWrapper({name: "haloper"});
```

## Authors

* [Kim Jin Hoon](https://github.com/haloper)