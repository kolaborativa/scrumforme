
/*
#WebMaster : Felipe Campos
#Version : 1.1
*/
jQuery.fn.floatfixed = function(settings){
	var nav = $(this),
        config = {
        'topx': '0px',
        'offsetTopx':nav.offset().top,
        'leftx': '0px',
        'scrollTopx':true,
        'scrollTopSpeed':400,
        'scrollOffsetTopx':200,
        'floatFixedx':true
    };

    if(config.scrollTopx){
        $('body').append('<a href="#" id="back-top"  style="display: inline;"><i class="icon-chevron-up"></i></a>');
        var backTop = $("#back-top");
        backTop.hide();
        $(window).scroll(function () {
			if ($(this).scrollTop() > config.scrollOffsetTopx) {
				backTop.fadeIn();
			} else {
				backTop.fadeOut();
			}
		});
        backTop.click(function () {

			$('body,html').animate({
				scrollTop: 0
			}, config.scrollTopSpeed);
			return false;
		});
    }



    if (settings){$.extend(config, settings);}
    return this.each(function(){


      if (nav.length > 0){

    	   var position = nav.css("position"),
    	       top = nav.css("top"),
    	       left = nav.css("left"),
    	       index = nav.css("z-index");
       }

	$(window).scroll(function(){

		if(config.floatFixedx){


		var sticky_scroll = $(this).scrollTop();
			if(sticky_scroll > config.offsetTopx ){
			nav.css
			({
				"position":"fixed",
				"top":config.topx,
				"left":config.leftx,
				"z-index":"99999"
			}).addClass("fixed-nav");


		}else{
			nav.css({"position":position,"top":top,"left":left,"z-index":index}).removeClass("fixed-nav");

		}

         }

	})

    });
};