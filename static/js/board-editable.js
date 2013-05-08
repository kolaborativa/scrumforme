// =============
// PLUGIN HACKS
// =============

// modify style buttons
$.fn.editableform.buttons =
    '<button type="button" class="btn editable-cancel pull-left"><i class="icon-return-key"></i></button>' +
    '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

//apply editable to parent div
$('.table').editable({
    selector: 'a.editable',
    url: url.createUpdateBacklogItens,
    emptytext: msg.field_empty,
    rows: 1,
    params: function(params) {
        // sending parameters indicating whether the item is to upgrade or not
        // send the new ID as param
        var dbUpdate = $(this).attr("data-update"),
            dbID = $(this).attr("data-pk"),
            definitionready = $(this).closest('.item_container').attr('data-definitionready');

        if (dbUpdate) {
            params.dbUpdate = true;
            params.dbID = dbID;
        } else {
            params.dbUpdate = false;
            params.definitionready = definitionready;
        }
        return params;
    },
    validate: function(value) {
        if (value === '') return msg.validation_error;
    },
    success: function(value, response) {
        // get the coming new database ID and update in DOM
        $(this).attr("data-pk", value.database_id);
        // changes the status of the created item for item update
        $(this).attr("data-update", true);
    }
});