
var loadDraggable = function() {
  // draggable notes
  $(".note").draggable({
    containment: "#area-brainstorm",
    stop: function( event, ui ) {
        var noteId = this.dataset.id;
        var position = ui.position

        // save position of the note
        $.ajax({
          method: "POST",
          url: url.savePosition +'.json',
          data: { note_id: noteId, position: JSON.stringify(position) }
        }).success(function( data ) {
          console.log(data.status);
        })// ajax
      }
    });
};


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
        var note_id = data.note_id;

        html = '<li class="note new_note ui-draggable ui-draggable-handle" data-id='+ note_id +' style="top:0; left:0">' +
                  '<p>'+ msg.note_default_text +'</p>' +
                  '<hr>' +
                  '<p>Criado por: '+ person_name +'</p>' +
                  '<p>Criado em: '+  created_at +'</p>' +
                  //'<i class="icon-note icon-trash"></i>' +
               '</li>'

        $(".notes-container").prepend(html);
        loadDraggable();

      }
    });
});

//TODO: Deletar nota / soh o dono pode
//TODO: Editar nota / soh o dono pode



loadDraggable();

