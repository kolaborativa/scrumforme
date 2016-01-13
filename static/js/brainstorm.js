
//$('#nota-teste').css({'top': 27, 'left' : 482});

// draggable notes
$( ".note" ).draggable({
  stop: function( event, ui ) {
      console.log('ui', ui);

      // grava a posicao da nota no banco
      console.log('elemento', this)
  }
});

// by clicking the button to add Task
$(document).on("click", ".add-note", function() {
  ajax(url.create_note + '?project_id='+ info.project_id +'&person_id='+ info.person_id, 'target_ajax');
  //TODO: separar CSS
  //TODO: criar a nota dinamicamente se gravar no banco antes (return status_ == true)
  //TODO: criar a nota dincamica de forma draggable
    //var definition_ready_id = $(this).closest(".item_container").attr("data-definitionready"),
        //html = '<ul class="task_container"><li class="task"><div class="avatar_container"><button class="btn btn-nostyle user_card nonuser_card choose_owner"><i class="icon-plus"></i></button></div><div class="card_container"><a href="#" class="editable-click editable-empty editable task_item new_task" data-type="textarea" data-placeholder="' + msg.field_empty + '" data-pk="' + definition_ready_id + '" data-name="task">' + msg.field_empty + '</a><div class="icons_card"><span class="delete_item icon-hover" ><i class="icon-trash"></i></span><span class="card-modal icon-hover" ><i class="icon-cog"></i></span></div></div><div class="clearfix"></div></li></ul>';

    // html => pegar Person name e data
    html = '<li class="note ui-draggable ui-draggable-handle"> <p>Seu texto</p> <hr> <p>Criado por: Diego Sorrilha</p><p>Criado em: 2016-01-12</p> </li>'

    var newItem = $(".notes-container").prepend(html);

    //setTimeout(function() {
    //    newItem.find(".new_note:first").trigger('click');
    //}, 100);
});
