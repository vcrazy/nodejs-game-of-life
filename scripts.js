width = 10,
height = 10;

var socket = io.connect('http://localhost:9009');
socket.on('next', function(data){
	console.log(data);
});

$(document).ready(function(){
	$('.get_next').click(function(){
		var current = '';

		$.each($('.dot'), function(dot){
			current += ($(this).hasClass('live') * 1);
		});

		socket.emit('get_next', current);
	});

	$('.dot').live('click', function(){
		$(this).toggleClass('live');
	});

	function generate_grid(){
		for(var i = 0; i < height; i++){
			for(var j = 0; j < width; j++){
				$('#grid').append('<div class="dot">&nbsp;</div>');
			}
		}
	}

	generate_grid();
});
