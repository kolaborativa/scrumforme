
var loadDraggable = function() {
  // draggable notes
  $(".note--panel").draggable({
    containment: "#area-brainstorm",
    stack: ".note--panel",
    cursor: "move",
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


///////// teste drag
$("#note").draggable({ //mudar para note-add
    containment: "#area-brainstorm",
    stack: ".note--panel",
    cursor: "move",
    helper: "clone",
    //revert: "invalid",
    stop: function( event, ui ) {
      console.log(ui);
      var position = ui.position;

      $.ajax({
        method: "POST",
        url: url.create_note +'.json',
        data: { project_id: info.project_id, person_id: info.person_id, position: JSON.stringify(position) }
      })
        .success(function( data ) {
          if (data.status) {
            var person_name = data.person_name;
            var created_at = new Date(data.created_at).format("UTC:dd/mm/yyyy");
            var note_id = data.note_id;

            html = '<li class="note note--panel new_note ui-draggable ui-draggable-handle" data-id='+ note_id +' style="position: absolute; top:5; left:5">' +
                      '<p>'+ msg.note_default_text +'</p>' +
                      '<hr>' +
                      '<p>Criado por: '+ person_name +'</p>' +
                      '<p>Criado em: '+  created_at +'</p>' +
                      //'<i class="icon-note icon-trash"></i>' +
                   '</li>'

            var new_note_container = $(".notes-container").prepend(html);
            //$(new_note).css({'top:'+ ui.position.top.toString() +',left:'+ui.position.left.toString()});


            setTimeout(function() {
                new_note_container.find(".new_note:first").css({"top": ui.position.top, "left": ui.position.left});
                loadDraggable();
            },.5);

          } // endif data.status
        }); // ajax create







      //html = '<li class="note new_note ui-draggable ui-draggable-handle" data-id=note_id style="position:absolute; top:5; left:5">' +
      //            '<p>'+ msg.note_default_text +'</p>' +
      //            '<hr>' +
      //            '<p>Criado por: Diego</p>' +
      //            '<p>Criado em: 13/01/2016</p>' +
      //            //'<i class="icon-note icon-trash"></i>' +
      //         '</li>';

        //$('#nota-teste').css({'top': 27, 'left' : 482});

        //var new_note_container = $(".notes-container").prepend(html);
        ////$(new_note).css({'top:'+ ui.position.top.toString() +',left:'+ui.position.left.toString()});
        //
        //
        //setTimeout(function() {
        //    new_note_container.find(".new_note:first").css({"top": ui.position.top, "left": ui.position.left});
        //    loadDraggable();
        //}, 100);


      }
    });


// teste drag



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

        html = '<li class="note note--panel new_note ui-draggable ui-draggable-handle" data-id='+ note_id +' style="position: absolute; top:5; left:5">' +
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

