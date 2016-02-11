var loadDraggable;
loadDraggable = function () {
  // draggable notes
  $(".note--panel").draggable({
    containment: "#area-brainstorm",
    stack: ".note--panel",
    cursor: "move",
    stop: function (event, ui) {
      var noteId = this.dataset.id;
      var position = ui.position;

      // save position of the note
      $.ajax({
        method: "POST",
        url: url.savePosition + '.json',
        data: {note_id: noteId, position: JSON.stringify(position)}
      }).success(function (data) {
        console.log(data.status);
      })// ajax
    }
  });


  // droppable notes
  $(".note--droppable").droppable({
    drop: function (event, ui) {
      var noteDrag = ui.draggable[0];
      var noteDrop = $(this)[0];
      var noteDragParent = $(noteDrag).parent()[0];
      var noteDropParent = $(noteDrop).parent()[0];

      // if the notes are part of the same group , do not let create another
      if (noteDragParent.dataset.type == 'group-notes' && noteDropParent.dataset.type == 'group-notes') {
        if (noteDragParent.dataset.groupId == noteDropParent.dataset.groupId) {
          return false;
        }
      }

      if (noteDrag.dataset.type == 'note') {
        var notesIds = [];
        notesIds.push(noteDrag.dataset.id);
        notesIds.push(noteDrop.dataset.id);

        // create a group
        $.ajax({
          method: "POST",
          url: url.createGroup,
          data: {project_id: info.project_id}
        }).success(function (data) {
          // add notes in group
          var status = _addNotesInGroup(notesIds, data.group_id)
          if (status = true) {
            var positionNotes = ui.position;
            var htmlGroup = $('<ul class="animated zoomIn notes-container group-notes" data-type="group-notes" data-groupId="' + data.group_id + '" style="position:absolute; top: ' + positionNotes.top + 'px; left: ' + (parseInt(positionNotes.left) - 100).toString() + 'px;">' +
              '<h3 class="editable-click editable title-group" data-type="textarea" data-pk="' + data.group_id + '" data-type-text="group-title">' + data.group_title + '</h3>' +
              '</ul>');

            // Creates clone of the notes, to render the DOM without refreshing the page
            var new_note_1 = $(noteDrag).clone();
            var new_note_2 = $(noteDrop).clone();

            new_note_1.removeClass('note--droppable');
            new_note_2.removeClass('note--droppable');
            new_note_1.css({position: 'relative', top: '0', left: '0'});
            new_note_2.css({position: 'relative', top: '0', left: '0'});

            // Removes the current notes from DOM
            $(noteDrag).fadeOut("fast", function () {
              $(this).remove();
            });
            $(noteDrop).fadeOut("fast", function () {
              $(this).remove();
            });

            // Adds clones of the notes in the group created
            htmlGroup.append(new_note_2);
            htmlGroup.append(new_note_1);

            // Adds the group and the clones of the notes in the DOM
            var areaB = $('#area-brainstorm').append(htmlGroup);
            loadDraggable();

          }
        })// ajax
      } // if dataset.type == 'note'
    } // drop
  });

  // droppable groups
  $(".group-notes").droppable({
    greedy: true,
    drop: function (event, ui) {
      var noteDrag = ui.draggable[0];
      var groupDrop = $(this)[0];
      console.log('noteDrag', noteDrag );

      if (noteDrag.dataset.type == 'note') {
        var notesIds = [noteDrag.dataset.id];
        var groupId = groupDrop.dataset.groupid;

        // add notes in group
        _addNotesInGroup(notesIds, groupId);

        // redirect for the refresh
        window.location = url.current + '/' + info.project_id;

      } else {
        status = false;
      } // if / else dataset.type == 'note'
    } // drop
  });

  // droppable area-brainstorm
  $("#area-brainstorm").droppable({
    greedy: true,
    drop: function (event, ui) {
      var noteDrag = ui.draggable[0];
      var group = $(noteDrag).parent()[0];
      var noteId = noteDrag.dataset.id;
      var groupId = group.dataset.groupid;
      var position = $(noteDrag).offset();
      var groupPosition = $(group).offset();

      console.log(groupPosition.left += 120);

      // if the notes are part of the same group , do not let create another
      if (group.dataset.type == 'group-notes') {
        // removes note
        $.ajax({
          method: "POST",
          url: url.remove_notes_from_group,
          data: {note_id: noteId, group_id: groupId}
        }).success(function (data) {
          // save position of the note
          $.ajax({
            method: "POST",
            url: url.savePosition + '.json',
            data: {note_id: noteId, position: JSON.stringify(position)}
          }).success(function (data) {
            console.log('position', data.status);
          });// ajax save position

          // checks the amount of notes
          $.ajax({
            method: "GET",
            url: url.remaining_notes + '.json',
            data: {group_id: groupId}
          }).success(function (data) {
            var count_notes = data.count;

            if (count_notes == 1) {
              // updates the position of the last note to stay in the group area
              $.ajax({
                method: "POST",
                url: url.update_last_note_position + '.json',
                data: {group_id: groupId, position: JSON.stringify(groupPosition)}
              }).success(function (data) {
                if (data.status == true) {
                  // redirect for the refresh
                  window.location = url.current + '/' + info.project_id;
                }
              });// ajax remove group


              //remove the group with 1 note
              $.ajax({
                method: "POST",
                url: url.remove_group + '.json',
                data: {group_id: groupId}
              }).success(function (data) {
                console.log('remove the group with 1 note', data.status);
                if (data.status == true) {
                  // redirect for the refresh
                  window.location = url.current + '/' + info.project_id; // AQUIIIIIII
                }
              });// ajax remove group
            } // if count notes
          });// ajax count notes

        });// ajax
      } // if dataset group-notes
    } // drop
  });

  // draggable groups
  $(".group-notes").draggable({
    containment: "#area-brainstorm",
    stack: ".note--panel",
    cursor: "move",
    stop: function (event, ui) {
      var groupId = this.dataset.groupid;
      var position = ui.position;

      // save position of the note
      $.ajax({
        method: "POST",
        url: url.savePositionGroup + '.json',
        data: {group_id: groupId, position: JSON.stringify(position)}
      }).success(function (data) {
        console.log(data.status);
      })// ajax
    }
  });

}; // loadDraggable()


// Add new note FAB
$(document).on("click", "#note-add-FAB", function() {
  positionFAB = $(this).offset();
  html = '<li class="animated bounceIn note note--panel note--panel new_note ui-draggable ui-draggable-handle" data-id="" data-type="note" style="position: absolute; top:'+positionFAB.top+'; right:70px">' +
              '<div class="note-header">' +
                '<i class="icon-note-header icon-note-header--delete icon-trash" data-pk=""></i>' +
                '<div class="clearfix"></div>' +
              '</div>' +
              '<div class="note-content">' +
                '<a class="editable-click editable" data-type="textarea" data-pk="" data-url="'+ url.update_items +'" data-type-text="note-text" style="display: inline;">'+ msg.note_default_text +'</a>' +
              '</div>' +
              '<div class="note-footer"></div>' +
           '</li>';
  var new_note_container = $(".no-group-notes-container").prepend(html);
  positionFAB = $(this).offset();
  var new_note = new_note_container.find(".new_note:first")[0];
  loadDraggable();

  $.ajax({
      method: "POST",
      url: url.create_note +'.json',
      data: { project_id: info.project_id, person_id: info.person_id, position: JSON.stringify({"top": positionFAB.top, "left": (positionFAB.left.toString()-250)}) }
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


});


/// Remove note
$(document).on("click", ".icon-note-header--delete", function() {
  var this_ = this;
  alertify.confirm(msg.confirm).setHeader(msg.alert)
    .set('defaultFocus', 'cancel')
    .set('onok', function() { removeNote(this_); alertify.success(msg.note_removed);} );
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

};

// Changes color notes //
$(document).on("click", ".icon-note-header--color", function() {
  $(this).parent().parent().find('.color-palette').toggle();
});

$(document).on("click", ".thumb-color", function() {
  //$(this).parent().parent().find('.color-palette').toggle();
  var note = $(this).closest(".note")[0];
  var noteId = note.dataset.id;
  var newColor = this.dataset.color;
  $(note).css('background-color', newColor);
  $(note).find('.icon-pallete-ok').remove();
  $(this).append('<i class="icon-pallete-ok icon-ok"></i>');

  $.ajax({
    method: "POST",
    url: url.update_color_note +'.json',
    data: { note_id: noteId, new_color: newColor }
  })
  .success(function(data) {
    if (data.status==true) {
      console.log('upa');
      // excluir icone de OK atual

      // incluir icone de OK no clicado

    } else {
      $(note).css('background-color', data.note_old_color);
    };


  });

});


var _addNotesInGroup = function (listNotes, groupId) {
  /*
  Function that deletes a note of the database , and remove it from the DOM tree
  Receives two parameter : list de notas e o grupo

*/
  $.ajax({
    method: "POST",
    url: url.add_notes_in_group,
    data: { list_notes: JSON.stringify(listNotes), group_id: groupId, project_id: info.project_id }
  })
  .success(function(data) {
    status = data.status;

  });
};


loadDraggable();
