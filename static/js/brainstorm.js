
var loadDraggable = function() {
  // draggable notes

  $(".note").draggable({
    containment: "#area-brainstorm",
    stop: function( event, ui ) {
        console.log('ui', ui);

        // TODO: GRAVAR POSICAO no banco de dados. Id da nota e json de posicao
        // TODO: colocar o id da nota, na nota criada dinamicamente
        var noteId = this.dataset.id;
        var position = ui.position
        console.log('noteId', noteId)
        console.log('position', position)


        ////////////extrair em uma funcao?
        $.ajax({
          method: "POST",
          //url: url.savePosition +'.json',
          url: 'http://localhost:8000/scrumforme/default/_save_position.json',
          data: { note_id: noteId, position: JSON.stringify(position) }
        })
          .success(function( data ) {
            console.log('posicao salva');
            console.log('data', data);
            //if (data.status) {
            //  var person_name = data.person_name;
            //  var created_at = new Date(data.created_at).format("UTC:dd/mm/yyyy");
            //
            //  html = '<li class="note new_note ui-draggable ui-draggable-handle">' +
            //            '<p>'+ msg.note_default_text +'</p>' +
            //            '<hr>' +
            //            '<p>Criado por: '+ person_name +'</p>' +
            //            '<p>Criado em: '+  created_at +'</p>' +
            //         '</li>'
            //
            //  $(".notes-container").prepend(html);
            //  loadDraggable();
            //
            //}
          }) // ajax
          ////////////extrair em uma funcao?

      }

    });
};


//$('#nota-teste').css({'top': 27, 'left' : 482});


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
});


loadDraggable();

