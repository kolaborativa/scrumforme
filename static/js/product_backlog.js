/*
=================
 GENERAL CHANGES
=================
*/

// modify style buttons
$.fn.editableform.buttons = 
 '<button type="button" class="btn editable-cancel pull-left"><i class="icon_back"></i></button>'+
  '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

/*
=============================
 ITEMS GENERATED DYNAMICALLY
=============================
*/

//apply editable to parent div
$('.content').editable({
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
    // enables the buttons
    var story = $(this).closest(".story");

    if(value.name === "story") {
        story.find(".new_story").removeClass("new_story");
        story.find(".create_definition_ready").removeAttr("disabled");
        story.find(".story_points").removeAttr("disabled");
        story.find(".benefit").removeAttr("disabled");
        story.find(".expand_story").removeAttr("disabled");
        $(this).closest(".story_container").find(".send_story_sprint").removeAttr("disabled");
    
    }else if(value.name === "definition_ready") {
        var label_DR = story.find(".qtd_definition_ready").text();
        story.find(".qtd_definition_ready").text(parseInt(label_DR)+1);
        story.find(".create_task").removeAttr("disabled");
    }else if(value.name === "task") {
        $(this).closest(".definition_ready_container").find(".expand_definition_ready").removeAttr("disabled");
    }

    // get the coming new database ID and update in DOM
    $(this).attr("data-pk", value.database_id);
    // changes the status of the created item for item update
    $(this).attr("data-update", true);
  }
});

// by clicking the button to add Story
$('#create_story').click(function(){
    // $(this).closest(".story_container").find(".buttons_footer").fadeToggle("fast", "linear");
    var indiceItem = 1;

    var html = '<ul class="story_container item_container"><li class="story"><div class="story_header"><div class="text_container"><a href="#" class="editable-click editable-empty story_card editable new_story" data-type="textarea" data-placeholder="Click para escrever" data-pk="'+projectID+'" data-name="story">Click para escrever</a></div><div class="buttons_container"><button class="btn expand_story pull-right" alt="'+title.expand+'" title="'+title.expand+'" disabled="disabled"><i class="icon-arrow-down"></i></button><button class="btn delete_item pull-right" alt="'+title.remove+'" title="'+title.remove+'"><i class="icon-trash"></i></button><select class="pull-right benefit" alt="'+title.benefit+'" title="'+title.benefit+'" disabled="disabled"><option value="" disabled selected>?</option><option value="P">P</option><option value="M">M</option><option value="G">G</option><option value="GG">GG</option></select><input class="pull-right story_points only_numbers" type="number" placeholder="?" min="1" alt="'+title.points+'" title="'+title.points+'" disabled="disabled"><button class="btn create_definition_ready pull-right" alt="'+title.create_DR+'" title="'+title.create_DR+'" disabled="disabled">+ '+buttons.DR+'</button><span class="label qtd_definition_ready pull-right tip-bottom" alt="'+title.label_DR+'" title="'+title.label_DR+'">0</span></div><div class="clearfix"></div></div></li><div class="buttons_footer new_buttons_footer"><button class="btn btn-primary pull-right send_story_sprint" disabled="disabled">'+buttons.send_sprint+' <i class="icon-circle-arrow-right icon-white"></i></button><div class="clearfix"></div></div></ul>';

    $(".story_block").append(html);

    // I open the card after editing it creates
    setTimeout(function () {
       $(".new_story:last").trigger('click');
    }, 100);
});

// by clicking the button to add Definition of Ready
$(document).on("click", ".create_definition_ready", function(){
    $(this).closest(".story").find(".definition_ready_container").slideDown("slow");
    $(this).closest(".story_container").find(".buttons_footer").fadeIn("fast", "linear");
    var story_id = $(this).closest(".story").find(".story_card").attr("data-pk");

    var html = '<ul class="item_container"><li class="definition_ready_container new_definition_ready_container"><div class="definition_ready"><div class="text_container"><span class="label" style="margin-right: 4px;" alt="'+title.label_DR+'" title="'+title.label_DR+'">'+buttons.DR+' </span><a href="#" class="editable-click editable-empty definition_ready_card editable new_definition_ready" data-type="textarea" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="definition_ready">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn expand_definition_ready pull-right" alt="'+title.expand+'" title="'+title.expand+'" disabled="disabled"><i class="icon-arrow-down"></i></button><button class="btn delete_item pull-right" alt="'+title.remove+'" title="'+title.remove+'"><i class="icon-trash"></i></button><button class="btn create_task pull-right" alt="'+title.task+'" title="'+title.task+'" disabled="disabled">+ '+buttons.task+'</button></div><div class="clearfix"></div></div></li></ul>';

    var newItem = $(this).closest(".story").append(html);

    setTimeout(function () {
       newItem.find(".new_definition_ready:last").trigger('click')
    }, 100);
    
});

// by clicking the button to add Task
$(document).on("click", ".create_task", function(){

    var story_id = $(this).closest(".definition_ready_container").find(".definition_ready_card").attr("data-pk");

    var html = '<ul class="item_container zebra_row"><li class="task"><div class="text_container"><a href="#" class="editable-click editable-empty editable new_task" data-type="textarea" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="task">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-trash"></i></button><button class="btn comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment"></i></button></div><div class="clearfix"></div></li></ul>';

    var newItem = $(this).closest(".definition_ready_container").append(html);

    setTimeout(function () {
       newItem.find(".new_task:last").trigger('click')
    }, 100);
    
});

// to expand story content
$(document).on("click", ".expand_story", function(){
    $(this).closest(".story").find(".definition_ready_container").slideToggle("slow");
    $(this).closest(".story_container").find(".buttons_footer").fadeToggle("fast", "linear");
});

// to expand definition_ready content
$(document).on("click", ".expand_definition_ready", function(){
    $(this).closest(".definition_ready_container").find(".task").fadeToggle("fast", "linear");
});

// clean values ​​that are not numbers
$(document).on("keydown", ".only_numbers", function(event){
    var key = window.event.keyCode || event.keyCode;
    return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || (key == 8) || (key == 9) || (key == 13));
});

// update Story Points
$(document).on("change", ".story_points", function(){
    var story = $(this).closest(".story"),
        storyID = story.find(".story_card").attr("data-pk");
    ajax(url.changeAjaxItens+'?story_points='+this.value+'&story_id='+storyID, [''], 'target_ajax');
    statusItem("","",false);
});

// update Benefit
$(document).on("change", ".benefit", function(){
    var story = $(this).closest(".story"),
        storyID = story.find(".story_card").attr("data-pk");
    ajax(url.changeAjaxItens+'?benefit='+this.value+'&story_id='+storyID, [''], 'target_ajax');
    var status = statusItem("","",false);

    if(status) {
        var initialValue = story.find('.benefit option:first-child').text(),
            options = story.find(":selected").text();
        if(initialValue === "?") {
            story.find('.benefit option:first-child').removeAttr("selected");
        }
        story.find('.benefit option[value='+options+']').attr('selected', 'selected');
    }

});

// send story to sprint
$(document).on("click", ".send_story_sprint", function(){
    var object = $(this).closest(".story_container"),
        storyID = object.find(".story_card").attr("data-pk"),
    sprintID = $(".sprint").attr("data-sprint");
    
    ajax(url.changeAjaxItens+'?name=sprint&sprint_id='+sprintID+'&story_id='+storyID, [''], 'target_ajax');
    statusItem(object,"sprint",false);
});

// back story to backlog
$(document).on("click", ".back_backlog", function(){
    var object = $(this).closest(".story_container"),
        storyID = object.find(".story_card").attr("data-pk"),
    sprintID = $(".sprint").attr("data-sprint");
    
    ajax(url.changeAjaxItens+'?name=backlog&sprint_id='+storyID+'&story_id='+storyID, [''], 'target_ajax');
    statusItem(object,"backlog",false);
});

// remove item
$(document).on("click", ".delete_item", function(){
  if(confirm(msg.confirm)) {
    var object = $(this).closest(".item_container").find('a'),
        pk = object.attr('data-pk'),
        name = object.attr('data-name');

    removeItem(pk,name,object,true);
  }
});

// for remove itens
function removeItem(pk,name,object,remove) {
    ajax(url.removeBacklogItens+'?pk='+pk+'&name='+name+'', [''], 'target_ajax');
    var status = statusItem(object,"",remove);
    
    if(status === true) {
        // get total number of Definitions of Ready and decreases
        if(name === "definition_ready") {
            var label_DR = $(object).closest(".story").find(".qtd_definition_ready");
            label_DR.text(parseInt(label_DR.text())-1);
        }
    }
}

function statusItem(object,item,remove) {
  // The first parameter tells whether the element will be deleted in the DOM
    var message = $("#target_ajax").text();
    console.log(message)

  if (message.length > 0) {
    if(message === 'True') {
      var msg_text = msg.remove_sucess,
      msg_type = msg.type_success;
      
      if(remove===true) {
        // find element to be deleted
        $(object).closest(".item_container").fadeOut("fast", function() { $(this).remove() });

      } else if(remove===false) {
        msg_text = "Movido com Sucesso!";
        if(item==="sprint") {
        // move story to sprint
            var button = '<button class="btn btn-danger pull-right back_backlog"><i class="icon-circle-arrow-left icon-white"></i> '+buttons.back_backlog+'</button><div class="clearfix"></div></div>',
                story = $(object).clone().appendTo('.sprint').find(".buttons_footer").empty().fadeIn("fast", function() { $(this).append(button) });
            $(object).fadeOut("fast", function() { $(this).remove() });

        } else if(item==="backlog") {
        // move story to backlog
            var button = '<button class="btn btn-primary pull-right send_story_sprint">'+buttons.send_sprint+' <i class="icon-circle-arrow-right icon-white"></i></button><div class="clearfix"></div>',
                story = $(object).clone().appendTo('.story_block').find(".buttons_footer").empty().fadeIn("fast", function() { $(this).append(button) });
            $(object).fadeOut("fast", function() { $(this).remove() });

        }
      }

    } else if(message === "False") {
      msg_text = msg.remove_error;
      msg_type = msg.type_error;
    }


    // notifiction
    // $.pnotify({
    //   title: msg.titulo_cartao,
    //   text: msg_text,
    //   type: msg_type
    // });

  } else {
    console.log("waiting for reply...")
    setTimeout(function() {
        statusItem(object,item,remove)
    }, 300);
  }
  // Clean the return of ajax call
  $("#target_ajax").empty();
  return true
}