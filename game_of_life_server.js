var app = require('http').createServer(),
	io = require('socket.io').listen(app),
	port = 9009;

app.listen(port);

function calculate_next(){
	return '111000';
}

io.sockets.on('connection', function(socket){
	socket.on('get_next', function(current){
		var next = calculate_next();
		socket.emit('next', next);
	});
});
