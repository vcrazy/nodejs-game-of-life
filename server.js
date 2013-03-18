var app = require('http').createServer(),
	io = require('socket.io').listen(app),
	port = 9588,
	width = 0,
	height = 0,
	data = '';

app.listen(port);

function calculate_next(current_data){
	var next_state = [];
	data = current_data.data;

	width = current_data.width;
	height = current_data.height;

	for(var i = 0; i < height * width; i++){
		next_state[i] = live_or_die(data[i] * 1, get_neighbours_number(i)) * 1;
	}

	next_state = next_state.join('');

	return {
		data: next_state,
		changed: next_state !== data,
		stamp: current_data.stamp
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

function get_neighbours_of(row, default_col, same_row){
	var number = 0, col;
	row = get_row(row);

	col = get_col(default_col - 1);
	number += data[row * width + col] * 1;

	if(!same_row){
		col = get_col(default_col);
		number += data[row * width + col] * 1;
	}

	col = get_col(default_col + 1);
	number += data[row * width + col] * 1;

	return number;
}

function get_row(row){
	if(row < 0){
		return height - 1;
	}else if(row >= height){
		return 0;
	}else{
		return row;
	}
}

function get_col(col){
	if(col < 0){
		return width - 1;
	}else if(col >= width){
		return 0;
	}else{
		return col;
	}
}

function get_neighbours_number(cell_number){
	var row = Math.floor(cell_number / width),
		col = cell_number % width,
		neighbours = 0;

	neighbours += get_neighbours_of(row - 1, col, false);
	neighbours += get_neighbours_of(row, col, true);
	neighbours += get_neighbours_of(row + 1, col);

	return neighbours;
}

io.sockets.on('connection', function(socket){
	socket.on('get_next', function(current){
		var next = calculate_next(current);
		socket.emit('next', next);
	});
});
