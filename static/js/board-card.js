// =====
// CARD
// =====

$(document).on("click", ".choose_owner", function() {
    var item = $('.users_team'),
        project_id = $("#project_info").attr("data-project"),
        maskHeight = $(document).height(),
        maskWidth = $(window).width() - 100;
    // add mask
    $('#mask').css({'width':maskWidth,'height':maskHeight});
    $('#mask').show();

    if ($(item).is(":visible")) {
        $(item).fadeOut(); // hide button
        $('#mask').hide();
        return
    } else {
        $(this).closest(".task_container").find(".users_team").fadeIn();
    }

    // call team members ajax
    teamMembers($(this));
});

$('#mask').click(function () {
    $(this).hide();
    var item = $('.users_team'),
        target = $(event.target).closest(".users_team");

    if (target.is(".users_team")) {
        return
    } else if ($(item).is(":visible")) {
        $(item).fadeOut(); // hide button
    }
});

function teamMembers(element) {
    $(element).closest(".task_container").find(".users_team").remove();
    var self = $(element),
        html = "";

    $(element).closest(".task_container").find(".card_container").append('<div class="users_team"><div class="loading"></div></div>');
    // positioning
    var offset = $(element).closest(".task_container").offset();

    var teamPosition = $(".users_team").outerWidth() + offset.left,
        teamPlacement = offset.left - $(".users_team").outerWidth() - 40;

    if(teamPosition > $(window).width()) {
        $(".users_team").css({left:teamPlacement,top:offset.top});

    } else {
        $(".users_team").css({lef:offset.left,top:offset.top});
    }

    $.getJSON(url.team_project,
    function(data) {
        if (data === "no_role" || data === "no_team") {
            html += '<h5>' + msg[i] + '</h5>'
            html += '<a href="' + url.team_page + '" class="btn btn-primary btn-mini">' + txt.team_page + '</a>';

        } else {
            for (i in data) {
                    html += '<div class="media project_member" data-person="' + data[i]["person_id"] + '"><img class="user_card choose_owner pull-left" src="' + data[i]["avatar"] + '" data-owner="true"><div class="media-body"><h5 class="media-heading">' + data[i]["person_name"] + '</h5><h6>' + data[i]["person_role"] + '</h6></div></div>'
            }
            html += '<div class="media project_member" data-person="remove"><button class="project_member btn btn-nostyle user_card nonuser_card choose_owner pull-left"><i class="icon-remove"></i></button><div class="media-body"><h5 class="media-heading">Remove</h5></div></div>'
        }
        $(".loading").hide();
        self.closest(".task_container").find(".users_team").append(html);
    });
}

// edit owner task
$(document).on("click", ".project_member", function() {
    var task = $(this).closest(".card_container").find('.task_item'),
        alredy_exist = task.attr('data-update'),
        task_id = task.attr('data-pk'),
        person_id = $(this).attr('data-person');

    if(person_id === "remove") {
        console.log(alredy_exist);
        ajax(url.edit_owner_task + '?task_id=' + task_id + '&person_id=' + person_id, [''], 'target_ajax');
        statusAction("remove_owner", "", $(this));
        return
    }

    if (alredy_exist === undefined) {
        alert(msg.task_no_exist)
    } else {
        ajax(url.edit_owner_task + '?task_id=' + task_id + '&person_id=' + person_id, [''], 'target_ajax');
        statusAction("choose_owner", "", $(this));
    }

});