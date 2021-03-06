describe("Object Wrapper", function() {
	var ObjectWrapper = window.ObjectWrapper.noConflict();

	describe("Init object", function() {

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



		it("Working with map", function() {
			var obj = ObjectWrapper({
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nick_name: "haloper",
				__hobby: ["game", "movie"],
				full_name___: "Kim Jin Hoon"
			});
			obj.set("tes__/_/_//__t//__/_", "test!!");
			var map = obj.toMap();
			expect(Object.keys(map).length).toBe(6);
			var fromMap = ObjectWrapper().fromMap(map);
			expect(obj.equal(fromMap.value())).toBe(true);
		});
	});

	describe("Get, Set And Search", function() {
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

			expect(objectWrapper.get("host", "empty", "hi")).toBeUndefined();

			expect(objectWrapper.get("user", "name").get("last")).toBe("kim");
			expect(objectWrapper.get(["user", "name"]).get("last")).toBe("kim");


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
		


 		it("Find keyword from keys", function() {
 			var result = objectWrapper.findKey(/a/);
 			expect(result.length).toBe(4);
 		});
		
	});

	describe("Change and Equal", function() {

		var objectWrapper;

		beforeEach(function() {
			objectWrapper = ObjectWrapper();
			objectWrapper.set("user", "name", "full name", "Kim Han Kyul")
				.set(["user", "name", "first"], "Han Kyul")
				.set("user", "name", "last", "kim")
				.set("user", "sex", "male")
				.set("user", "last login", new Date())
				.set("user", "hobby", ["programming", "swimming"]);
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
			objectWrapper.set(["add", "tools", "mac"], {});
			objectWrapper.get("user", "last login").remove("add property");
			expect(objectWrapper.changed()).toBe(true);

		});

		it("Restore to snapshot", function() {
			objectWrapper.snapshot();
			objectWrapper.set(["add", "tools", "mac"], {});
			expect(objectWrapper.changed()).toBe(true);
			objectWrapper.restore();
			expect(objectWrapper.changed()).toBe(false);

		});

		it("Foreach in Change function", function() {
			objectWrapper.snapshot();
			objectWrapper.set(["user", "add_property"], "added");
			objectWrapper.set(["add", "tools", "mac"], {});
			objectWrapper.set("user", "name", "full name", "Kim Jin Hoon");
			objectWrapper.get("user").remove("sex");
			var changeItems = [];
			objectWrapper.changed(function(key, current, before, path) {
				changeItems.push({key: key, current: current, before: before, path: path});
			});
			expect(changeItems.length).toBe(4);
		});

		it("Object equal function test", function() {
			var source = ObjectWrapper({
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			});
			var same = {
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			}
			var diff1 = {
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				sex: "male",
				last_login: new Date(1)
			}
			var diff2 = {
				name: {
					first : "Jin Hoon",
					last: ["Kim"]
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			}
			var diff3 = {
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				hobby: ["game", "movie"],
				last_login: new Date(1)
			}
			var diff4 = {
				name: {
					first : "Jin Hoon",
					last: "Kim"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date()
			}
			var diff5 = {
				name: {
					first : "Jin Hoon",
					last: "Kim",
					second: "Hello"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			}
			var diff6 = {
				name: {
					first : "Jin Hoon"
				},
				nickname: "haloper",
				hobby: ["game", "movie"],
				last_login: new Date(1)
			}
			expect(source.equal(same)).toBe(true);
			expect(source.equal(diff1)).toBe(false);
			expect(source.equal(diff2)).toBe(false);
			expect(source.equal(diff3)).toBe(false);
			expect(source.equal(diff4)).toBe(false);
			expect(source.equal(diff5)).toBe(false);
			expect(source.equal(diff6)).toBe(false);

		});
	});

	describe("Bug Fix", function() {

		var objectWrapper;

		beforeEach(function() {
			objectWrapper = ObjectWrapper();
			objectWrapper.set("user", "name", "full name", "Kim Han Kyul")
				.set(["user", "name", "first"], "Han Kyul")
				.set("user", "name", "last", "kim")
				.set("user", "sex", "male")
				.set("user", "last login", new Date())
				.set("user", "hobby", ["programming", "swimming"]);
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
 		});

 		it("Check forEachAll on child", function() {
 			var count = 0;
 			objectWrapper.get("user", "name").forEachAll(function() {
 				count++;
 			});
 			expect(count).toBe(3);
 		});

 		it("Check equal on child", function() {
 			expect(objectWrapper.get("user").equal(objectWrapper.get("user").value())).toBe(true);
 		});

 		it("Get object from empty array", function() {
			expect(objectWrapper.get([]).equal(objectWrapper.value())).toBe(true);
 		});

 		it("Check changed when array value change to empty", function() {
 			expect(objectWrapper.equalValue([], ["a"])).toBe(false);
 			objectWrapper.snapshot();
 			objectWrapper.set(["user", "hobby"], []);
 			expect(objectWrapper.changed()).toBe(true);

 		});

	});
	


 	
});
