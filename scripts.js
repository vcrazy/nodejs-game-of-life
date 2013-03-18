width = 20,
height = 10;
auto = false;

var socket = io.connect('http://141.0.170.38:9588/');
socket.on('next', function(data){
	var data_arr = data.data.split('');

	$.each($('.dot'), function(i, dot){
		$(this).toggleClass('live', data_arr[i] == 1);
	});

	if(!data.changed){
		$('.auto_stop').click();
	}else if(auto){
		setTimeout(function(){
			auto && $('.get_next').click();
		}, 250);
	}
});

$(document).ready(function(){
	$('.get_next').click(function(){
		var current = '';

		$.each($('.dot'), function(dot){
			current += ($(this).hasClass('live') * 1 + '');
		});

		socket.emit('get_next', {
			data: current,
			width: width,
			height: height
		});
	});

	$('.auto_start').click(function(){
		auto = true;
		$('.get_next').click();
	});

	$('.auto_stop').click(function(){
		auto = false;
	});

	$('.dot').live('click', function(){
		$(this).toggleClass('live');
	});

	$('.reset').click(function(){
		window.location.reload();
	});

	$('.random').click(function(){
		$.each($('.dot'), function(){
			$(this).toggleClass('live', Math.floor(Math.random() * 2) === 1);
		});
	});

	function generate_grid(){
		$('#grid').css({
			width: 50 * width,
			height: 50 * height
		});

		for(var i = 0; i < height * width; i++){
			$('#grid').append('<div class="dot">&nbsp;</div>');
		}
	}

	generate_grid();
});
