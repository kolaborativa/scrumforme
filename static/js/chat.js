$("#call_chat").click(function () {
    var chatElement = $("#chat");

    if (chatElement.is(":hidden")) {
        $("#chat").show();
        // set this user online
        usersOnlineNow();

    } else {
        $("#chat").hide();
    }
});

function callChat() {
    var html = "",
        user_data = "",
        first_name,
        user_container = $("#user_container"),
        all_users = $(".contact-list"),
        query = "?project_id=" + info.project_id + '&person_id=' + info.person_id;

    user_container.empty();
    all_users.empty();
    $.getJSON(url.chat_all_users + query,
    function (data, status) {
        if (status === "success") {
            $(".loading").hide();
            $("#chat-container").show();

            for (i in data) {
                if (data[i]["person_id"] === parseInt(info.person_id)) {
                    first_name = data[i]["person_name"].split(" ");
                    user_data = '<div class="user_online" data-id="' + data[i]["person_id"] + '"><div class="pull-left"><img class="avatar-chat" src="' + data[i]["avatar"] + '"></div><div class="contact-item-body pull-left"><h5 class="user_name">' + first_name[0] + '</h5></div><div class="clearfix"></div></div><hr>';
                } else {
                    html += '<li class="contact-alt grd-white"><a href="#" class="user_online" data-id="' + data[i]["person_id"] + '"><div class="contact-item"><div class="pull-left"><img class="avatar-chat" src="' + data[i]["avatar"] + '"></div><div class="contact-item-body"><div class="status" title="offline"><i class="icon-certificate color-gray"></i></div><p class="contact-item-heading bold">' + data[i]["person_name"] + '</p><p class="help-block"><small class="muted">' + data[i]["person_role"] + '</small></p></div></div></a></li>';
                }
            }
        }
        user_container.append(user_data);
        all_users.append(html);
    });
}

// send message
$('#chat_message').on('keyup', function(e) {
    if (e.which == 13 && ! e.shiftKey) {
        sendMessage(this);
    }
});

function sendMessage(element) {

    var mymessage = $(element).val(), //get message text
        myname = $(".user_name").text(), //get user name
        querystring = "",
        avatar = $("#user_container").find("img").attr("src");

    if(mymessage == "\n" ){ //emtpy message?
        $(element).val("");
        return false;
    }

    querystring = "&chat=true&message=" + mymessage + "&name=" + myname + "&project_id=" + info.project_id + "&avatar=" + avatar;

    $.post(url.send_message_chat,
        querystring,
        function(data, status) {
            if(status === "success") {
                $(element).val("");
                console.log("message sended");
            }
      //data contains the JSON object
    }, "json");
}

function usersOnlineNow () {

    querystring = "&online=true" + "&person_id=" + info.person_id + "&project_id=" + info.project_id;
    $.post(url.user_online_now,
        querystring,
        function(data, status) {
            if(status === "success") {
                console.log("user online");
            }
      //data contains the JSON object
    }, "json");

}

$("#bottom-chat").click(function () {
    var chat_timeline = $(".chat-content");
    chat_timeline.animate({scrollTop: chat_timeline[0].scrollHeight});
    $(this).fadeOut();
})