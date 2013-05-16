$(document).ready(function () {
    "use strict";

    var host = window.location.host,
        obj,
        story,
        status,
        query;

    if (host === "localhost:8000") {
        host = "127.0.0.1";
    } else {
        host = "agenciax4.com.br";
    }

    web2py_websocket('ws://' + host + ':8888/realtime/mygroup', function (e) {

        obj = JSON.parse(e.data);
        story = $('.item_container[data-definitionready="' + obj.definition_ready_id + '"]');

        if (obj.move === true) {
            status = ["todo", "inprogress", "verification", "done"];

            for (var i in status) {
                query = "?definition_ready_id=" + obj.definition_ready_id + "&status=" + status[i];
                story.find("." + status[i]).load(urlLoadTasks + query);
            }

        } else {
            query = "?definition_ready_id=" + obj.definition_ready_id + "&status=" + obj.status;
            story.find("." + obj.status).load(urlLoadTasks + query);
        }

    });

});