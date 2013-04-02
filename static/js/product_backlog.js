/*
=================
 GENERAL CHANGES
=================
*/

// modify style buttons
$.fn.editableform.buttons = '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

/*
=============================
 ITEMS GENERATED DYNAMICALLY
=============================
*/

//apply editable to parent div
$('#stories').editable({
  selector: 'a',
  url: urlCreateUpdateBacklogItens,
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
  	$(this).closest(".stories").find(".create_definition_ready").removeAttr("disabled");
  	$(this).closest(".stories").find(".story_points").removeAttr("disabled");
    $(this).closest(".stories").find(".benefit").removeAttr("disabled");
  	$(this).closest(".stories").find(".create_task").removeAttr("disabled");
    // get the coming new database ID and update in DOM
    $(this).attr("data-pk", value.database_id);
  	// changes the status of the created item for item update
    $(this).attr("data-update", true);
  }
});

// by clicking the button to add Story
$('#create_story').click(function(){
	var indiceItem = 1;

    var html = '<ul class="stories_container"><li class="stories"><div class="stories_header"><div class="text_container"><a href="#" class="editable-click editable-empty story_card editable new_story" data-type="text" data-placeholder="Click para escrever" data-pk="'+projectID+'" data-name="story">Click para escrever</a></div><div class="buttons_container"><button class="btn expand_story pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><select class="pull-right benefit" name="size" id="size" disabled="disabled"><option value="" disabled selected>?</option><option value="P">P</option><option value="M">M</option><option value="G">G</option><option value="GG">GG</option></select><input class="pull-right story_points" type="number" placeholder="?" min="1" disabled="disabled"><button class="btn create_definition_ready pull-right" disabled="disabled">+ '+botonDefinitionReady+'</button></div><div class="clearfix"></div></div></li></ul>';

    $("#stories").append(html);

    // I open the card after editing it creates
    setTimeout(function () {
       $(".new_story:last").trigger('click');
    }, 100);
});

// by clicking the button to add Definition of Ready
$(document).on("click", ".create_definition_ready", function(){

    var story_id = $(this).closest(".stories").find(".story_card").attr("data-pk");

    var html = '<ul><li class="definition_ready_container"><div class="definition_ready"><div class="text_container"><a href="#" class="editable-click editable-empty definition_ready_card editable new_definition_ready" data-type="text" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="definition_ready">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn expand_definition_ready pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><button class="btn create_task pull-right" alt="Create Task" title="Create Task" disabled="disabled">+ '+botonTask+'</button></div></div></li></ul>';

    var newItem = $(this).closest(".stories").append(html);

    setTimeout(function () {
       newItem.find(".new_definition_ready:last").trigger('click')
    }, 100);
    
});

// by clicking the button to add Task
$(document).on("click", ".create_task", function(){

    var story_id = $(this).closest(".definition_ready_container").find(".definition_ready_card").attr("data-pk");

    var html = '<ul class="item_container zebra_row"><li class="task"><div class="text_container"><a href="#" class="editable-click editable-empty editable new_task" data-type="text" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="task">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><button class="btn comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment"></i></button></div></li></ul>';

    var newItem = $(this).closest(".definition_ready_container").append(html);

    setTimeout(function () {
       newItem.find(".new_task:last").trigger('click')
    }, 100);
    
});

// to expand story content
$(document).on("click", ".expand_story", function(){
    $(this).closest(".stories").find(".definition_ready_container").toggle();
});

// to expand definition_ready content
$(document).on("click", ".expand_definition_ready", function(){
    $(this).closest(".definition_ready_container").find(".task").toggle();
});

// clean values ​​that are not numbers
$(document).on("keydown", ".story_points", function(event){
	var key = window.event.keyCode || event.keyCode;
	return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || (key == 8) || (key == 9) || (key == 13));
});

// update Story Points
$(document).on("change", ".story_points", function(){
	var storyID = $(this).closest(".stories").find(".story_card").attr("data-pk");
	ajax(urlCreateUpdateBacklogItens+'?story_points='+this.value+'&id='+storyID, [''], 'target_ajax');
});

// update Benefit
$(document).on("change", ".benefit", function(){
	var storyID = $(this).closest(".stories").find(".story_card").attr("data-pk");
	ajax(urlCreateUpdateBacklogItens+'?benefit='+this.value+'&id='+storyID, [''], 'target_ajax');
});

// remove item
$(document).on("click", ".delete_item", function(){
  if(confirm(msg.confirm)) {
    var item = $(this).closest(".item_container").find('a'),
        pk = item.attr('data-pk'),
        name = item.attr('data-name');

    removeItem(pk,name,item,true);
  }
});

// for remove itens
function removeItem(pk,name,item,remove) {
  ajax(urlRemoveBacklogItens+'?pk='+pk+'&name='+name+'', [''], 'target_ajax');
  var status = statusItem(pk,name,item,remove);
  if(status === true) {
    return true
  } else {
    return false
  }
}

function statusItem(pk,name,item,remove) {
  // The fourth parameter tells whether the element will be deleted in the DOM
  var message = $("#target_ajax").text();

  if (message.length > 0) {
    if(message === 'True') {
      var msg_text = msg.remove_sucess,
      msg_type = msg.type_success;
      
      if(remove===true) {
        // find element to be deleted
        $(item).closest(".item_container").fadeOut("slow", function() { $(this).remove() });

      } else if(remove===false) {
        msg_text = "Movido com Sucesso!";
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
        statusItem(pk,name,item,remove)
    }, 300);
  }
  // Clean the return of ajax call
  $("#target_ajax").empty();
  return true
}