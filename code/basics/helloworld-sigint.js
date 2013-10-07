// respond to the SIGINT event
process.on('SIGINT', function(){
    process.stdout.write('\nHandling SIGINT event!\n');
    // cleanly exit with non-error status
    process.exit(0);
});

// listen to events on standard input
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  process.stdout.write('Hello, world!\n');
});

// Start reading from stdin so we don't exit.
process.stdin.resume();
console.log('Type anything and press ENTER...');
