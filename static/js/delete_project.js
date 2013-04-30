// Delete project
$('.delete_project').click(function(){
    var project_id = $(this)[0].dataset['project'];
    var remove = confirm(msg.confirmRemove);
    if (remove){
        window.location = url.delete_project + '?project_id=' + project_id;
    }
});
