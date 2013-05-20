$(document).ready(function () {
    "use strict";

    var host = window.location.host,
        myGroup = "project" + project_id,
        obj,
        container,
        selectorSortable,
        selector;

    if (host === "localhost:8000") {
        host = "127.0.0.1";
    } else {
        host = "agenciax4.com.br";
    }

    web2py_websocket('ws://' + host + ':8888/realtime/' + myGroup, function (event) {

        if (event.data === "+anonymous" || event.data === "-anonymous") {
            return false;
        } else {
            obj = JSON.parse(event.data);
        }


        if (obj.page === "board") {
            selector = '.item_container[data-definitionready="' + obj.definition_ready_id + '"]';
            selectorSortable = selector + '> *';

        } else if (obj.page === "product_backlog") {
            selector = '#sprint .project-items';
            selectorSortable = selector;
        }

        container = $(selector);
        container.load(window.location.href + ' ' + selector + '> *', function () {
            // these sortableOptions came from the file board.js
            $(selectorSortable).sortable(sortableOptions);
        });

    });

});