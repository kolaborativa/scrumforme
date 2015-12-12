$(document).ready(function(){
    "use strict";

    var host = window.location.host,
        window_focus = true,
        myGroup = "project" + infoGlobal.project_id,
        wsUri,
        ws,
        obj,
        querystring,
        container,
        selectorSortable,
        selector;

    // verify windows focus
    window.onblur = function() { window_focus = false; }
    window.onfocus = function() { window_focus = true; }

    if (host === "localhost:8000") {
        host = "127.0.0.1";
    } else {
        host = "scrumfor.me";
    }
    //create a new WebSocket object.
    wsUri = 'ws://' + host + ':8888/realtime/' + myGroup;

    ws = new WebSocket(wsUri);

    ws.onopen = function () {
    // Web Socket is connected
        // call users chat
        callChat();
        // set this user online
        setTimeout(function () {
            usersOnlineNow();
        },3000);
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
                $("#backlog .project-items").load(window.location.href + ' #backlog .project-items > *');
                selector = '#sprint .project-items';
                selectorSortable = selector;
            }

            container = $(selector);
            container.load(window.location.href + ' ' + selector + '> *', function () {
                // these sortableOptions came from the file board.js
                $(selectorSortable).sortable(sortableOptions);
            });

        } else if (obj.hasOwnProperty("chat")) {
            var message = urlize(obj.message, {nofollow: true, autoescape: true, target: "_blank"}),
                html = '<p style="display: block;"><img src="' + obj.avatar + '" alt=""><span class="msg-block"><strong>' + obj.name + '</strong> <span class="time">- ' + obj.time + '</span><span class="msg">' + message + '</span></span></p>',
                chat_timeline = $(".chat-content"),
                bottomChat = $("#bottom-chat"),
                atBottom = (chat_timeline[0].scrollHeight - chat_timeline.scrollTop() + 1 == chat_timeline.outerHeight());
            chat_timeline.append(html);

            if (atBottom) {
                chat_timeline.scrollTop(chat_timeline[0].scrollHeight);

                if (bottomChat.is(":visible")) {
                    bottomChat.fadeOut();
                }

            } else {
                bottomChat.fadeIn();
            }


            if(!window_focus) {
                // play sound on message
                $('#chatAudio')[0].play();
                notify(obj.avatar, obj.name, message);
            }

        } else if (obj.hasOwnProperty("online")) {
            var usuario = $('.user_online[data-id="' + obj.person_id + '"]');
            usuario.find(".status").attr("title","online");
            usuario.find("i").addClass("color-green");
        }

    };
    ws.onerror = function(event){
        console.log("Error Occurred - "+event.data);
    };
    ws.onclose = function() {
        // websocket is closed.
        console.log("Connection is closed...");
    };
});
