$(document).ready(function(){
    "use strict";

    var host = window.location.host,
        myGroup = "project" + project_id,
        wsUri,
        ws,
        obj,
        querystring,
        container,
        selectorSortable,
        selector;

    if (host === "localhost:8000") {
        host = "127.0.0.1";
    } else {
        host = "agenciax4.com.br";
    }
    //create a new WebSocket object.
    wsUri = 'ws://' + host + ':8888/realtime/' + myGroup;

    ws = new WebSocket(wsUri);

    ws.onopen = function () {
    // Web Socket is connected
        // call users chat
        callChat();
    };
    ws.onmessage = function (event) {

        if (event.data === "+anonymous" || event.data === "-anonymous") {
            return false;
        } else {
            obj = JSON.parse(event.data);
        }

        if (obj.hasOwnProperty("page")) {

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

        } else if (obj.hasOwnProperty("chat")) {
            var html = '<div class="chat-message"><span class="chat-time">' + obj.time + '</span><strong class="chat-user" style="color:' + obj.color + '">' + obj.name + ': </strong><div class="chat-text">' + obj.message + '</div></div>',
                chat_timeline = $(".chat-content");
            chat_timeline.append(html)
            chat_timeline.scrollTop(chat_timeline[0].scrollHeight);

        } else if (obj.hasOwnProperty("online")) {
            var usuario = $('.user_online[data-id="' + obj.person_id + '"]');
            usuario.find(".status").attr("title","online");
            console.log(usuario);
            usuario.find("i").addClass("color-green");
        }

    };
    ws.onerror = function(event){
        alert("Error Occurred - "+event.data);
    };
    ws.onclose = function() {
        // websocket is closed.
        alert("Connection is closed...");
    };
});