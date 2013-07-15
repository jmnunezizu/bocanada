var express = require('express')
  , library = require('./src/library')
  , app = express();

// app config
app.set('view engine', 'jade');
app.use('/assets', express.static(__dirname + '/assets'));
app.use(require('./src/middleware/uri-component-decoder')());
app.use(express.bodyParser());

require('./src/routes')(app, library);

app.use(express.logger());

// server start
var port = 3000;

var server = app.listen(port, function() {
    console.log ('server listening on port %s', port);
});

// socket start
var io = require('socket.io').listen(server);
io.on('connection', function(socket) {
    socket.send('{"success": 1}')
    // library events
    library.on('downloadReady', function(file) {
        console.log('download file ready', file);
        socket.emit('downloadReady', file);
    });

});


server.on('error', function(err) {
    if (err.code == 'EADDRINUSE') {
        console.log('Something is already listening to port %s, please stop the offending process and try again', port);
    } else {
        console.log('error starting server %s', err);
        throw err;
    }
});
