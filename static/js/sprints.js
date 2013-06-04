$(".card-modal").on("click", function(event) {
    event.preventDefault();
});

// click expand story
$(document).on("click", ".expand_story", function() {
    var item = $(this),
        // custom class to expand / collapse tables of the same story
        story_id = item.closest(".widget-content").find(".story_content").fadeToggle("slow");

    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// click close all stories
$(".close_all_stories").click(function() {
    var element = $(this).closest(".sprint_container").find(".story_content");

    if (element.is(":visible")) {
        element.fadeOut("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");
    }
});

// expand close all stories
$(".expand_all_stories").click(function() {
    var element = $(this).closest(".sprint_container").find(".story_content");

    if (element.is(":hidden")) {
        element.fadeIn("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");
    }
});