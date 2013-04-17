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
                console.log(data);
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

MultiAjaxAutoComplete('#e6', "http://localhost:8000/scrumforme/default/get_persons_add.json");

$('#add').click(function() {
    alert($('#e6').val());
});

