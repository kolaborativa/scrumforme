// livesearch
$('input[name="livesearch"]').search('.task', function(on) {
    var nofound = $('#nothingfound'),
        td = $('.table td'),
        ul = $('.table ul');

    on.reset(function(ui) {
        nofound.hide();
        td.show();
        ul.show();
    });

    on.empty(function() {
        nofound.show();
        td.hide();
        ul.hide();
    });

    on.results(function(results) {
        nofound.hide();
        td.hide();
        ul.hide();
        $(results).closest("td").show();
        $(results).closest("ul").show();
        $(results).closest("tr").find("td").show();
    });
});