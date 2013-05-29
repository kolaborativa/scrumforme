/*
#WebMaster : Felipe Campos
#Version : 1.2
#Reparo : Gustavo De Souza Lima - @dodilei
*/
jQuery.fn.floatfixed = function (settings) {
    var nav = $(this),
        windowElement = $(window),
        options,
        backTop,
        defaults = {
            'topx': '0px',
            'offsetTopx': nav.offset().top,
            'leftx': '0px',
            'scrollTopx': true,
            'scrollTopSpeed': 400,
            'scrollOffsetTopx': 200,
            'floatFixedx': true,
            'scrollClass': 'standardClass'
        };

    if (settings) {
        options = $.extend(defaults, settings);
    }

    if (options.scrollTopx) {
        $('body').append('<a href="#" id="back-top"  style="display: inline;"><i class="' + options.scrollClass + '"></i></a>');
        backTop = $("#back-top");
        backTop.hide();

        windowElement.scroll(function () {
            if ($(this).scrollTop() > options.scrollOffsetTopx) {
                backTop.fadeIn();
            } else {
                backTop.fadeOut();
            }
        });

        backTop.click(function () {

            $('body,html').animate({
                scrollTop: 0
            }, options.scrollTopSpeed);
            return false;
        });
    }

    return this.each(function () {
        var position,
            top,
            left,
            index,
            sticky_scroll;

        if (nav.length > 0) {
            position = nav.css("position");
            top = nav.css("top");
            left = nav.css("left");
            index = nav.css("z-index");
        }

        windowElement.scroll(function () {

            if (options.floatFixedx) {
                sticky_scroll = $(this).scrollTop();

                if (sticky_scroll > options.offsetTopx) {
                    nav.css({
                        "position": "fixed",
                        "top": options.topx,
                        "left": options.leftx,
                        "z-index": "999"
                    }).addClass("fixed-nav");

                } else {
                    nav.css({
                        "position": position,
                        "top": top,
                        "left": left,
                        "z-index": index
                    }).removeClass("fixed-nav");

                }
            }
        });
    });
};
