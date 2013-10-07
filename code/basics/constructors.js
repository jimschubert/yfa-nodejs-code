var x = 100;

function Example(name){
    var self = this;
    self.x = 200;
    self.name = name;
    
    self.look = function(){
        console.log("%s: x is %d", self.name, self.x);
    };
    return self;
};

var a = new Example('A');
a.look();
var b = Example('B');
b.look();

console.log(a);
console.log(b);
