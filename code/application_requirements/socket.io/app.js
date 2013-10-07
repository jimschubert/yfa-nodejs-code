var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8081);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var count = 0;
io.sockets.on('connection', function (socket) {
  // initial message kicks off the back-and-forth
  socket.emit('server-msg', { hello: 'world' });
  socket.on('client-msg', function (data) {
    console.log(data);
    setTimeout(function(){
        socket.emit('server-msg', { hello: 'world #' + (++count) });
    }, 500);
  });
});
