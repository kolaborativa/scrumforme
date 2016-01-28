// modify style buttons
$.fn.editableform.buttons =
    '<button type="button" class="btn editable-cancel pull-left"><i class="icon-return-key"></i></button>' +
    '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

//apply editable to parent div
$('#area-brainstorm').editable({
    selector: '.editable',
    url: url.update_items,
    emptytext: msg.field_empty,
    rows: 1,
    params: function(params) {
        params.project_id = info.project_id;

        var attr = $(this).attr("data-type-text");
        if(attr) {
            params.type_text = attr;
        }

        return params;
    },
    validate: function(value) {
        if (value === '') return msg.validation_error;
    }
});

