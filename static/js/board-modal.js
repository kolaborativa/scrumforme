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

        var card_element = $(this),
            task_id = card_element.closest(".card_container").find(".task_item").attr("data-pk");
        // store card element
        body.data('card_element', card_element);

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
                    var modal = '<div id="card_modal" class="modal hide" data-task="' + task_id + '"><div class="row-fluid"><div id="modal_sidebar" class="span3"><div class="well sidebar-nav"><div id="member_modal"></div><ul class="nav nav-list"><li id="started_calendar"><a href="#">' + txt.activities + '<i class="icon-calendar"></i></a></li><li><a href="#">' + txt.upload + '<i class="icon-paper-clip"></i></a></li><li><a href="#">' + txt.labels + '<i class="icon-tag"></i></a></li><li class="delete_item_modal"><a href="#">' + txt.delete_card + '<i class="icon-trash"></i></a></li></ul></div></div><div id="modal_content" class="span9"><button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button></div></div></div>';
                    // insert modal in body
                    var screenTop = $(document).scrollTop();
                    $(modal).css({top: screenTop + 30 }).appendTo(body);

                    var modal_element = $("#card_modal"),
                        modal_content = modal_element.find("#modal_content"),
                        member_modal = modal_element.find("#member_modal"),
                        date_element = modal_element.find('#started_calendar'),
                        html = "";

                    html += '<div id="modal_title"><h3>' + data.task.title + '</h3><span id="date_started" class="color_light pull-right">' + data.task.started + '</span>';
                    if (data.task.started !== "") {
                        html += '<span class="color_light pull-right">' + txt.started_in + ':</span>';
                        // insert data date
                        date_element.attr('data-date', data.task.started);
                    }
                    html += '<div class="clearfix"></div></div>';
                    modal_content.append(html);

                    // sidebar user
                    member_modal.html('<img src="' + data.user_relationship.avatar + '" /> <p>' + data.user_relationship.member_name + '</p><p id="modal_role_name" class="color_light">' + data.sharing.role_name + '</p>');

                    // call the modal
                    modal_element.modal('show').attr("data-task", task_id);

                    // commentbox
                    var comment_box = '<div id="modal_comment_box"><form id="send_comment" accept-charset="UTF-8" action="" method="POST"><textarea class="span12 autoheight" id="new_comment" name="new_comment" placeholder="' + txt.type_message + '" rows="2" required></textarea><br><button class="btn btn-success" type="submit">' + button.comment + '</button></form></div><div id="modal_comments"></div>';
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
                            // owner comment
                            if (info.person_id == value["person_id"]) {
                                person_owner_comment = '<li class="edit_comment"><i class="icon-pencil"></i> ' + button.edit + '</li><li class="delete_comment"><i class="icon-trash"></i> ' + button.delete + '</li>';
                            } else {
                                person_owner_comment = "";
                            }
                            // url parse to link
                            new_comment = urlize(value["text"], {nofollow: true, autoescape: true, target: "_blank"});
                            $("#modal_comments").append('<div class="card_comments" data-commentid="' + key + '"><hr /><img class="pull-left" src="' + value["avatar"] + '" width="50" height="50"><div class="comment_content pull-left"><p><strong>' + value["name"] + '</strong><span class="color_light"> - ' + value["role"] + '</span></p><p class="the_comment">' + new_comment + '</p></div><div class="clearfix"></div><ul class="comment_buttons color_light">' + person_owner_comment + '<li><i class="icon-calendar"></i> ' + value["date"] + '</li></ul><div class="clearfix"></div></div>');
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

                // remove task
                nav.find(".delete_item_modal").click(function(e){
                    if (confirm(msg.confirm)) {
                        // call function
                        removeTask(card_element);
                        modal_element.modal('hide');
                    }
                });

                // submit a new comment
                $("form#send_comment").submit(function(e){
                    e.preventDefault();
                    // call function
                    sendComments(this, info.project_id, task_id, card_element);
                });

                // call calendar plugin
                calendar(date_element, card_element);

            }); // end getJSON
    });

    function calendar(date_element, card_element) {
        // datepicker
        var nowTemp = new Date(),
            now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0),
            sprint_started = new Date(date.sprint_started),
            sprint_ended = new Date(date.sprint_started),
            burndown = date.weeks * 7;

        sprint_ended.setDate(sprint_ended.getDate() + burndown);

        $(date_element).datepicker({
            format: 'dd/mm/yyyy',
            todayBtn: "linked",
            todayHighlight: true,
            autoclose: true,
            startDate: sprint_started,
            endDate: sprint_ended,
            pickerPosition: "top-left",
        }).on('changeDate', function(ev) {
            // call the function
            changeDate(ev.date, card_element, this);
        });

    }

    // update date of card
    function changeDate(date, card_element, modal_element) {
        var task = $(modal_element),
            task_id = task.closest('#card_modal').attr('data-task'),
            task_date = date.format("UTC:yyyy-mm-dd"),
            querystring = 'task_id=' + task_id + '&task_date=' + task_date;

        body.css({"cursor":"wait"});
        $.post(url.update_task_date,
            querystring,
            function(data, status) {
                if(status === "success") {
                    var card = $(card_element),
                        task_date = card.closest('.icons_card').find('.calendar').val();

                    if (task_date === undefined) {
                        var date_html = '<span id="date_started" class="color_light pull-right">' + data + '</span>';
                        date_html += '<span class="color_light pull-right">' + txt.started_in + ':</span>';
                        task.datepicker('hide').closest("#card_modal").find("#date_started").html(date_html);
                        card.closest('.icons_card').prepend('<span class="calendar"><i class="icon-calendar"></i></span>');
                    } else {
                        task.datepicker('hide').closest("#card_modal").find("#date_started").html(data);
                    }
                    body.css({"cursor":"auto"});
                    console.log("date status updated!");
                }
          //data contains the JSON object
        }, "json");
    }

    function sendComments(element, project_id, task_id, card_element) {
        var dom_element = $(element),
            data_form = dom_element.serialize();

        data_form += '&project_id=' + project_id + '&task_id=' + task_id + '&person_id=' + info.person_id;

        $.post(url.card_new_comment_or_update,
            data_form,
            function(data, status) {
                if(status === "success") {
                    var element_comment = $(card_element).closest(".icons_card").find(".number_comment"),
                        number_comments = parseInt(element_comment.text()) + 1,
                        new_comment = urlize(data.comment, {nofollow: true, autoescape: true, target: "_blank"}),
                        comment = $('<div class="card_comments" data-commentid="' + data.new_comment_id + '"><hr /><img class="pull-left" src="' + data.user_relationship.avatar + '" alt=""><div class="comment_content pull-left"><p><strong>' + data.user_relationship.member_name + '</strong><span class="color_light"> - ' + data.sharing.role_name + '</span></p><p class="the_comment">' + new_comment + '</p></div><div class="clearfix"></div><ul class="comment_buttons color_light"><li class="edit_comment"><i class="icon-pencil"></i> ' + button.edit + '</li><li class="delete_comment"><i class="icon-trash"></i> ' + button.delete + '</li><li><i class="icon-calendar"></i> ' + data.date_comment + '</li></ul><div class="clearfix"></div></div>').hide();
                    // insert in dom
                    $("#modal_comments").prepend(comment);
                    // show comment
                    comment.fadeIn('slow');
                    // empty textarea
                    dom_element.find("#new_comment").val('');
                    if (number_comments < 10) {
                        number_comments = " " + number_comments; //this space is to adjust the layout
                    }
                    // adds the number of comments
                    element_comment.text(number_comments);
                    // if there is no comment
                    if (!element_comment.length) {
                        var comment = '<span class="comment"><i class="icon-comment"><span class="number_comment"> 1</span></i></span>';
                        $(card_element).closest(".icons_card").prepend(comment);
                    }
                }
          //data contains the JSON object
        }, "json");
    }

    // remove card comment
    $(document).on("click",".delete_comment",function(){
        if(confirm(msg.confirm)) {
            deleteCardComment(this);
        }
    });

    function deleteCardComment(element) {
        var comment = $(element).closest(".card_comments"),
            send_data = '&task_comment_id=' + comment.attr("data-commentid") + '&person_id=' + info.person_id;

        $.post(url.card_delete_comment,
            send_data,
            function(data, status) {
                if(status === "success") {
                    if(data === true) {
                        var card_element = body.data('card_element'),
                            element_comment = $(card_element).closest(".icons_card").find(".number_comment"),
                            number_comments = parseInt(element_comment.text()) - 1;
                        if (number_comments < 10) {
                            number_comments = " " + number_comments; //this space is to adjust the layout
                        }
                        element_comment.text(number_comments);
                        comment.fadeOut("fast", function() { $(comment).remove() });
                    } else if(data === false) {
                        alert(msg.remove_error)
                    }
                }
          //data contains the JSON object
        }, "json");
    }

    // edit comment
    $(document).on("click",".edit_comment",function(){
        var element = $(this).closest(".card_comments"),
            the_comment = element.find(".the_comment"),
            comment_text = the_comment.text(),
            editableText = $('<form class="update_comment" accept-charset="UTF-8" action="" method="POST"><textarea class="span12 autoheight" id="update_comment" name="update_comment" placeholder=' + txt.type_message + ' rows="2" required="">'+comment_text+'</textarea><br><button class="btn btn-mini btn-success" type="submit">' + button.save + '</button><button class="cancel-edit btn btn-mini">' + button.cancel + '</button></form>');

        // change to editable
        the_comment.fadeOut('fast',function(){
            the_comment.replaceWith(editableText);
            editableText.hide().fadeIn('fast');
        });

        // change height of the editable create
        var textBox = element.find("textarea"),
            new_size = textBox.prop('scrollHeight') + parseFloat(textBox.css("borderTopWidth")) + parseFloat(textBox.css("borderBottomWidth"));
        while(textBox.outerHeight() < new_size) {
            textBox.height(textBox.height()+1);
        }

    });


    // remove card comment
    $(document).on("submit","form.update_comment",function(e){
        e.preventDefault();
        var form = $(this),
            data_form = form.serialize(),
            card_element = body.data('card_element'),
            comment_id = form.closest(".card_comments").attr("data-commentid");

        data_form += '&project_id=' + info.project_id + '&comment_id=' + comment_id + "&person_id=" + info.person_id;
        $.post(url.card_new_comment_or_update,
            data_form,
            function(data, status) {
                if(status === "success") {
                    if(data) {
                        var comment = urlize(data, {nofollow: true, autoescape: true, target: "_blank"}),
                            comment_element = $('<p class="the_comment">' + comment + '</p>');

                        // replace a edited comment
                        form.fadeOut('fast',function(){
                            form.replaceWith(comment_element);
                            comment_element.hide().fadeIn('fast');
                        });

                    } else if(data === false) {
                        alert(msg.remove_error)
                    }
                }
          //data contains the JSON object
        }, "json");
    });


    // remove card comment
    $(document).on("click",".cancel-edit",function(e){
        e.preventDefault();
        var element = $(this).closest(".card_comments"),
            form = element.find(".update_comment"),
            comment_text = element.find("textarea").text(),
            comment = $('<p class="the_comment">' + comment_text + '</p>');
        // cancel editable
        form.fadeOut('fast',function(){
            form.replaceWith(comment);
            comment.hide().fadeIn('fast');
        });

    });

})();