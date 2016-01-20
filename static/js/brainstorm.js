
var loadDraggable = function() {
  // draggable notes
  $(".note--panel").draggable({
    containment: "#area-brainstorm",
    stack: ".note--panel",
    cursor: "move",
    stop: function( event, ui ) {
        var noteId = this.dataset.id;
        var position = ui.position;

        

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
    var position = ui.position;

    html = '<li class="note note--panel new_note ui-draggable ui-draggable-handle" data-id="" style="position: absolute; top:5; left:5">' +
              '<div class="note-header">' +
                '<i class="icon-note-header icon-note-header--delete icon-trash" data-pk=""></i>' +
                '<div class="clearfix"></div>' +
              '</div>' +
              '<div class="note-content">' +
                '<a class="editable-click editable" data-type="textarea" data-pk="" data-url="'+ url.update_note +'" style="display: inline;">'+ msg.note_default_text +'</a>' +
              '</div>' +
              '<div class="note-footer"></div>' +
           '</li>'

    var new_note_container = $(".notes-container").prepend(html);
    var new_note = new_note_container.find(".new_note:first").css({"top": ui.position.top, "left": ui.position.left})[0];
    loadDraggable();

    $.ajax({
      method: "POST",
      url: url.create_note +'.json',
      data: { project_id: info.project_id, person_id: info.person_id, position: JSON.stringify(position) }
    })
    .success(function( data ) {
      if (data.status == false) {
        alert(msg.create_note_error);
        // remove the note from the DOM
        $(new_note).fadeOut("fast", function() {
          $(this).remove();
        });
      } else {
        var btnDelete = $(new_note).find(".icon-note-header--delete")[0];
        var link_content_note = $(new_note).find(".editable-click")[0];
        var footer_note = $(new_note).find(".note-footer")[0];

        new_note.dataset.id = data.note_id;
        btnDelete.dataset.pk = data.note_id;
        link_content_note.dataset.pk = data.note_id;
        footer_note.innerHTML = data.created_at + ' - ' + data.person_name;
      }// endif data.status
    }); // ajax success create
  }
});


/// Remove note
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