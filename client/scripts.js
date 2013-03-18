board = {},
cell = {
	width: 25,
	height: 16
},
timing = {
	all: []
},

auto = false,
interval = 120, // in ms

socket = io.connect('http://141.0.170.38:9588/');

$(document).ready(function(){
// ACTIONS
	var drag_selection = false;

	$(document).mousedown(function(){
		drag_selection = true;
	});

	$(document).mouseup(function(){
		drag_selection = false;
	});

	$('.dot').live('mouseenter', function(){
		cell.mark($(this));
	});

	$('.dot').live('mouseleave', function(){
		cell.mark($(this));
	});

	$('.dot').live('click', function(){
		cell.click($(this));
	});

	$('.get_next').click(function(){
		board.get_next();
	});

	$('.auto_start').click(function(){
		auto = true;
		$('.get_next').click();
	});

	$('.auto_stop').click(function(){
		auto = false;
	});

	$('.reset').click(function(){
		window.location.reload();
	});

	$('.random').click(function(){
		$('.auto_stop').click();
		board.randomize();
	});
// END ACTIONS

// SOCKET
	socket.on('next', function(data){
		timing.stop();
		board.receive(data);
	});
// END SOCKET

// CELL
	cell.click = function(selected_cell){
		$(selected_cell).toggleClass('live');
		board.change_live_dots($(selected_cell).hasClass('live'));
	};

	cell.change = function(cell, live){
		$(cell).toggleClass('live', live);
	};

	cell.mark = function(selected_cell){
		return drag_selection && $(selected_cell).addClass('live');
	};
// END CELL

// GRID
	var Grid = {
		generate: function(){
			for(var i = 0; i < cell.height * cell.width; i++){
				$('#grid').append('<div class="dot">&nbsp;</div>');
			}
		},
		change: function(){
			var dot = {
				width: $('.dot:first').css('width').split('px')[0] * 1 + 2,
				height: $('.dot:first').css('height').split('px')[0] * 1 + 2
			};

			$('#grid').css({
				width: dot.width * cell.width,
				height: dot.height * cell.height
			});

			$('#cellall').html(cell.width * cell.height);
		}
	};
// END GRID

// BOARD
	board.get_next = function(){
		board.waiting = + new Date;
		socket.emit('get_next', {
			data: board.get_cells(),
			width: cell.width,
			height: cell.height,
			stamp: board.waiting
		});
		timing.start();
	};

	board.get_cells = function(){
		var current = '';

		$.each($('.dot'), function(){
			current += ($(this).hasClass('live') * 1 + '');
		});

		return current;
	};

	board.randomize = function(frequency){
		frequency = frequency || 0.25;

		$.each($('.dot'), function(){
			cell.change($(this), Math.floor(Math.random() / frequency) === 0);
		});

		board.set_live(0); // on randomize set 0 live
		board.blink_live(0, 0);
	};

	board.change_live_dots = function(one_cell_value){
		var live_dots = $('#celllive').html() * 1 + (one_cell_value ? 1 : -1);
	
		board.set_live_dots_number(live_dots);

		return live_dots
	};

	board.recalculate_live_dots = function(){
		return $('.dot.live').length;
	};

	board.set_live_dots_number = function(live_dots){
		$('#celllive').html(live_dots);
	};

	board.set_live = function(live){
		board.blink_live($('#celllive').html() * 1, live * 1);

		live = board.beautify_number(live, $('#cellall').html().length);
		$('#celllive').html(live);

		return live;
	};

	board.beautify_number = function(number, target_length){
		return (number + '').length < target_length ? board.beautify_number('0' + number, target_length) : number;
	};

	board.blink_live = function(old_number, new_number){
		var colour = 'ffffff';

		if(old_number < new_number){
			colour = '00ff00';
		}else if(old_number > new_number){
			colour = 'ff0000';
		}

		$('#celllive').css('backgroundColor', '#' + colour);
	};

	board.check_max_live = function(new_number){
		var current_live = $('#cellmaxlive').html() * 1;

		if(new_number > current_live){
			$('#cellmaxlive').html(new_number);
		}
	};

	board.change_cells = function(values){
		$.each($('.dot'), function(i, dot){
			cell.change($(this), values[i] == 1);
		});
	};

	board.receive = function(data){
		if(data.stamp != board.waiting){
			return;
		}

		if(!data.changed){
			return $('.auto_stop').click();
		}

		board.init_tasks(data.data.split(''));

		auto && setTimeout(function(){
			auto && board.get_next();
		}, interval);
	};

	board.init_tasks = function(data){
		board.change_cells(data);

		var new_live_number = board.recalculate_live_dots();
		board.set_live(new_live_number);
		board.check_max_live(new_live_number);
	};

	board.generate_grid = function(){
		Grid.generate();
		Grid.change();
	};

	board.generate_grid();
// END BOARD

// TIMING
	timing.start = function(){
		timing.time = + new Date;
	};

	timing.stop = function(){
		timing.all.push(+ new Date - timing.time);
		timing.time = null;
	};

	timing.log = function(){
		var all = timing.all,
			sum = avg = min = max = 0,
			count = all.length;

		for(var i in all){
			sum += all[i];
			min = min ? Math.min(min, all[i]) : all[i];
			max = Math.max(max, all[i]);
		}

		avg = sum / count;

		console.log({
			info: 'All times are in ms',
			sum: sum,
			count: count,
			avg: Math.round(avg),
			min: min,
			max: max,
			all: all
		});
	};
// END TIMING
});
