$(document).ready(function () {
    "use strict";

    var host = window.location.host,
        myGroup = "project" + info.project_id,
        obj,
        story,
        selector;

    if (host === "localhost:8000") {
        host = "127.0.0.1";
    } else {
        host = "agenciax4.com.br";
    }

    web2py_websocket('ws://' + host + ':8888/realtime/' + myGroup, function (e) {

        obj = JSON.parse(e.data);
        selector = '.item_container[data-definitionready="' + obj.definition_ready_id + '"]';
        story = $(selector);
        story.load(window.location.href + ' ' + selector + '> *', function () {
            // these sortableOptions came from the file board.js
            $(selector + '> *').sortable(sortableOptions);
        });
    });

});