/*
=================
 GENERAL CHANGES
=================
*/

// global
// OBS: other global variables are generated on the page project

var msg = {
    field_empty : "Click para escrever",
    erro : "Não pode ser vazio!",
    confirm : 'Você tem certeza que deseja continuar?',
};

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
  url: urlStory,
  emptytext: msg.field_empty,
  pk: projectID,
  validate: function(value) {
      if(value === '') return msg.erro;
  },
  success: function(value,response) {
  	$(this).parent().find(".create_definition_ready").removeAttr("disabled");
  	$(this).parent().find(".story_points").removeAttr("disabled");
  	$(this).parent().find(".benefit").removeAttr("disabled");
  	// write Story ID
  	$(this).attr("data-id",value.story_id)
  }
});

// by clicking the button to add new item
$('#create_story').click(function(){
	var indiceItem = 1;

    var html = '<ul class="stories_container"><div class="stories_header"><a href="#" class="editable-click editable-empty story_card new_story editable" data-type="text" data-placeholder="Click para escrever">Click para escrever</a><button class="btn expand_story pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_story pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><select class="span1 pull-right benefit" name="size" id="size" disabled="disabled"><option value="P" selected>P</option><option value="M">M</option><option value="G">G</option><option value="GG">GG</option></select><input class="span1 pull-right story_points" type="number" placeholder="?" min="1" disabled="disabled"><button class="btn btn-primary create_definition_ready pull-right" disabled="disabled">'+botonDefinitionReady+'</button></div><div class="stories_footer"></div></ul>';

    $("#stories").append(html);

    // I open the card after editing it creates
    setTimeout(function () {
       $(".new_story:last").trigger('click');
    }, 100);
});

// by clicking the button to add new item
$(document).on("click", ".create_definition_ready", function(){

    var html = '<li><a href="#" class="editable-click editable-empty new_definition_ready editable" data-type="text" data-placeholder="'+msg.field_empty+'" >'+msg.field_empty+'</a><button class="btn expand_definition_ready pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_definition_ready pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><button class="btn comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment"></i></button><button class="btn plus_card pull-right" alt="Create Card" title="Create Card"><i class="icon-plus-sign"></i></button></li>';

    var newItem = $(this).parent().next().append(html);

    setTimeout(function () {
       newItem.find(".new_definition_ready:last").trigger('click')
    }, 100);
    
    var data_story = $(this).parent().find(".story_card").attr("data-id");
    $(this).parent().next().find(".new_definition_ready").attr("data-url",urlDefinitionReady).attr("data-pk",data_story);
});

$(document).on("click", ".expand_story", function(){
    var definition_ready = $(this).parent().next(".stories_footer");
    definition_ready.toggle();
});

// clean values ​​that are not numbers
$(document).on("keydown", ".story_points", function(event){
	var key = window.event.keyCode || event.keyCode;
	return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || (key == 8) || (key == 9) || (key == 13));
});

// update Story Points
$(document).on("change", ".story_points", function(){
	var storyID = $(this).parent().find(".story_card").attr("data-id");
	ajax(urlUpdateStory+'?story_points='+this.value+'&id='+storyID, [''], 'target_ajax');
});

// update Benefit
$(document).on("change", ".benefit", function(){
	var storyID = $(this).parent().find(".story_card").attr("data-id");
	console.log(storyID)
	ajax(urlUpdateStory+'?benefit='+this.value+'&id='+storyID, [''], 'target_ajax');
});
