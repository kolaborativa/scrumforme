$("document").ready(function($){
    
    var nav = $('.nav-status');
        // content = $('.row-fluid');
    
    $(window).scroll(function () {
        if ($(this).scrollTop() > 136) {
            nav.addClass("fixed-nav");
        } else {
            nav.removeClass("fixed-nav");
        }
    });
 
});