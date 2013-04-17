function MultiAjaxAutoComplete(element, url) {
    $(element).select2({
        placeholder: msg.placeholder,
        minimumInputLength: 1,
        multiple: true,
        formatNoMatches: function(){return msg.noMatches},
        formatSearching: function(){return msg.searching},
        formatInputTooShort: function(){return msg.inputTooShort},

        id: function(e) { return e.id+":"+e.title; },
        ajax: {
            url: url,
            dataType: 'json',
            data: function(term, page) {

                return {
                    q: term,
                    page_limit: 10,
                };
            },
            results: function(data, page) {
                return {
                    results: data.persons
                };
            }
        },
        formatResult: formatResult,
        formatSelection: formatSelection,
        initSelection: function(element, callback) {
            var data = [];
            $(element.val().split(",")).each(function(i) {
                var item = this.split(':');
                data.push({
                    id: item[0],
                    title: item[1]
                });
            });
            callback(data);
        }
    });
};

function formatResult(person) {
    return '<div>' + person.title + '</div>';
};

function formatSelection(data) {
    return data.title;
};

MultiAjaxAutoComplete('#e6', url.get_persons);

$('#add').click(function() {
    var persons_id = $('#e6').val().split(',');
    var array_persons = [];
    for (i=0; i<persons_id.length; i++){
        array_persons.push(persons_id[i][0]);
    };
    window.location = url.add_member + '&persons_id=' + array_persons;
});

// Edit role
$('.edit_role').click(function(){
    $(this).parent().next().toggle('normal');
});

// Remove member
$('.remove_member').click(function(){
    var person_id = $(this)[0].dataset['member'];
    var remove = confirm(msg.confirmRemove);
    if (remove){
        window.location = url.remove_member + '&person_id=' + person_id;
    }
});
