
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


// Add new note
$("#note-add").draggable({
  containment: "#area-brainstorm",
  stack: ".note--panel",
  cursor: "move",
  helper: "clone",
  //revert: "invalid",
   start: function(event, ui) {
    $(ui.helper).addClass("note");
   },

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
        var created_at = data.created_at;
        var note_id = data.note_id;

        html = '<li class="note note--panel new_note ui-draggable ui-draggable-handle" data-id='+ note_id +' style="position: absolute; top:5; left:5">' +
                  '<div class="note-header">' +
                    '<i class="icon-note-header icon-note-header--delete icon-trash"></i>' +
                    '<div class="clearfix"></div>' +
                  '</div>' +
                  '<div class="note-content">' +
                    '<a class="editable-click editable" data-type="textarea" data-pk='+ note_id +' data-url="/_update_note.json" style="display: inline;">'+ msg.note_default_text +'</a>' +
                  '</div>' +
                  '<div class="note-footer">' +
                    created_at + ' - ' + person_name +
                  '</div>' +
                  //'<i class="icon-note icon-trash"></i>' +
               '</li>'

        var new_note_container = $(".notes-container").prepend(html);
        new_note_container.find(".new_note:first").css({"top": ui.position.top, "left": ui.position.left});
        loadDraggable();

      } // endif data.status
    }); // ajax success create
  }
});

//TODO: Deletar nota / soh o dono pode

$(document).on("click", ".icon-note-header--delete", function() {
    if (confirm(msg.confirm)) {
        removeNote(this);
    }
});

function removeNote(element) {
  /*
  Function that deletes a note of the database , and remove it from the DOM tree
  */
  var note = $(element).closest(".note")[0],
      noteId = element.dataset.pk;

  $.ajax({
    method: "POST",
    url: url.remove_note +'.json',
    data: { note_id: noteId }
  })
  .success(function(data) {
    // remove the note from the DOM
    $(note).fadeOut("fast", function() {
      $(this).remove();
    });
  });

}

loadDraggable();