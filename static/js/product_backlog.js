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
  	$(this).parent().find(".create_definition_ready").removeAttr("disabled");
  	$(this).parent().find(".story_points").removeAttr("disabled");
  	$(this).parent().find(".benefit").removeAttr("disabled");
    // get the coming new database ID and update in DOM
    $(this).attr("data-pk", value.database_id);
  	// changes the status of the created item for item update
    $(this).attr("data-update", true);
  }
});

// by clicking the button to add new item
$('#create_story').click(function(){
	var indiceItem = 1;

    var html = '<ul class="stories_container"><div class="stories"><a href="#" class="editable-click editable-empty story_card editable new_story" data-type="text" data-placeholder="Click para escrever" data-pk="'+projectID+'" data-name="stories">Click para escrever</a><button class="btn expand_story pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><select class="span1 pull-right benefit" name="size" id="size" disabled="disabled"><option value="" disabled selected>?</option><option value="P">P</option><option value="M">M</option><option value="G">G</option><option value="GG">GG</option></select><input class="span1 pull-right story_points" type="number" placeholder="?" min="1" disabled="disabled"><button class="btn btn-primary create_definition_ready pull-right" disabled="disabled">'+botonDefinitionReady+'</button></div><div class="stories_footer"></div></ul>';

    $("#stories").append(html);

    // I open the card after editing it creates
    setTimeout(function () {
       $(".new_story:last").trigger('click');
    }, 100);
});

// by clicking the button to add new item
$(document).on("click", ".create_definition_ready", function(){

    var story_id = $(this).parent().find(".story_card").attr("data-pk");

    var html = '<li class="definition_ready"><a href="#" class="editable-click editable-empty editable new_definition_ready" data-type="text" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="definition_ready">'+msg.field_empty+'</a><button class="btn expand_definition_ready pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><button class="btn comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment"></i></button><button class="btn plus_card pull-right" alt="Create Card" title="Create Card"><i class="icon-plus-sign"></i></button></li>';

    var newItem = $(this).parent().parent().append(html);

    setTimeout(function () {
       newItem.find(".new_definition_ready:last").trigger('click')
    }, 100);
    
});

// by clicking the button to expand content
$(document).on("click", ".expand_story", function(){
    $(this).parent().next(".definition_ready").toggle();
});

// clean values ​​that are not numbers
$(document).on("keydown", ".story_points", function(event){
	var key = window.event.keyCode || event.keyCode;
	return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || (key == 8) || (key == 9) || (key == 13));
});

// update Story Points
$(document).on("change", ".story_points", function(){
	var storyID = $(this).parent().find(".story_card").attr("data-pk");
	ajax(urlCreateUpdateBacklogItens+'?story_points='+this.value+'&id='+storyID, [''], 'target_ajax');
});

// update Benefit
$(document).on("change", ".benefit", function(){
	var storyID = $(this).parent().find(".story_card").attr("data-pk");
	ajax(urlCreateUpdateBacklogItens+'?benefit='+this.value+'&id='+storyID, [''], 'target_ajax');
});

// remove item
$(document).on("click", ".delete_item", function(){
  if(confirm(msg.confirm)) {
    var item = $(this).parent().find('a'),
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
        if(name === "stories") {
            $(item).parent().parent().fadeOut("slow", function() { $(this).remove() })
        } else if(name === "definition_ready") {
            $(item).parent().fadeOut("slow", function() { $(this).remove() })
        }

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