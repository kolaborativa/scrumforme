(function () {
    "use strict";

    var body = $("body");
    /*
      ============
       OPEN MODAL
      ============
    */
    $(document).on("click", ".card-modal", function () {
        $(".loading_item").fadeIn("fast");

        var task_id = $(this).find(".task_item").attr("data-pk");
        // store card element
        // body.data('card_element', card_element);

        // remove last append modal in body
        $("#card_modal").remove();
        // loading modal content
        $.getJSON(url.card_modal + "?task_id=" + task_id + "&project_id=" + info.project_id,
            function (data) {
                if (data === false) {
                    $(".loading_item").fadeOut("fast");
                    alert(msg.no_team);

                } else {
                    // console.log(data);
                    $(".loading_item").fadeOut("fast");
                    var modal = '<div id="card_modal" class="modal hide" data-task="' + task_id + '"><div class="row-fluid"><div id="modal_sidebar" class="span3"><div class="well sidebar-nav"><div id="member_modal"></div><ul class="nav nav-list"><li><a href="#">' + txt.upload + '<i class="icon-paper-clip"></i></a></li></ul></div></div><div id="modal_content" class="span9"><button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button></div></div></div>';
                    // insert modal in body
                    var screenTop = $(document).scrollTop();
                    $(modal).css({top: screenTop + 30 }).appendTo(body);

                    var modal_element = $("#card_modal"),
                        modal_content = modal_element.find("#modal_content"),
                        member_modal = modal_element.find("#member_modal"),
                        date_element = modal_element.find('#started_calendar'),
                        html = "";

                    html += '<div id="modal_title"><h3>' + data.task.title + '</h3><div class="clearfix"></div></div>';
                    modal_content.append(html);

                    // sidebar user
                    member_modal.html('<img src="' + data.user_relationship.avatar + '" /> <p>' + data.user_relationship.member_name + '</p><p id="modal_role_name" class="color_light">' + data.sharing.role_name + '</p>');

                    // call the modal
                    modal_element.modal('show').attr("data-task", task_id);

                    // commentbox
                    var comment_box = '<div id="modal_comment_box"></div><div id="modal_comments"></div>';
                    modal_content.append(comment_box);

                    // start comments
                    if (data.comments) {
                        // console.log(data.comments);
                        var keys = Object.keys(data.comments), // or loop over the object to get the array
                            key = "",
                            value = "",
                            new_comment = "",
                            person_owner_comment = "";
                        keys.reverse(); // maybe use custom reverse, to change direction use .sort()
                        // keys now will be in wanted order
                        for (var i = 0; i < keys.length; i++ ) { // now lets iterate in reverse order
                            key = keys[i];
                            value = data.comments[key];
                            // url parse to link
                            new_comment = urlize(value["text"], {nofollow: true, autoescape: true, target: "_blank"});
                            $("#modal_comments").append('<div class="card_comments" data-commentid="' + key + '"><hr /><img class="pull-left" src="' + value["avatar"] + '" width="50" height="50"><div class="comment_content pull-left"><p><strong>' + value["name"] + '</strong><span class="color_light"> - ' + value["role"] + '</span></p><p class="the_comment">' + new_comment + '</p></div><div class="clearfix"></div><ul class="comment_buttons color_light"><li><i class="icon-calendar"></i> ' + value["date"] + '</li></ul><div class="clearfix"></div></div>');
                        } // end loop
                    } // end comments
                } // data via ajax

                // hide gif loading
                $(".loading").hide();
                // prevent link default
                var nav = modal_element.find(".nav");
                nav.click(function(e){
                    e.preventDefault();
                });

            }); // end getJSON
    });

})();