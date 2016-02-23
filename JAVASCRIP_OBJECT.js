
// Creat object in js by Object Literal 

var person = {
	lastName : 'danglv'.
	firstName : '12323',
	showName : function () {
		console.log(this.firstName+'-'+this.lastName);
	}
};


// Creat object in js with contructor

var ps = new person();
ps.firstName = 'danglv';
ps.lastName = '123213';
ps.showName = function(){
	console.log(this.firstName+'-'+this.lastName);
};


// Creat object in js with contructor parttern

function person(firstName,lastName){

	this.firstName = firstName;
	this.lastName = lastName;
	thi.showName = function(){
		console.log(this.firstName+'-'+this.lastName);
	}
};

var ps1 = new person('danglv','123123');
var ps2 = new person('danglv1','11111');


// Truy xuất 1 trường trong object

var person = {

	firstName : 'danglv',
	lastName:'123123',
	4:'aaa',  // property có tên là 1 số
	showName : function(){
		console.log(this.firstName+'---'+this.lastName);
	}
};

console.log(person.firstName);
console.log(person.lastName);
console.log(person['firstName']+'-'+person['lastName']);
console.log(person['4']); // dùng dotnotation cho property là số.
console.log(person.showName());
console.log(person['showName']());

// dung for để duyệt qua các property của object

for(var ps in person){
	console.log(ps); // firstName,lastName,4,showName
}


// Thêm hoặc xoá 1 property trong Object

var person2 = {
	name:'danglv',
	id : '12312',
	showInfo= function(){
		console.log(this.name+'--'+this.id);
	}
};

person2.pass = '1231231';
person2.Img = '11011';

delete person2.name; // xoá trường name trong person2

console.log(person2.pass); // '1231231'
console.log(person2.name); // undefined


// 3. Serialize và deserialize
// Để giao tiếp với server, JavaScript thường submit dữ liệu dưới dạng pair-value (thông qua form) hoặc JSON. 
// Do đó, javascript hỗ trợ sẵn việc chuyển object sang chuỗi JSON và ngược lại

var person3 = {
	name : 'danl',
	age : 2,
	showInfo:function(){
		console.log(this.name+'--'+this.age);
	}

};

// Serialize
JSON.stringify(person3); // ["name":"danl","age":2] 

// deSerialize
var jsonString = ["name":"danlg","age":123,"us":"1231"];

var ps = JSON.parse(jsonString);
console.log(ps.name);// danlg
console.log(ps.age); // 123
console.log(ps.us); // 1231

