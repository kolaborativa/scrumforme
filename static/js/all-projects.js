
// Delete Project
$(document).on("click", ".icon-project-card-delete", function() {
  var this_ = this;
  if (window.confirm('Você tem certeza que deseja continuar?')) {
    deleteProject(this_);
  }

});

function deleteProject(element) {
  /*
  Function that deletes a project of the database , and remove it from the DOM tree
  */
  var project = $(element).closest(".project-card")[0],
      projectId = element.dataset.pk;

  $.ajax({
    method: "POST",
    url: url.delete_project +'.json',
    data: { project_id: projectId }
  })
  .success(function(data) {
    // remove the note from the DOM
    $(project).fadeOut("fast", function() {
      $(this).remove();
    });
  });

}

// Truncate title of the projects
$.each($('.trunc'), function(index, value){
  if(value.textContent.length > 18) {
   value.textContent = value.textContent.substring(0, 18) + '...';
  }
});

// Live Search
var options = {
  valueNames: [ 'project_name' ]
};

var userList = new List('modalAllProjects', options);
