var http = require('http');
var express = require('express');
var app = express();
var session = require('express-session');

app.set('port', 4000);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/app/public'));
app.set('views', __dirname + '/app/server/views');

require('./app/server/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Deepzoom listening on port ' + app.get('port'));
});


