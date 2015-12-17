$(".card-modal").on("click", function(event) {
    event.preventDefault();
});

// click expand sprint
$(document).on("click", ".expand_sprint", function() {
    var item = $(this).closest(".sprint_container"),
        element = item.find(".sprint_content");

    // prevent hide itens after search
    $(".story_container").show();
    $(".story_content").show();
    if (element.is(":visible")) {
        element.fadeOut("slow");
        item.find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");

    } else{
        element.fadeIn("slow");
        item.find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");

    }

});

// click expand story
$(document).on("click", ".expand_story", function() {
    var item = $(this).closest(".sprint_content"),
        element = item.find(".story_content");

    if (element.is(":visible")) {
        element.fadeOut("slow");
        item.find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");

    } else{
        element.fadeIn("slow");
        item.find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");

    }

});

// click close all stories
$(".close_all_sprints").click(function() {
    var element = $(".sprint_content");

    // prevent hide itens after search
    if (element.is(":visible")) {
        element.fadeOut("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");
    }
});

// expand all stories
$(".expand_all_sprints").click(function() {
     var element = $(".sprint_content");

    // prevent hide itens after search
    $(".story_container").show();
    $(".story_content").show();
    if (element.is(":hidden")) {
        element.fadeIn("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");
    }
});

// livesearch
$('input[name="livesearch"]').search('.story_content', function(on) {
    var nofound = $('#nothingfound'),
        sprint_container = $('.sprint_container'),
        sprint_content = $('.sprint_content'),
        story_container = $('.story_container'),
        story_content = $(".story_content");

    on.reset(function(ui) {
        nofound.hide();
        sprint_container.show();
        sprint_content.hide();
    });

    on.empty(function() {
        nofound.show();
        sprint_container.show();
        sprint_content.hide();
    });

    on.results(function(results) {
        nofound.hide();
        sprint_container.hide();
        sprint_content.hide();
        story_container.hide();
        var all_results = $(results),
            results_container = all_results.closest(".sprint_container"),
            len_results = results_container.find(".story_content").length;

        // container show
        // all_results.closest(".sprint_content").show()
        results_container.show();
        results_container.find(".sprint_content").show()
        results_container.find(".story_container").show();

        // content hide
        story_content.closest(".story_content").hide();
        all_results.show();
        // show only matches
        for(var i = 0; i < len_results -1; i++) {
            $(results[i]).show();
        }
    });
});