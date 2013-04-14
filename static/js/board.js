$(function() {
    
    // fixed status card
    var nav = $('.nav-status');
    $(window).scroll(function () {
        if ($(this).scrollTop() > 236) {
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
    $( ".column_task" ).sortable({
            connectWith: ".column_task",
            placeholder: 'placeholder_item',
            delay:25,
            revert:true,
            dropOnEmpty: true,
            start: function( event, ui ) {
                var placeholder = $(ui.item).clone().css({opacity:"0.6",zIndex:"1"});
                $(".placeholder_item").css({height:placeholder.height(),marginBottom:"10px"});
                ui.placeholder.html(placeholder);

                var definition_ready_id = $(ui.item).closest('.item_container').attr('data-definitionready');
                $('body').data('definitionreadyid', definition_ready_id);
            },
            stop: function( event, ui ) {
                var task = $(ui.item),
                    old_df_id = $('body').data('definitionreadyid'),
                    new_df_id = task.closest('.item_container').attr('data-definitionready');
                    status = task.closest('.column_task').attr('data-status'),
                    date = task.find('input').val(),
                    value = task.find('.task_item').text();

                var result_task = verifyTask("stop",old_df_id, new_df_id, date, status, value)

                if(result_task === false) {
                  // prevents send to a different definition of ready or different story
                    return false
                }

            },            
            receive: function(event, ui) {
                var task = $(ui.item),
                    old_df_id = $('body').data('definitionreadyid'),
                    new_df_id = task.closest('.item_container').attr('data-definitionready');
                    status = task.closest('.column_task').attr('data-status'),
                    date = task.find('input').val(),
                    value = task.find('.task_item').text();

                var result_task = verifyTask("",old_df_id, new_df_id, date, status, value)

                if(result_task === false) {
                  // prevents send to a different definition of ready or different story
                    return false

                }else if(result_task === true) {
                    setTimeout(function () {
                        updateStatusColumn($(ui.item))
                    }, 1000); // Enable after 1000 ms.
                }
            }
    });

    // datepicker
    var nowTemp = new Date(),
        now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0),
        sprint_started = new Date(date.sprint_started),
        sprint_ended = new Date(date.sprint_started),
        burndown = date.weeks*7;

    sprint_ended.setDate(sprint_ended.getDate()+burndown);

    $(".started_calendar").datepicker({
        format: 'dd/mm/yyyy',
        todayBtn: "linked",
        todayHighlight: true,
        autoclose: true,
        startDate: sprint_started,
        endDate: sprint_ended,
        pickerPosition: "top-left",
        }).on('changeDate', function(ev) {
            // call the function
            changeDate(this, ev.date);
    });

    // for elements dynamically added
    $(document).on('focus',".new_calendar", function(){
        $(this).datepicker({
        format: 'dd/mm/yyyy',
        todayBtn: "linked",
        todayHighlight: true,
        autoclose: true,
        startDate: sprint_started,
        endDate: sprint_ended,
        pickerPosition: "top-left",
        }).on('changeDate', function(ev) {
            // call the function
            changeDate(this, ev.date);
        });
    })

});


// change task status block
function verifyTask(action, old_df_id, new_df_id, date, status, value){

    if(old_df_id !== new_df_id) {
        // prevents send to a different definition of ready or different story
        if(action==="stop"){
            alert(msg.task_no_belong)
        }
        return false
    
    }else if((date ==="" && status==="verification") || (date ==="" && status==="done")) {
        // prevents change status of undated tasks for "verification" or "done" status
        if(action==="stop"){
            alert(msg.task_undated)
        }
        return false

    }else if(value === msg.field_empty) {
        // verify if task value is empty
        if(action==="stop"){
            alert(msg.validation_error)
        }
        return false

    } else {
        return true
    }

}


// change task status block
function updateStatusColumn(task){
    var task = $(task),
        task_id = task.find('.task_item').attr('data-pk'),
        task_status = task.closest('.column_task').attr('data-status'),
        definitionready = task.closest('.item_container').attr('data-definitionready');

    // send to server
    ajax(url.changeAjaxItens+'?task_id='+task_id+'&task_status='+task_status+'&definitionready='+definitionready, [''], 'target_ajax');
    // test server callback
    statusAction("status", task_status, task);
}


// update date of card
function changeDate(item, date){
    var task = $(item),
    task_id = task.closest('.task_container').find(".task_item").attr('data-pk');
    date_server = date.format("UTC:yyyy-mm-dd"),
    task_value = task.closest('.task_container').find('.task_item').text();

    if(task_value ===msg.field_empty) {
        alert(msg.validation_error)
        return false

    } else {
        // send to server
        ajax(url.changeAjaxItens+'?task_id='+task_id+'&task_date='+date_server, [''], 'target_ajax');
        // test server callback
        statusAction("date", "", "");
    }

}

// remove item
$(document).on("click", ".delete_item", function(){
  if(confirm(msg.confirm)) {
    var task = $(this).closest(".card_container").find('.task_item'),
        pk = task.attr('data-pk'),
        name = task.attr('data-name'),
        definitionready = task.closest('.item_container').attr('data-definitionready');

    ajax(url.removeTask+'?pk='+pk+'&name='+name+''+'&definitionready='+definitionready+'', [''], 'target_ajax');
    statusAction("remove", "", task);
  }
});


// check status
function statusAction(action, task_status, task) {
    var message = $("#target_ajax").text();
    console.log(message)

  if (message.length > 0) {
    if(message === 'True') {
        // for tasks without a set date
        var console_msg = "";
        if(action ==="date") {
            var task_date = $(task).find('input').val();
            if(task_date ==="" && task_status==="inprogress") {
                var today = new Date();
                $(task).find('.started_date_text').val(today.format("UTC:dd/mm"));
            
            }
            console_msg = "date status updated!"

        }else if(action ==="remove") {
            $(task).closest(".task_container").fadeOut("fast", function(){ $(this).remove()});
            console_msg = "remove OK!"

        }else if(action ==="status") {
            console_msg = "move status updated!";
        }

        console.log(console_msg)

    } else if(message === 'False') {
        console.log("status updated ERROR!")
    }
    // Clean the return of ajax call
    $("#target_ajax").empty();
    // return message

  } else {
    console.log("waiting for reply...")
    setTimeout(function() {
        statusAction(action, task_status, task)
    }, 300);
  }
}

// click expand story
$(document).on("click", ".expand_story", function(){
    var item = $(this),
        // custom class to expand / collapse tables of the same story
        story_id = item.closest(".table").attr("data-storyid");
        
        console.log(story_id)
    $(".story"+story_id).find(".item_container").fadeToggle("slow");
    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// by clicking the button to add Task
$(document).on("click", ".create_task", function(){

    var definition_ready_id = $(this).closest(".item_container").attr("data-definitionready");

    var html = '<ul class="task_container"><li class="task"><div class="avatar_container"><img class="avatar_card" src="http://lorempixel.com/50/50/"></div><div class="card_container"><a href="#" class="editable-click editable-empty editable task_item new_task" data-type="textarea" data-placeholder="'+msg.field_empty+'" data-pk="'+definition_ready_id+'" data-name="task">'+msg.field_empty+'</a><div class="icons_card"><div class="date started_calendar new_calendar" data-date=""><input class="started_date_text" size="16" type="text" value="" readonly><span class="add-on calendar"><i class="icon-calendar"></i></span></div><div class="comment"><i class="icon-comment"></i><span>0</span></div><span class="delete_item" ><i class="icon-trash"></i></span></div></div><div class="clearfix"></div></li></ul>';

    var newItem = $(this).closest(".item_container").find(".todo").append(html);

    setTimeout(function () {
       newItem.find(".new_task:last").trigger('click');
    }, 100);
    
});

// =============
// PLUGIN HACKS
// =============

// modify style buttons
$.fn.editableform.buttons = 
 '<button type="button" class="btn editable-cancel pull-left"><i class="icon-return-key"></i></button>'+
  '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

//apply editable to parent div
$('.table').editable({
  selector: 'a',
  url: url.createUpdateBacklogItens,
  emptytext: msg.field_empty,
  params: function(params) {
      // sending parameters indicating whether the item is to upgrade or not
      // send the new ID as param
      var dbUpdate = $(this).attr("data-update"),
          dbID = $(this).attr("data-pk"),
          definitionready = $(this).closest('.item_container').attr('data-definitionready');

      if(dbUpdate) {
        params.dbUpdate = true;
        params.dbID = dbID;
      }else {
        params.dbUpdate = false;
        params.definitionready = definitionready;
      }
      return params;
  },
  validate: function(value) {
      if(value === '') return msg.validation_error;
  },
  success: function(value,response) {
  // get the coming new database ID and update in DOM
  $(this).attr("data-pk", value.database_id);
  // changes the status of the created item for item update
  $(this).attr("data-update", true);
  }
});

