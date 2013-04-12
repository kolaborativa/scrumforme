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

                var task_id = $(ui.item).closest('.table').attr('data-storyid');
                $('body').data('storyid', task_id);
            },
            stop: function( event, ui ) {
                var task = $(ui.item),
                    old_task_id = $('body').data('storyid'),
                    new_task_id = task.closest('.table').attr('data-storyid');
                    task_status = task.closest('.column_task').attr('data-status'),
                    task_date = task.find('input').val();

                // prevents send to a different definition of ready or different story
                if(new_task_id !== old_task_id) {
                    return false
                }

                // prevents task undated verification for status or done
                if(task_date ==="" && task_status==="verification") {
                    alert(msg.task_undated)
                    return false
                }else if(task_date ==="" && task_status==="done") {
                    alert(msg.task_undated)
                    return false
                }

            },            
            receive: function(event, ui) {
                
                setTimeout(function () {
                    updateStatusColumn($(ui.item))
                }, 1000); // Enable after 1000 ms.
            }
    });

    // datepicker
    var nowTemp = new Date(),
        now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0),
        sprint_started = new Date(date.sprint_started),
        sprint_ended = new Date(date.sprint_started),
        burndown = date.weeks*7;

    sprint_ended.setDate(sprint_ended.getDate()+burndown);

    $('.started_calendar').datepicker({
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

});


// change task status block and verify if date exist
function updateStatusColumn(task){
    var task = $(task),
        task_id = task.find('.task_item').attr('data-pk'),
        task_status = task.closest('.column_task').attr('data-status');

    // send to server
    ajax(url.changeAjaxItens+'?task_id='+task_id+'&task_status='+task_status, [''], 'target_ajax');
    // test server callback
    statusAction("date", task_status, task);
}


// update date of card
function changeDate(item, date){
    var task = $(item),
    task_id = task.closest('.task_container').find(".task_item").attr('data-pk');
    date_server = date.format("UTC:yyyy-mm-dd");

    // send to server
    ajax(url.changeAjaxItens+'?task_id='+task_id+'&task_date='+date_server, [''], 'target_ajax');
    // test server callback
    statusAction("date", "", "");
}

// remove item
$(document).on("click", ".delete_item", function(){
  if(confirm(msg.confirm)) {
    var task = $(this).closest(".card_container").find('.task_item'),
        pk = task.attr('data-pk'),
        name = task.attr('data-name');

    ajax(url.removeTask+'?pk='+pk+'&name='+name+'', [''], 'target_ajax');
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
        if(action ==="date") {
            var task_date = $(task).find('input').val();
            if(task_date ==="" && task_status==="inprogress") {
                var today = new Date();
                $(task).find('.started_date_text').val(today.format("UTC:dd/mm"));
            
            }
            console.log("date status updated!")

        }else if(action ==="remove") {
            $(task).closest(".task_container").remove();
            console.log("remove OK!")
        }

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
    $(".story"+story_id).find(".item_container").slideToggle("fast");
    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// by clicking the button to add Task
// $(document).on("click", ".create_task", function(){

//     var story_id = $(this).closest(".table").attr("data-pk");

//     var html = '<ul class="item_container zebra_row"><li class="task"><div class="text_container"><a href="#" class="editable-click editable-empty editable new_task" data-type="textarea" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="task">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-trash"></i></button><button class="btn btn-minimize comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment-custom"><span>0</span></i></button></div><div class="clearfix"></div></li></ul>';

//     var newItem = $(this).closest(".definition_ready_container").append(html);

//     setTimeout(function () {
//        newItem.find(".new_task:last").trigger('click')
//     }, 100);
    
// });

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
          dbID = $(this).attr("data-pk");
      if(dbUpdate) {
        params.dbUpdate = true;
        params.dbID = dbID;
      }else {
        params.dbUpdate = false;
      }
      return params;
  },
  validate: function(value) {
      if(value === '') return msg.validation_error;
  },
  success: function(value,response) {

  }
});

