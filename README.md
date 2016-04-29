# JavaScript Object Wrapper

## Basic Usage

Define:

```javascript
var obj = ObjectWrapper({
	name: {
		first : "Jin Hoon",
		last: "Kim"
	},
	nickname: "haloper",
	hobby: ["game", "movie"]
});
```

Get, Set:

```javascript
obj.get("name").get("first"); 	//"Jin Hoon"
obj.get("hobby"); 					//["game", "movie"]

obj.get("name").set("full name", "Kim Jin Hoon");
obj.get("name").get("full name");	//"Kim Jin Hoon";
```

Parent, Child and Root

```javascript
var child = obj.child("name").child("first"); 	//"Jin Hoon"
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

Read all visible cookies:

```javascript
Cookies.get(); // => { name: 'value' }
```

ForEachAll:

```javascript
var count = 0;
obj.forEachAll(function(key, value, path) {
	// key : "first"
	// value : "Jin Hoon"
	// path : ["name", "first"]
	// ...
	
	count++;
	
});
count; 	//count = 4
```

## Namespace conflicts

```javascript
var objectWrapper = ObjectWrapper.noConflict();
var obj = objectWrapper({name: "haloper"});
```

## Authors

* [Kim Jin Hoon](https://github.com/haloper)