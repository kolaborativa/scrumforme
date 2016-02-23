alert('testabdo a merda da bosta');

// Delete project
$('.iiicon-project-card-delete').click(function(){
    var project_id = $(this)[0].dataset['project'];
    var remove = confirm(msg.confirmRemove);
    if (remove){
        alert(url.delete_project + '?project_id=' + project_id);
        window.location = url.delete_project + '?project_id=' + project_id;
    }
});
x