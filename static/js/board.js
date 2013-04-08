$("document").ready(function($){
    
    var nav = $('.nav-status');
    
    $(window).scroll(function () {
        if ($(this).scrollTop() > 136) {
            nav.addClass("fixed-nav");
        } else {
            nav.removeClass("fixed-nav");
        }
    });

    // livesearch
    $('input[name="livesearch"]').search('.story_container .column', function(on) {
        on.reset(function() {
          $('#nothingfound').hide();
          $('.story_container .column').show();
        });

        on.empty(function() {
          $('#nothingfound').show();
          $('.story_container .column').hide();
        });

        on.results(function(results) {
          $('#nothingfound').hide();
          $('.story_container .column').hide();
          results.show();
        });
    });
 
    $( ".column" ).sortable({
        connectWith: ".statusboard",
        placeholder: "placeholder",
        delay: 100,
        forcePlaceholderSize: true,
        start: function( event, ui ) {
            var placeholder = $(ui.item).clone().css({opacity:"0.6"});
            ui.placeholder.html(placeholder);

            ui.item.addClass( "moving_item" );
        },
        stop: function( event, ui ) {
            ui.item.removeClass( "moving_item" );
        },
        receive: function(event, ui) {
            updateStatus($(ui.item))
        },
    });
});


// update status
function updateStatus(item){
    var task_id = $(item).closest('.task').attr('data-taskid'),
        task_status = $(item).closest('.column').attr('data-taskstatus');
    
    ajax(url.changeAjaxItens+'?task_id='+task_id+'&task_status='+task_status, [''], 'target_ajax');
    var status = statusItem();
    
    if(status === true){
        console.log("status updated!")
    }else {
        console.log("status updated ERROR!")
    }
}

// check status
function statusItem() {
    var message = $("#target_ajax").text();
    console.log(message)

  if (message.length > 0) {
    if(message === 'True') {
   
    }

  } else {
    console.log("waiting for reply...")
    setTimeout(function() {
        statusItem()
    }, 300);
  }
    // Clean the return of ajax call
    $("#target_ajax").empty();
    return true
}