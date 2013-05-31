$(document).ready(function(){
	// sidebar height
	$(".sidebar-fixed").height($(window).height());

	// to find the largest index of the array
	Array.max = function( array ){
	  return Math.max.apply( Math, array );
	};

	// to find the less index of the array
	Array.min = function( array ){
	  return Math.min.apply( Math, array );
	};

	// autogrow textarea
    $(document).on("keyup", ".editable-input > textarea, .autoheight", function() {
    	autoGrownTextarea(this);
    });

	// autogrow click link to call textarea
    $(document).on("click", ".editable", function() {
    	autoGrownTextarea(this);
    });

    function autoGrownTextarea (parentElement) {
    	var element = $(parentElement).parent().find("textarea"),
    		new_size = element.prop('scrollHeight') + parseFloat(element.css("borderTopWidth")) + parseFloat(element.css("borderBottomWidth"));
        while(element.outerHeight() < new_size) {
            element.height(element.height()+1);
        };
    }

	// === New project === //

	$('.dropdown_new_project').on("click", function() {
		$(".dropdown-menu").toggle();
		// event.preventDefault();
	});

	// create or update thumbnail
	$('#projects_thumbnail, #update_thumbnail').awesomeCropper(
		{ width: 150, height: 150 }
	);

	$(".btn_file").on('click', function() {
		$('#update_thumbnail').val("");
	   $(this).parent().find('.input_file').click();
	});

	$(".preview, #change_thumbnail").on('click', function() {
		$('#update_thumbnail').val("");
		$('.preview').removeAttr("src");
	   $(this).parent().find('.input_file').click();
	});

	$("#update_thumbnail_project").on('click', function() {
		var thumb = $('#update_thumbnail').val();

		if(thumb != "") {
			$(".loading_item").fadeIn("fast");

		} else {
			return false
		}
	});

	// === Sidebar navigation === //

	$('.submenu > a').click(function(e)
	{
		e.preventDefault();
		var submenu = $(this).siblings('ul');
		var li = $(this).parents('li');
		var submenus = $('#sidebar li.submenu ul');
		var submenus_parents = $('#sidebar li.submenu');
		if(li.hasClass('open'))
		{
			if(($(window).width() > 768) || ($(window).width() < 479)) {
				submenu.slideUp();
			} else {
				submenu.fadeOut(250);
			}
			li.removeClass('open');
		} else
		{
			if(($(window).width() > 768) || ($(window).width() < 479)) {
				submenus.slideUp();
				submenu.slideDown();
			} else {
				submenus.fadeOut(250);
				submenu.fadeIn(250);
			}
			submenus_parents.removeClass('open');
			li.addClass('open');
		}
	});

	var ul = $('#sidebar > ul');

	$('#sidebar > a').click(function(e)
	{
		e.preventDefault();
		var sidebar = $('#sidebar');
		if(sidebar.hasClass('open'))
		{
			sidebar.removeClass('open');
			ul.slideUp(250);
		} else
		{
			sidebar.addClass('open');
			ul.slideDown(250);
		}
	});

	// === Resize window related === //
	$(window).resize(function()
	{
		if($(window).width() > 479)
		{
			ul.css({'display':'block'});
			$('#content-header .btn-group').css({width:'auto'});
		}
		if($(window).width() < 479)
		{
			ul.css({'display':'none'});
			fix_position();
		}
		if($(window).width() > 768)
		{
			$('#user-nav > ul').css({width:'auto',margin:'0'});
            $('#content-header .btn-group').css({width:'auto'});
		}
	});

	if($(window).width() < 468)
	{
		ul.css({'display':'none'});
		fix_position();
	}
	if($(window).width() > 479)
	{
	   $('#content-header .btn-group').css({width:'auto'});
		ul.css({'display':'block'});
	}

	// === Tooltips === //
	$('.tip').tooltip();
	$('.tip-left').tooltip({ placement: 'left' });
	$('.tip-right').tooltip({ placement: 'right' });
	$('.tip-top').tooltip({ placement: 'top' });
	$('.tip-bottom').tooltip({ placement: 'bottom' });

	// === Search input typeahead === //
	$('#search input[type=text]').typeahead({
		source: ['Dashboard','Form elements','Common Elements','Validation','Wizard','Buttons','Icons','Interface elements','Support','Calendar','Gallery','Reports','Charts','Graphs','Widgets'],
		items: 4
	});

	// === Fixes the position of buttons group in content header and top user navigation === //
	function fix_position()
	{
		var uwidth = $('#user-nav > ul').width();
		$('#user-nav > ul').css({width:uwidth,'margin-left':'-' + uwidth / 2 + 'px'});

        var cwidth = $('#content-header .btn-group').width();
        $('#content-header .btn-group').css({width:cwidth,'margin-left':'-' + uwidth / 2 + 'px'});
	}

	// === Style switcher === //
	// $('#style-switcher i').click(function()
	// {
	// 	if($(this).hasClass('open'))
	// 	{
	// 		$(this).parent().animate({marginRight:'-=220'});
	// 		$(this).removeClass('open');
	// 	} else
	// 	{
	// 		$(this).parent().animate({marginRight:'+=220'});
	// 		$(this).addClass('open');
	// 	}
	// 	$(this).toggleClass('icon-arrow-left');
	// 	$(this).toggleClass('icon-arrow-right');
	// });

	// $('#style-switcher a').click(function()
	// {
	// 	var style = $(this).attr('href').replace('#','');
	// 	$('.skin-color').attr('href','css/unicorn.'+style+'.css');
	// 	$(this).siblings('a').css({'border-color':'transparent'});
	// 	$(this).css({'border-color':'#aaaaaa'});
	// });

	// === My modifications === //
	$("#toogle_sidebar").click(function(){
		$("body").toggleClass("close_sidebar");
		$("#toogle_sidebar")
							.find("i")
							.toggleClass("icon-chevron-left")
							.toggleClass("icon-chevron-right");
	});

});
