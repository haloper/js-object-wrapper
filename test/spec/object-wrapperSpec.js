describe("Object Wrapper", function() {
	var ObjectWrapper = window.ObjectWrapper.noConflict();
	
	describe("Simple objectWrapper Structure", function() {
		var objectWrapper;
		beforeEach(function() {
			objectWrapper = ObjectWrapper();
			objectWrapper.set("user name", "hoon")
			.set("sex", "male")
			.set(",.!@#$%^&*()';[]\<>/ - key", ",.!@#$%^&*()';[]\<>/ - value");
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
			expect(objectWrapper.get("user name")).toBe(undefined);
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
				.set("user", "hobby", ["programming", "swimming"]);
		});
		
		it("Get value on the chain", function() {
			expect(objectWrapper.get("user").get("name").get("last")).toBe("kim");
			var date = objectWrapper.get("user").get("last login");
			expect(date instanceof Date).toBe(true);
			var date2 = objectWrapper.get("user", "last login");
			expect(date2 instanceof Date).toBe(true);
			var date3 = objectWrapper.get(["user", "last login"]);
			expect(date3 instanceof Date).toBe(true);

			var hobby = objectWrapper.get("user").get("hobby");
			expect(hobby instanceof Array).toBe(true);
			var hobby2 = objectWrapper.get("user", "hobby");
			expect(hobby2 instanceof Array).toBe(true);
			var hobby3 = objectWrapper.get(["user", "hobby"]);
			expect(hobby3 instanceof Array).toBe(true);

			expect(objectWrapper.get(["user", "age", "real"])).toBeUndefined();


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

 		it("Wrong input test", function() {
 			expect(function() {
 				objectWrapper.set(["user", "name", "full name", "test"]);
 			}).toThrow();
 			expect(function() {
 				objectWrapper.set();
 			}).toThrow();
 			expect(function() {
 				objectWrapper.set("aaa");
 			}).toThrow();
 		})

 		it("Find keyword from keys", function() {
 			var result = objectWrapper.findKey(/a/);
 			expect(result.length).toBe(4);
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

		it("snapshot and check changed values", function() {
			objectWrapper.snapshot();
			expect(objectWrapper.changed()).toBe(false);
			objectWrapper.set(["user", "name", "full name"], "Won Bin");
			expect(objectWrapper.changed()).toBe(true);
			objectWrapper.set(["user", "name", "full name"], "Kim Han Kyul");
			expect(objectWrapper.changed()).toBe(false);
			objectWrapper.set(["user", "name", "full name"], ["Kim Han Kyul"]);
			expect(objectWrapper.changed()).toBe(true);
			objectWrapper.set(["user", "last login"], new Date(1));
			expect(objectWrapper.changed()).toBe(true);
			objectWrapper.set(["user", "last login"], "yesterday");
			expect(objectWrapper.changed()).toBe(true);

			objectWrapper.snapshot();
			expect(objectWrapper.changed()).toBe(false);
			objectWrapper.get("user").remove("last login");
			expect(objectWrapper.changed()).toBe(true);

			objectWrapper.snapshot();
			expect(objectWrapper.changed()).toBe(false);
			objectWrapper.set(["user", "last login", "add property"], "added");
			expect(objectWrapper.changed()).toBe(true);

			objectWrapper.snapshot();
			objectWrapper.set(["user", "name", "subname"], {});
			expect(objectWrapper.changed()).toBe(true);
			objectWrapper.snapshot();
			expect(objectWrapper.changed()).toBe(false);


		});
	});
	
 	
});
