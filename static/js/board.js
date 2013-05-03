$(function() {

    // fixed status board
    var nav = $(".nav-status"),
        yOffset = nav.offset().top;
    $(window).scroll(function() {
        if ($(window).scrollTop() > yOffset) {
            nav.addClass("fixed-nav");
        } else {
           nav.removeClass("fixed-nav");
        }
    });

    // livesearch
    $('input[name="livesearch"]').search('.task', function(on) {
        var nofound = $('#nothingfound'),
            td = $('.table td'),
            ul = $('.table ul');

        on.reset(function(ui) {
            nofound.hide();
            td.show();
            ul.show();
        });

        on.empty(function() {
            nofound.show();
            td.hide();
            ul.hide();
        });

        on.results(function(results) {
            nofound.hide();
            td.hide();
            ul.hide();
            $(results).closest("td").show();
            $(results).closest("ul").show();
            $(results).closest("tr").find("td").show();
        });
    });

    // drag in drop
    $(".column_task").sortable({
        connectWith: ".column_task",
        placeholder: 'placeholder_item',
        delay: 200,
        revert: true,
        dropOnEmpty: true,
        start: function(event, ui) {
            var placeholder = $(ui.item).clone().css({
                opacity: "0.6",
                zIndex: "1"
            });
            $(".placeholder_item").css({
                height: placeholder.height(),
                marginBottom: "10px"
            });
            ui.placeholder.html(placeholder);

            var definition_ready_id = $(ui.item).closest('.item_container').attr('data-definitionready');
            $('body').data('definitionreadyid', definition_ready_id);
        },
        stop: function(event, ui) {
            var task = $(ui.item),
                result_task = validationTask("stop", task)

                // prevents the card being moved does not pass validation
            if (result_task === false) {
                return false
            }

        },
        receive: function(event, ui) {
            var task = $(ui.item),
                result_task = validationTask("", task)

                // prevents the card being moved does not pass validation
            if (result_task === false) {
                return false

            } else if (result_task === true) {
                setTimeout(function() {
                    updateStatusColumn($(ui.item))
                }, 1000); // Enable after 1000 ms.
            }
        }
    }).disableSelection();

});


// change task status block

function validationTask(action, task) {
    var old_df_id = $('body').data('definitionreadyid'),
        new_df_id = $(task).closest('.item_container').attr('data-definitionready'),
        status = $(task).closest('.column_task').attr('data-status'),
        owner = $(task).find('.user_card').attr('data-owner'),
        date = $(task).find('.calendar').val(),
        value = $(task).find('.task_item').text();

    if (old_df_id !== new_df_id) {
        // prevents send to a different definition of ready or different story
        if (action === "stop") {
            alert(msg.task_no_belong)
        }
        return false

    } else if ((date === undefined && status === "verification") || (date === undefined && status === "done")) {
        // prevents change status of undated tasks for "verification" or "done" status
        if (action === "stop") {
            alert(msg.task_undated)
        }
        return false

    } else if (value === msg.field_empty) {
        // verify if task value is empty
        if (action === "stop") {
            alert(msg.validation_error)
        }
        return false

    } else if (owner === undefined) {
        // prevents block change without the card being assigned to one of the team
        if (action === "stop") {
            alert(msg.card_assign)
        }
        return false

    } else {
        return true
    }

}


// change task status block

function updateStatusColumn(task) {
    var task = $(task),
        task_id = task.find('.task_item').attr('data-pk'),
        task_status = task.closest('.column_task').attr('data-status'),
        definitionready = task.closest('.item_container').attr('data-definitionready');

    // send to server
    ajax(url.changeAjaxItens + '?task_id=' + task_id + '&task_status=' + task_status + '&definitionready=' + definitionready, [''], 'target_ajax');
    // test server callback
    statusAction("status", task_status, task);
}


// remove task
$(document).on("click", ".delete_item", function() {
    if (confirm(msg.confirm)) {
        removeTask(this);
    }
});

function removeTask(element) {
    var task = $(element).closest(".card_container").find('.task_item'),
        pk = task.attr('data-pk'),
        name = task.attr('data-name'),
        definitionready = task.closest('.item_container').attr('data-definitionready');

    ajax(url.removeTask + '?pk=' + pk + '&name=' + name + '' + '&definitionready=' + definitionready + '', [''], 'target_ajax');
    statusAction("remove", "", task);
}


// check status
function statusAction(action, status, dom_element, dom_element2) {
    var message = $("#target_ajax").text();
    console.log(message)

    if (message.length > 0) {
        if (message === 'True') {
            // for tasks without a set date
            var console_msg = "";
            if (action === "date") {
                var task_date = $(dom_element).closest('.icons_card').find('.calendar').val();
                $(dom_element2).datepicker('hide').closest("#card_modal").find("#date_started").html(status);
                console.log(dom_element2);
                console.log(task_date);
                if (task_date === undefined) {
                    $(dom_element).closest('.icons_card').prepend('<span class="calendar"><i class="icon-calendar"></i></span>');
                }
                console_msg = "date status updated!"

            } else if (action === "remove") {
                $(dom_element).closest(".task_container").fadeOut("fast", function() {
                    $(this).remove()
                });
                console_msg = "remove OK!"

            } else if (action === "status") {
                var task_date = $(dom_element).find('.calendar').val();
                if (task_date === undefined && status === "inprogress") {
                    $(dom_element).find('.icons_card').prepend('<span class="calendar"><i class="icon-calendar"></i></span>');
                }
                console_msg = "move status updated!";

            } else if (action === "choose_owner") {
                var avatar_container = $(dom_element).closest('.task_container').find(".avatar_container");
                avatar_container.find('.user_card').remove();
                $(dom_element).find(".user_card").clone().appendTo(avatar_container);

                $(dom_element).closest(".task_container").find(".users_team").fadeOut();

                console_msg = "task owner updated!";

            } else if (action === "remove_owner") {
                var avatar_container = $(dom_element).closest('.task_container').find(".avatar_container");
                avatar_container.find('.user_card').remove();
                avatar_container.append('<button class="btn btn-nostyle user_card nonuser_card choose_owner"><i class="icon-plus"></i></button>');

                $(dom_element).closest(".task_container").find(".users_team").fadeOut();

                console_msg = "task owner removed!";
            }

            console.log(console_msg)

        } else if (message.length > 0 && message !== 'False') {
            console.log("entrou na equipe")

        } else if (message === 'False') {
            console.log("status updated ERROR!")
        }
        // Clean the return of ajax call
        $("#target_ajax").empty();
        // return message

    } else {
        console.log("waiting for reply...")
        setTimeout(function() {
            statusAction(action, status, dom_element, dom_element2)
        }, 300);
    }
}

// click expand story
$(document).on("click", ".expand_story", function() {
    var item = $(this),
        // custom class to expand / collapse tables of the same story
        story_id = item.closest(".table").attr("data-storyid");

    console.log(story_id)
    $(".story" + story_id).find(".item_container").fadeToggle("slow");
    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// by clicking the button to add Task
$(document).on("click", ".create_task", function() {

    var definition_ready_id = $(this).closest(".item_container").attr("data-definitionready"),
        html = '<ul class="task_container"><li class="task"><div class="avatar_container"><button class="btn btn-nostyle user_card nonuser_card choose_owner"><i class="icon-plus"></i></button></div><div class="card_container"><a href="#" class="editable-click editable-empty editable task_item new_task" data-type="textarea" data-placeholder="' + msg.field_empty + '" data-pk="' + definition_ready_id + '" data-name="task">' + msg.field_empty + '</a><div class="icons_card"><span class="delete_item icon-hover" ><i class="icon-trash"></i></span><span class="card-modal icon-hover" ><i class="icon-cog"></i></span></div></div><div class="clearfix"></div></li></ul>';

    var newItem = $(this).closest(".item_container").find(".todo").append(html);

    setTimeout(function() {
        newItem.find(".new_task:last").trigger('click');
    }, 100);

});


// =============
// PLUGIN HACKS
// =============

// modify style buttons
$.fn.editableform.buttons =
    '<button type="button" class="btn editable-cancel pull-left"><i class="icon-return-key"></i></button>' +
    '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

//apply editable to parent div
$('.table').editable({
    selector: 'a.editable',
    url: url.createUpdateBacklogItens,
    emptytext: msg.field_empty,
    params: function(params) {
        // sending parameters indicating whether the item is to upgrade or not
        // send the new ID as param
        var dbUpdate = $(this).attr("data-update"),
            dbID = $(this).attr("data-pk"),
            definitionready = $(this).closest('.item_container').attr('data-definitionready');

        if (dbUpdate) {
            params.dbUpdate = true;
            params.dbID = dbID;
        } else {
            params.dbUpdate = false;
            params.definitionready = definitionready;
        }
        return params;
    },
    validate: function(value) {
        if (value === '') return msg.validation_error;
    },
    success: function(value, response) {
        // get the coming new database ID and update in DOM
        $(this).attr("data-pk", value.database_id);
        // changes the status of the created item for item update
        $(this).attr("data-update", true);
    }
});


// =====
// CARD
// =====

$(document).on("click", ".choose_owner", function() {
    var item = $('.users_team'),
        project_id = $("#project_info").attr("data-project"),
        maskHeight = $(document).height(),
        maskWidth = $(window).width();
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

// open modal
$(document).on("click",".card-modal", function(){
    $("#card_modal").remove();
    var card_element = this,
        task_id = $(this).closest(".card_container").find(".task_item").attr("data-pk"),
        html = '<div id="card_modal" class="modal hide" data-task="'+task_id+'"><div class="row-fluid"><div id="modal_sidebar" class="span3"><div class="well sidebar-nav"><div id="member_modal"></div><ul class="nav nav-list"><li id="started_calendar"><a href="#">'+txt.activities+'<i class="icon-calendar"></i></a></li><li><a href="#">'+txt.attachments+'<i class="icon-paper-clip"></i></a></li><li><a href="#">'+txt.labels+'<i class="icon-tag"></i></a></li><li class="delete_item_modal"><a href="#">'+txt.delete_card+'<i class="icon-trash"></i></a></li></ul></div></div><div id="modal_content" class="span9"><button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button><div id="modal_title"></div><div id="modal_comment_box"></div></div></div></div>'

    $("body").append(html);
    var modal_element = $("#card_modal"),
        topModal = modal_element.offset().top + 100,
        date_element = $('#started_calendar');

    modal_element.css({"top":topModal}).prepend('<div class="loading"></div>');

    // loading modal content
    $.getJSON(url.card_modal+"?task_id="+task_id,
    function(data) {
            if (data === false) {
                alert(msg.no_team)

            } else {
                // console.log(data);
                var modal_content = $("#modal_content");
                html = '<div id="modal_title"><h3>'+data.task.title+'</h3><span id="date_started" class="color_light pull-right">'+data.task.started+'</span><span class="color_light pull-right">'+txt.started_in+':</span><div class="clearfix"></div></div>'
                // $("#modal_title").append(html);
                modal_content.append(html);
                $("#member_modal").html('<img src="'+data.user_relationship.avatar+'" /> <p>'+data.user_relationship.member_name+'</p><p id="modal_role_name" class="color_light">'+data.sharing.role_name+'</p>');
                date_element.attr('data-date',data.task.started);
                modal_element.modal('show').attr("data-task",task_id);
                // commentbox
                var comment_box = '<div id="modal_comment_box"><form id="send_comment" accept-charset="UTF-8" action="" method="POST"><textarea class="span12" id="new_comment" name="new_comment" placeholder="'+txt.type_message+'" rows="3" required></textarea><br><button class="btn btn-success" type="submit">'+button.comment+'</button></form></div>'
                modal_content.append(comment_box);
            }
        $(".loading").hide();
        // prevent link default
        var nav = modal_element.find(".nav");
        nav.click(function(e){
            e.preventDefault();
        });
        // remove task
        nav.find(".delete_item_modal").click(function(e){
            if (confirm(msg.confirm)) {
                removeTask(card_element);
                modal_element.modal('hide');
            }
        });
        $("form#send_comment").submit(function(e){
            e.preventDefault();
            // call function
            sendComments(this, project_data.project_id);
        });
        // call calendar plugin
        calendar(date_element, card_element);
    });
});

function calendar(date_element, card_element) {
    // datepicker
    var nowTemp = new Date(),
        now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0),
        sprint_started = new Date(date.sprint_started),
        sprint_ended = new Date(date.sprint_started),
        burndown = date.weeks * 7;

    sprint_ended.setDate(sprint_ended.getDate() + burndown);

    $(date_element).datepicker({
        format: 'dd/mm/yyyy',
        todayBtn: "linked",
        todayHighlight: true,
        autoclose: true,
        startDate: sprint_started,
        endDate: sprint_ended,
        pickerPosition: "top-left",
    }).on('changeDate', function(ev) {
        // call the function
        changeDate(ev.date, card_element, this);
    });

}

// update date of card
function changeDate(date, card_element, modal_element) {
    var task = $(modal_element),
        task_id = task.closest('#card_modal').attr('data-task');
        task_date = date.format("UTC:yyyy-mm-dd");

    ajax(url.changeAjaxItens + '?task_id=' + task_id + '&task_date=' + task_date, [''], 'target_ajax');
    // test server callback
    statusAction("date", date.format("UTC:dd/mm/yyyy"), card_element, modal_element);
}

function sendComments(element, project_id) {

    var dom_element = $(element),
        data_form = dom_element.serialize();
        data_form += '&project_id=' + project_id

    // ajax(url.card_comments + '?' + datas_form, [''], 'target_ajax');
    console.log(data_form);
    $.post(url.card_comments,
        data_form,
        function(data, status) {
            if(status === "success") {
            console.log(data);
            // empty textarea
                dom_element.find("#new_comment").val('');
                $("#modal_content").append('<hr /><div class="span12"><img class="pull-left" src="'+data.user_relationship.avatar+'" alt=""><div class="comment_content pull-left"><p><strong>'+data.user_relationship.member_name+'</strong><span class="color_light"> - '+data.sharing.role_name+'</span></p><p>'+data.comment+'</p></div></div><div class="clearfix"></div>');

            }
      //data contains the JSON object
      //textStatus contains the status: success, error, etc
    }, "json");
    // test server callback
    // statusAction("date", date.format("UTC:dd/mm/yyyy"), card_element, modal_element);

}
