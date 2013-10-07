var fs = require('fs'),
    file = '/tmp/example.txt',
    o = { encoding: 'utf8' };

fs.exists(file, function(itExists) {
    if(itExists) {
        fs.readFile(file, o, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log(data);
            }
        });
    } else {
        console.log('%s does not exist', file);
    }
});