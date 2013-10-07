var fs = require('fs'),
    file = '/tmp/example.txt';
if(fs.existsSync(file)) {
    var contents = fs.readFileSync(file, 'utf8');
    console.log(contents);
} else {
    console.log('%s does not exist', file);
}