// prototype là  object,mọi javascrip object đều kế thừa từ prototype.
// Trong javascrip việc kế thừa đều thông qua prototype

Object.getPrototypeOf([]) === Array.prototype
// true

Object.getPrototypeOf(Function) === Function.prototype
// true

// vd:

var str= 'abc'; // str là  string,được kế thừa từ String.prototype
String.prototype.duplicate = Function() { return this+this;}
console.log(str.duplicate); // str kế thừa duplicate từ String.prototype

// 
Function person(firstName,lastName){
	this.firstName = firstName;
	this.lastName = lastName;
}

person.prototype.myfunc = Function() {
	console.log('ssss');
}

var ps = new person('dang','lv');
ps.myfunc(); // ssss

// Su dung prototype de ke thua

Function Person() {
	this.firstName = 'a';
	this.lastName = 'b';
	this.sayName = Function(){
		return firstName+' '+lastName;
	};
}

Function Superman(firstName,lastName){
	this.firstName = firstName;
	this.lastName = lastName;
}

// Muốn Superman kế thừa từ Person
Superman.prototype = new Person();

var sm = new Superman('aaa','bbb');
sm.sayName(); // aaa bbb,kế thừa từ Person