var x = 5;

var example = {
    x: 100,
    
    a: function(){
        var x = 200;
        console.log('a context: %s, var x = %s', this.x, x);
    },

    b: function(){
        var x = 300;
        return function(){
            var x = 400;
            console.log('b context: %s, var x = %s', this.x, x);
        };
    },
    
    c: function(){
        var other = { x: 500 };
        var execB = this.b().bind(other);
        execB();
        return execB;
    }
}

console.log('example.x: ' + example.x); // 100
example.a();                            // 100
example.b()();                          // undefined
example.a.call({x:9999});               // 9999
var execB = example.c();                // 500
execB.call({x:9999});                   // 500
