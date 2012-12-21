var app = require('http').createServer(),
	io = require('socket.io').listen(app),
	port = 80,
	width = 0,
	height = 0;

app.listen(port);

function calculate_next(current_data){
	var current = current_data.data,
		next_state = [];

	width = current_data.width;
	height = current_data.height;

	for(var i = 0; i < height * width; i++){
		next_state[i] = live_or_die(current[i] * 1, get_neighbours_number(i, current)) * 1;
	}

	next_state = next_state.join('');

	return {
		data: next_state,
		changed: next_state !== current
	}
}

function live_or_die(current_state, neighbours_number){
	if(current_state && (neighbours_number === 2 || neighbours_number === 3)){
		return true;
	}

	if(!current_state && neighbours_number === 3){
		return true;
	}

	return false;
}

function get_neighbours_number(cell_number, current){
	var row = Math.floor(cell_number / width),
		col = cell_number % width,
		neighbours = 0;

	if(row - 1 >= 0){
		if(col - 1 >= 0){
			neighbours += current[cell_number - 1 - width] * 1;
		}

		neighbours += current[cell_number - width] * 1;

		if(col + 1 < width){
			neighbours += current[cell_number + 1 - width] * 1;
		}
	}

	if(col - 1 >= 0){
		neighbours += current[cell_number - 1] * 1;
	}

	if(col + 1 < width){
		neighbours += current[cell_number + 1] * 1;
	}

	if(row + 1 < height){
		if(col - 1 >= 0){
			neighbours += current[cell_number - 1 + width] * 1;
		}

		neighbours += current[cell_number + width] * 1;

		if(col + 1 < width){
			neighbours += current[cell_number + 1 + width] * 1;
		}
	}

	return neighbours;
}

io.sockets.on('connection', function(socket){
	socket.on('get_next', function(current){
		var next = calculate_next(current);
		socket.emit('next', next);
	});
});
