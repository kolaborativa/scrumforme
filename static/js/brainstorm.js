
//$('#nota-teste').css({'top': 27, 'left' : 482});

// draggable notes


// by clicking the button to add Note
$(document).on("click", ".add-note", function() {
  $.ajax({
    method: "POST",
    url: url.create_note +'.json',
    data: { project_id: info.project_id, person_id: info.person_id }
  })
    .success(function( data ) {
      if (data.status) {
        var person_name = data.person_name;
        var created_at = new Date(data.created_at).format("UTC:dd/mm/yyyy");

        html = '<li class="note new_note ui-draggable ui-draggable-handle">' +
                  '<p>'+ msg.note_default_text +'</p>' +
                  '<hr>' +
                  '<p>Criado por: '+ person_name +'</p>' +
                  '<p>Criado em: '+  created_at +'</p>' +
               '</li>'

        $(".notes-container").prepend(html);
        loadDraggable();

      }
    });

  //TODO: limitar a area de drag


});

var loadDraggable = function() {
  $(".note").draggable({
    stop: function( event, ui ) {
        console.log('ui', ui);

        // grava a posicao da nota no banco
        console.log('elemento', this)
    }
  });
};

loadDraggable();

