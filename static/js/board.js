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
                var old_task_id = $('body').data('storyid');
                    new_task_id = $(ui.item).closest('.table').attr('data-storyid');

                if(new_task_id !== old_task_id) {
                    return false
                }
            },            
            receive: function(event, ui) {
                
                setTimeout(function () {
                    updateStatus($(ui.item))
                }, 1000); // Enable after 1000 ms.
            }
    });

    // datepicker
    var nowTemp = new Date(),
        now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0),
        sprintdate = new Date(date.sprint_started),
        date_burndown = new Date(date.sprint_started),
        burndown = date.weeks*7;

    date_burndown.setDate(date_burndown.getDate()+burndown);

    var checkout = $('.started_time').datepicker({
      onRender: function(date) {
        if (date.valueOf() <= sprintdate.valueOf() || date.valueOf() >= date_burndown.valueOf() ){
          return 'disabled';
        } else {
          return '';
        }
      }
    }).on('changeDate', function(ev) {
      checkout.hide();
    }).data('datepicker');



});


// update status
function updateStatus(item){
    var task_id = $(item).closest('.task_container').attr('data-taskid'),
        task_status = $(item).closest('.column_task').attr('data-status');
    
    ajax(url.changeAjaxItens+'?task_id='+task_id+'&task_status='+task_status, [''], 'target_ajax');
    statusItem();
}

// check status
function statusItem() {
    var message = $("#target_ajax").text();
    console.log(message)

  if (message.length > 0) {
    if(message === 'True') {
        console.log("status updated!")
   
    } else if(message === 'False') {
        console.log("status updated ERROR!")
    }
    // Clean the return of ajax call
    $("#target_ajax").empty();
    // return message

  } else {
    console.log("waiting for reply...")
    setTimeout(function() {
        statusItem()
    }, 300);
  }
}

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