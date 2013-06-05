$(".card-modal").on("click", function(event) {
    event.prevenstDefault();
});

// click expand story
$(document).on("click", ".expand_story", function() {
    var item = $(this),
        // custom class to expand / collapse tables of the same story
        story_id = item.closest(".widget-content").find(".story_container").fadeToggle("slow");

    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// click close all stories
$(".close_all_stories").click(function() {
    var element = $(this).closest(".sprint_container").find(".story_container");

    if (element.is(":visible")) {
        element.fadeOut("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");
    }
});

// expand close all stories
$(".expand_all_stories").click(function() {
    var element = $(this).closest(".sprint_container").find(".story_container");

    if (element.is(":hidden")) {
        element.fadeIn("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");
    }
});

// livesearch
$('input[name="livesearch"]').search('.list_definition_ready', function(on) {
    var nofound = $('#nothingfound'),
        story_container = $('.story_container'),
        story_content = $(".story_content");

    on.reset(function(ui) {
        nofound.hide();
        story_container.hide();
        story_content.closest(".story_content").hide();
    });

    on.empty(function() {
        nofound.show();
        story_container.hide();
    });

    on.results(function(results) {
        nofound.hide();
        story_container.hide();
        var self = $(results).closest(".story_container").show(),
            element = self.find(".list_definition_ready"),
            r = element.length;

        story_content.closest(".story_content").hide();
        // show only matches
        for(var i = 0; i < r -1; i++) {
            if(results[i] instanceof HTMLDivElement) {
                $(results[i]).closest(".story_content").show();
            }
        }
    });
});