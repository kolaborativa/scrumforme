$("document").ready(function($){
    
    var nav = $('.nav-status');
    
    $(window).scroll(function () {
        if ($(this).scrollTop() > 136) {
            nav.addClass("fixed-nav");
        } else {
            nav.removeClass("fixed-nav");
        }
    });

    // livesearch
    $('input[name="livesearch"]').search('.story_container .column', function(on) {
        on.reset(function() {
          $('#nothingfound').hide();
          $('.story_container .column').show();
        });

        on.empty(function() {
          $('#nothingfound').show();
          $('.story_container .column').hide();
        });

        on.results(function(results) {
          $('#nothingfound').hide();
          $('.story_container .column').hide();
          results.show();
        });
    });
 
});