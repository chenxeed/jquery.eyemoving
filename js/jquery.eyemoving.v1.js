// Copyright by ChenX @ 2014
// Contact me for support at
// email : chenxeed@gmail.com
// github : chenxphyt

(function ( $ ) {

	$.fn.eyemoving = function(options){
		
		// Set variable needed
		var window_width, window_height, is_mouse_idle,
				top_pos_percentage, left_pos_percentage,
				eye_close = false,
				eye_position = {};
		
		// Set variable option
		var settings = $.extend({
			container : this,
			head : false,
			head_class : 'eye-head',
			top : 100,
			left : 100,
			eye_ball_class : 'eye-ball',
			eye_ball_left_class : 'left',
			eye_ball_right_class : 'right',
			eye_ball_separator_class : 'eye-separator',
			eye_ball_separator_width : 5,
			eye_ball_diameter : 40,
			eye_retina_class : 'eye-retina',
			eye_retina_diameter : 20,
			idle_stare : true,
			drag_head : true,
			blink : 5000,
			blink_rand_interval : true,
			blink_speed : 100,
			mobile_hide : true
		}, options);
		
		//Create our own head, or use existing head
		if(settings.head){
			settings.head = $('<div/>').appendTo(settings.container);
		}else{
			settings.head = settings.container;
		}
		$(settings.head).addClass(settings.head_class);
		if(settings.top) $(settings.head).css('top',settings.top);
		if(settings.left) $(settings.head).css('left',settings.left);
		
		if(settings.mobile_hide){
			$(settings.head).addClass('eye-head-mobile-hide');
		}
		
		//able to drag head
		if(settings.drag_head){
			var head_onmousemove = function(e, pos, mouse_x, mouse_y){
				var diff_x = e.screenX-mouse_x;
				var diff_y = e.screenY-mouse_y;
				$(settings.head).css({
					left : pos.left+diff_x-$(window).scrollLeft(),
					top : pos.top+diff_y-$(window).scrollTop()
				});
			};
			var is_drag = false;
			$(settings.head).mousedown(function(e){
				var pos = $(this).offset();
				var mouse_x = e.screenX;
				var mouse_y = e.screenY;
				is_drag = false;
				$(window).on('mousemove.drag_head', function(e){
					is_drag = true;
					head_onmousemove(e, pos, mouse_x, mouse_y);
				});
				$(window).on('mouseup.drag_head', function(e){
					$(window).off('mousemove.drag_head');
				});
			});
			$(settings.head).click(function(e){
				if(is_drag){
					e.preventDefault();
				}
			});
		}
		
		var eye_retina_margin = settings.eye_ball_diameter / settings.eye_retina_diameter;
		var eye_max = (settings.eye_ball_diameter - settings.eye_retina_diameter - (eye_retina_margin*2)) * 0.9;
		
		// Function variable to make the eye sees user
		var seeUser = function(){
			$(settings.head).children('.'+settings.eye_ball_class).children('.'+settings.eye_retina_class).animate({
				top: 0.5*eye_max,
				left: 0.5*eye_max
			});			
		};
		
		// Function variable to execute function on idle
		var timeoutMouseIdle = null;
		var mouseIdle = function(){
			is_mouse_idle = null;
			clearTimeout(timeoutMouseIdle);
			timeoutMouseIdle = setTimeout(function(){
				is_mouse_idle = true;
				seeUser();
			}, 3000);
		};
		// Create element of eyeballs
		//left
		$('<div/>', {
			class: settings.eye_ball_class+' '+settings.eye_ball_left_class
		}).css({
			width: settings.eye_ball_diameter,
			height: settings.eye_ball_diameter
		}).appendTo(settings.head);
		//separator
		$('<div/>', {
			class: settings.eye_ball_separator_class
		}).css({
			width: settings.eye_ball_separator_width
		}).appendTo(settings.head);
		//right
		$('<div/>', {
			class: settings.eye_ball_class+' '+settings.eye_ball_right_class
		}).css({
			width: settings.eye_ball_diameter,
			height: settings.eye_ball_diameter
		}).appendTo(settings.head);
		var eyeball_left = $(settings.head).children('.'+settings.eye_ball_class+'.'+settings.eye_ball_left_class);
		var eyeball_right = $(settings.head).children('.'+settings.eye_ball_class+'.'+settings.eye_ball_right_class);

		// Create element of retina
		$('<div/>', {
			class: settings.eye_retina_class
		}).css({
			width: settings.eye_retina_diameter,
			height: settings.eye_retina_diameter,
			margin: eye_retina_margin
		}).appendTo(eyeball_left);
		$('<div/>', {
			class: settings.eye_retina_class
		}).css({
			width: settings.eye_retina_diameter,
			height: settings.eye_retina_diameter,
			margin: eye_retina_margin
		}).appendTo(eyeball_right);
		var eyeball_retina = $(settings.head).children('.'+settings.eye_ball_class).children('.'+settings.eye_retina_class);

		// Create function needed
		var animate_eye_close = function(onclose){
			if(onclose===undefined){ onclose = function(){}; }
			$(settings.head).children('.'+settings.eye_ball_class).animate({height:1}, settings.blink_speed, function(){
				eye_close = true;
				onclose();
			});
		};
		var animate_eye_open = function(onopen){
			if(onopen===undefined){ onopen = function(){}; }
			$(settings.head).children('.'+settings.eye_ball_class).animate({height:settings.eye_ball_diameter}, settings.blink_speed, function(){
				eye_close = false;
				onopen();
			});
		};

		if(settings.blink > 0){
			var do_blink = function(){
				if(!eye_close){
					animate_eye_close(function(){
						animate_eye_open();
					});
				}
				else{
					animate_eye_open();
				}
			};

			if(settings.blink_rand_interval===false){
				setInterval(function(){
					do_blink();
				}, settings.blink);
			}else{
				var random_blink = function(){
					setTimeout(function(){
						do_blink();
						random_blink();
					}, Math.floor((Math.random() * settings.blink) + settings.blink_speed));
				};
				random_blink();
			}
		}

		// Set event listener on mouse move
		$(window).on('mousemove.move_retina', function(e){
			e.preventDefault();
			//If mouse idle, set the eye to see the user
			if(settings.idle_stare){
				mouseIdle();
			}

			//Get current eye position
			eye_position.x1 = eyeball_left.offset().left;
			eye_position.y1 = eyeball_left.offset().top - $(window).scrollTop();
			eye_position.x2 = eyeball_right.offset().left + eyeball_left.width();
			eye_position.y2 = eyeball_right.offset().top+ eyeball_left.height() - $(window).scrollTop();
			//Get window width and height, to detect window resizing
			window_width = $(window).width();
			window_height = $(window).height();

			//Get the left position percentage of the mouse
			if(e.clientX<eye_position.x1)
				left_pos_percentage = 0;
			else if(e.clientX>eye_position.x2)
				left_pos_percentage = 1;
			else
				left_pos_percentage = (e.clientX-eye_position.x1)/(eye_position.x2-eye_position.x1);
			//Set the left position
			eyeball_retina.css('left',left_pos_percentage*eye_max);

			//Get the top position percentage of the mouse				
			if(e.clientY<eye_position.y1)
				top_pos_percentage = 0;
			else if(e.clientY>eye_position.y2)
				top_pos_percentage = 1;
			else
				top_pos_percentage = (e.clientY-eye_position.y1)/(eye_position.y2-eye_position.y1);
			//Set the top position
			eyeball_retina.css('top',(top_pos_percentage*eye_max));
		});
	};
	
}( jQuery ));