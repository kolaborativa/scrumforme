$(".card-modal").on("click", function(event) {
    event.preventDefault();
});

// click expand story
$(document).on("click", ".expand_story", function() {
    var item = $(this),
        story_id = item.closest(".widget-content").find(".story_container").fadeToggle("slow");

    // prevent hide itens after search
    $(".story_content").show();
    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// click close all stories
$(".close_all_stories").click(function() {
    var element = $(this).closest(".sprint_container").find(".story_container");

    // prevent hide itens after search
    $(".story_content").show();
    if (element.is(":visible")) {
        element.fadeOut("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");
    }
});

// expand close all stories
$(".expand_all_stories").click(function() {
    var element = $(this).closest(".sprint_container").find(".story_container");

    // prevent hide itens after search
    $(".story_content").show();
    if (element.is(":hidden")) {
        element.fadeIn("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");
    }
});

// livesearch
$('input[name="livesearch"]').search('.story_content', function(on) {
    var nofound = $('#nothingfound'),
        story_container = $('.story_container'),
        story_content = $(".story_content");

    on.reset(function(ui) {
        nofound.hide();
        story_container.hide();
    });

    on.empty(function() {
        nofound.show();
        story_container.hide();
    });

    on.results(function(results) {
        nofound.hide();
        story_container.hide();
        var all_results = $(results),
            results_container = all_results.closest(".story_container"),
            len_results = results_container.find(".story_content").length;

        // container show
        results_container.show();

        // content hide
        story_content.closest(".story_content").hide();
        all_results.show();
        // show only matches
        for(var i = 0; i < len_results -1; i++) {
            $(results[i]).show();
        }
    });
});