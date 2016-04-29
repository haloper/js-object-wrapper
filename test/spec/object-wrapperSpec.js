describe("Object Wrapper", function() {
	var ObjectWrapper = window.ObjectWrapper.noConflict();
	
	describe("Simple objectWrapper Structure", function() {
		var objectWrapper;
		beforeEach(function() {
			objectWrapper = ObjectWrapper();
			objectWrapper.set("user name", "hoon")
			.set("sex", "male")
			.set("!@#$%^&*()';[]\<>/ - key", "!@#$%^&*()';[]\<>/ - value");
		});

		it("Get existent key", function() {
			
			expect(objectWrapper.contain("user name")).toBe(true);
			expect(objectWrapper.contain("sex")).toBe(true);
			
			expect(objectWrapper.get("user name")).toEqual("hoon");
			expect(objectWrapper.get("sex")).toEqual("male");
			
			objectWrapper.set("user name", "hoony");
			expect(objectWrapper.get("user name")).toEqual("hoony");
			
		});
		
		it("Get non-existent key", function() {
			objectWrapper.remove(" user name");
			expect(objectWrapper.contain("user name")).toBe(true);
			objectWrapper.remove("user name");
			expect(objectWrapper.contain("user name")).toBe(false);
		});
		
		it("Get keys and values", function() {
			expect(objectWrapper.keys().length > 0).toBe(true);
			expect(objectWrapper.values().length > 0).toBe(true);
		});
		
		it("Foreach should work well", function() {
			var count = 0;
			objectWrapper.forEach(function(key, value) {
				expect(value).toBe(objectWrapper.get(key));
				count++;
			});
			expect(count).toBe(objectWrapper.keys().length);
		});
	});
	describe("Complex objectWrapper Structure", function() {
		var objectWrapper;
		var valueCount = 6;
		beforeEach(function() {
			objectWrapper = ObjectWrapper();
			objectWrapper.set("user", "name", "full name", "Kim Han Kyul")
				.set(["user", "name", "first"], "Han Kyul")
				.set("user", "name", "last", "kim")
				.set("user", "sex", "male")
				.set("user", "last login", new Date())
				.set("user", "hobby", ["programming", "swimming"])
		});
		
		it("Get value on the chain", function() {
			expect(objectWrapper.get("user").get("name").get("last")).toBe("kim");
			var date = objectWrapper.get("user").get("last login");
			expect(date instanceof Date).toBe(true);
			var hobby = objectWrapper.get("user").get("hobby");
			expect(hobby instanceof Array).toBe(true);
			
		});
		
		it("Set value on the chain", function() {
			objectWrapper.get("user").get("name").set("nickname", "rocket buster");
			expect(objectWrapper.get(["user", "name", "nickname"])).toBe("rocket buster");
		});
		
		it("Get child, parent and root", function() {
			var child = objectWrapper.get("user").child("name");
			expect(child.get("full name")).toBe("Kim Han Kyul");
			var parent = child.parent().child("sex");
			expect(parent).toBe("male");
			var root = child.root();
			expect(root.get(["user", "name", "full name"])).toBe("Kim Han Kyul");
		});
		
		it("forEachAll should search all sub entries.", function() {
			var count = 0;
			objectWrapper.forEachAll(function(key, value, path) {
				count++;
			})
			expect(count).toBe(valueCount);
		});
		
		it("Duplicated get error", function() {
			expect(objectWrapper.get(["user", "name", "full name"])).toBe("Kim Han Kyul");
			expect(objectWrapper.get(["user", "name", "full name"])).toBe("Kim Han Kyul");
			expect(objectWrapper.get(["user", "name", "full name"])).toBe("Kim Han Kyul");
			expect(objectWrapper.get(["user", "name", "full name"])).toBe("Kim Han Kyul");
 		});
		
		it("Wrapping the object already existing", function() {
			var obj = ObjectWrapper({
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"]
			});
			expect(obj.get("name").get("first")).toBe("Jin Hoon");
			expect(obj.get("hobby")).toEqual(jasmine.arrayContaining(["game", "movie"]));
			
			obj.get("name").set("full name", "Kim Jin Hoon");
			expect(obj.get("name").get("full name")).toBe("Kim Jin Hoon");
		});
		
		it("sample code", function() {
			//define
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

			//get, set, value
			obj.get("name").get("first"); 	// "Jin Hoon"
			obj.get("hobby"); 					// ["game", "movie"]
			obj.value();							// obj object
			obj.get("name").value();			// name object

			obj.get("name").set("full name", "Kim Jin Hoon");
			obj.get("name").get("full name");						//"Kim Jin Hoon";
			
			obj.get(["name", "first"]);									// "Jin Hoon"
			obj.set(["name", "wife", "nickname"], "shine");
			obj.get("name").get(["wife", "nickname"]); 			//shine"

			//parent, child and root
			var child = obj.child("name").child("wife"); 	// wife wrapped object
			child.parent().value(); 								// name object
			child.parent().parent().value(); 					// root object
			child.root().value();									// root object

			//contain
			obj.get("name").contain("first"); 	//true
			obj.contain("name"); 					//true
			obj.contain("first"); 					//false

			//forEachAll
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

			
			expect(true).toBe(true);

		});
	});
	
 	
});
