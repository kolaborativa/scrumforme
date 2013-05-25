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


(function () {
$(".call_chat").click(function () {
    var chatElement = $("#chat");

    if (chatElement.is(":hidden")) {
        $("#chat").show();
        // set this user online
        usersOnlineNow();

    } else {
        $("#chat").hide();
    }
});

// send message
var messageHistory = [],
    currentIndex,
    lastIndex;
$("#chat_message").on('keydown', function(e) {
    var element = $(this),
        mymessage = element.val();

    // remove last messages history
    if (messageHistory.length >= 50) {
        for(var i = 40, arr = messageHistory.length - 1; i < arr; i++) {
         messageHistory.shift();
        }
    }

    if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        //emtpy message?
        if(mymessage == "" ){
            return false;
        }
        messageHistory.push(mymessage);
        currentIndex = messageHistory.length - 1;
        // send message
        sendMessage(element);
        return;
    }

    //Move selection up
    if(e.keyCode == 38 && e.ctrlKey) {
        element.val(messageHistory[currentIndex]);
        if (currentIndex === 0) {
            return
        } else {
            currentIndex -= 1;
        }
        lastIndex = false;
    }

    //Move selection down
    if(e.keyCode == 40 && e.ctrlKey) {
        if (lastIndex === true) {
            element.val("");
            return
        }
        if (currentIndex === 0) {
            currentIndex += 1;
        }

        element.val(messageHistory[currentIndex]);
        if (currentIndex === messageHistory.length - 1) {
            lastIndex = true;
        } else {
            lastIndex = false;
            currentIndex += 1;
        }
    }

});

function sendMessage(object) {

    var element = $(object), //get message text
        mymessage = element.val(), //get message text
        myname = $(".user_name").text(), //get user name
        querystring = "",
        avatar = $("#user_container").find("img").attr("src");

    // clean box message
    element.val("");

    querystring = "&chat=true&message=" + mymessage + "&name=" + myname + "&project_id=" + info.project_id + "&avatar=" + avatar;

    $.post(url.send_message_chat_group,
        querystring,
        function(data, status) {
            if(status === "success") {
                console.log("message sended");
            }
      //data contains the JSON object
    }, "json");
}

// set focus on textarea
$("#chat-group").click(function () {
    var chatContainer = $("#chat-input");

    setTimeout(function(){
        chatContainer.find("textarea").focus();
    }, 400);
});

// set focus on textarea
$("#chat-config").click(function () {

    setTimeout(function(){
        isAuth();
    }, 1000);
});

// to bottom on the chat
$("#bottom-chat").click(function () {
    var chat_timeline = $(".chat-content");
    chat_timeline.animate({scrollTop: chat_timeline[0].scrollHeight});
    $(this).fadeOut();
});



// =======================
//  CHAT NOTIFICATION API
// =======================

function authorize(object) {
    var element = $(object);
    Notification.requestPermission(function(perm) {
        element.parent().find("span").fadeIn();
        setTimeout(function(){
            element.parent().find("span").fadeOut();
        }, 400);
        isAuth();
    });
}

function isAuth() {
    var authorized = Notification.permission === 'granted' ||
            window.webkitNotifications.checkPermission() === 0;
    if(authorized === true) {
        var authorize_notification = $("#authorize_notification");
        authorize_notification.addClass("disabled btn-success").text("ON");
    }
    return authorized
};

function show(avatar, titleNotify, message) {
  var notification = new Notification(titleNotify, {
      dir: "auto",
      lang: "",
      icon: avatar,
      body: message,
      tag: "sometag",
  });

  // notification.onclose = …
  // notification.onshow = …
  // notification.onerror = …
    notification.onclick = function() {
        window.focus();
        this.cancel();
    };
    notification.onshow = function() {
        setTimeout(function () {
            notification.close();
        }, 10000);
    };
}

var Notifications = {
    requestPermission: function(callback) {
        window.webkitNotifications.requestPermission(callback);
    }
};

$('#authorize_notification').click(function() {
    authorize(this);
});


// call the notification
function notify(avatar, titleNotify, message) {
    if (this.isAuth()) {
        show(avatar, titleNotify, message);
    }
}

})();