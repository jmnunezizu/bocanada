var express = require('express');
var app = express();

// app config
app.set('view engine', 'jade');
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.bodyParser());

require('./src/routes')(app);

app.use(express.logger());

// server start
var port = 3000;

var server = app.listen(port, function() {
    console.log ('server listening on port %s', port);
});

server.on('error', function(err) {
    if (err.code == 'EADDRINUSE') {
        console.log('Something is already listening to port %s, please stop the offending process and try again', port);
    } else {
        console.log('error starting server %s', err);
        throw err;
    }
});
