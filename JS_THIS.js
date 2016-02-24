
// This tro den object goi ham do.

var person = {
	firstName : 'danglv',
	lastName : '12345',
	showName : function() {
		console.log(this.firstName+'-'+this.lastName);
	}
};

// This la person.
person.showName();
-----------------
/* khi khai bao bien global hay function global thi ham do se nam trong Object window */

var firstName = 'Danglv',lastName = '123123';
function showName(){
	console.log(this.firstName+'--'+this.lastName);
}

window.showName(); // Danglv--123123
showName(); // object goi showName van la window

------------------

/* Su dung this trong function duoc truyen vao nhu callback*/

var person = {
	firstName : 'danglv',
	lastName : '112321',
	showName : function(){
		console.log(this.firstName + '--'+ this.lastName);
	}
};

person.showName(); // this o day la person

$('button').click(person.showName); // this o day la 'button'

// Su dung ham anonymous funtion
$('button').click(function(){
	person.showName()
});

// Su dung bind
$('button').click(person.showName.bind(person));

/* SU dung this trong anobymous function*/

var person = {
	firstName:'danglv',
	lastName : '123124',
	friend : ['a','b','c','d'],
	showName : function(){
		console.log(this.firstName+'--'+this.lastName);
	},

	showAge:function(){
		this.friend.forEach(function(fr){
			console.log(this.firstName+'-'+this.lastName+fr);
		})
	}

}

person.showName(); // this o day la person,ham chay dung
person.showAge(); // this o day la window ,ham chay sai

// sua:
var person = {
	firstName : 'danglv',
	lastName : '12312',
	friend : ['a','b','c','d'],
	showName : function() {
		console.log(this.firstName+'-'+this.lastName);
	},

	showFriend : function(){
		var ps = this; // tao doi tuong luu tru person(this)
		this.friend.forEach(function(fr){
			console.log(ps.showName+fr);
		});
	}

	/* Khi function duoc gan bao 1 bien */

	var person = {
		firstName : 'danglv',
		lastName : '12334',
		showName:function(){
			console.log(this.firstName+'-'+this.lastName);
		}
	};

	var funPer = person.showName; // ham function vao 1 bien
	funPer(); // Ham chay sai,this o day la window

	var funPer1 = person.showName.bind(person); // su dung bind
	funPer1(); // chay dung
}
