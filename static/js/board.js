$(function() {
    // fixed status board
    $('.nav-status').floatfixed({
        // scrollOffsetTopx: 100,
        scrollTopSpeed: 700,
        leftx: $('.nav-status').offset().left,
        scrollClass: "icon-chevron-up icon-white"
    });

});
    // drag in drop
    var sortableOptions = {
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
        }
    $(".column_task").sortable(sortableOptions).disableSelection();




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
    ajax(url.move_tasks + '?task_id=' + task_id + '&task_status=' + task_status + '&definitionready=' + definitionready + '&project_id=' + info.project_id, [''], 'target_ajax');
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

    ajax(url.removeTask + '?pk=' + pk + '&name=' + name + '' + '&definitionready=' + definitionready + '&project_id=' + info.project_id, [''], 'target_ajax');
    statusAction("remove", "", task);
}


// check status
function statusAction(action, status, dom_element) {
    var message = $("#target_ajax").text();
    console.log(message)

    if (message.length > 0) {
        if (message === 'True') {
            // for tasks without a set date
            var console_msg = "";
            if (action === "remove") {
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
            statusAction(action, status, dom_element)
        }, 300);
    }
}

// click expand story
$(document).on("click", ".expand_story", function() {
    var item = $(this),
        // custom class to expand / collapse tables of the same story
        story_id = item.closest(".table").attr("data-storyid");

    $(".story" + story_id).find(".item_container").fadeToggle("slow");
    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// click close all stories
$(".close_all_stories").click(function() {
    var element = $(".item_container");

    if (element.is(":visible")) {
        element.fadeOut("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");
    }
});

// expand close all stories
$(".expand_all_stories").click(function() {
    var element = $(".item_container");

    if (element.is(":hidden")) {
        element.fadeIn("slow");
        $(".expand_story").find("i").removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");
    }
});

// by clicking the button to add Task
$(document).on("click", ".create_task", function() {

    var definition_ready_id = $(this).closest(".item_container").attr("data-definitionready"),
        html = '<ul class="task_container"><li class="task"><div class="avatar_container"><button class="btn btn-nostyle user_card nonuser_card choose_owner"><i class="icon-plus"></i></button></div><div class="card_container"><a href="#" class="editable-click editable-empty editable task_item new_task" data-type="textarea" data-placeholder="' + msg.field_empty + '" data-pk="' + definition_ready_id + '" data-name="task">' + msg.field_empty + '</a><div class="icons_card"><span class="delete_item icon-hover" ><i class="icon-trash"></i></span><span class="card-modal icon-hover" ><i class="icon-cog"></i></span></div></div><div class="clearfix"></div></li></ul>';

    var newItem = $(this).closest(".item_container").find(".todo").prepend(html);

    setTimeout(function() {
        newItem.find(".new_task:first").trigger('click');
    }, 100);
});

function realtimeUpdateTak(element) {
    // var element = $(element),
        // definition_ready_id = element.closest(".item_container").attr("data-definitionready"),
    var html = '<ul class="task_container"><li class="task"><div class="avatar_container"><button class="btn btn-nostyle user_card nonuser_card choose_owner"><i class="icon-plus"></i></button></div><div class="card_container"><a href="#" class="editable-click editable-empty editable task_item new_task" data-type="textarea" data-placeholder="' + "msg.field_empty" + '" data-pk="' + "definition_ready_id" + '" data-name="task">' + "msg.field_empty" + '</a><div class="icons_card"><span class="delete_item icon-hover" ><i class="icon-trash"></i></span><span class="card-modal icon-hover" ><i class="icon-cog"></i></span></div></div><div class="clearfix"></div></li></ul>',
        newItem = $(".item_container").find(".todo").prepend(html);

    // setTimeout(function() {
        // newItem.find(".new_task:first").trigger('click');
    // }, 100);

}


