/*
=================
 GENERAL CHANGES
=================
*/

var calcStoryPoints = function(storyPointCurrent) {
    var count_points = 0;
    if (storyPointCurrent) {
        count_points += parseInt(storyPointCurrent);
    };

    $('#sprint').find('input.story_points').each(function(i, v) { count_points += parseInt(v.value) });

    var total_points = parseInt($('#total-story-points').text());
    var balance_points = total_points - count_points;

    if (balance_points < 0) {
        $('#story-points-remaining').text(balance_points);
        $('#story-points-remaining').css('color', 'red');
        return false
    } else {
        $('#story-points-remaining').text(balance_points);
        $('#story-points-remaining').css('color', '#000');
        return true
    }
};
calcStoryPoints();

$(function() {

    // catch size dynamically to increase the size of content
    var windowHeight = $(window).height(),
        scrollTop = $(".container-fluid").offset().top,
        height = windowHeight - scrollTop;

    $("#backlog").find(".project-items").height(height);
    $("#sprint").find(".project-items").height(height);

});


// ====================================
//  IF THE USER HAS PERMISSION TO EDIT
// ====================================
if (info.have_permission === true) {
    // sprint stories itens
    var sortableOptions = {
            placeholder: 'placeholder_item',
            delay:25,
            revert:true,
            dropOnEmpty: true,
            start: function( event, ui ) {
                var placeholder = $(ui.item).clone().css({opacity:"0.6",zIndex:"1"});
                $(".placeholder_item").css({height:placeholder.height(),margin:"0px 0px 20px 0px"});
                ui.placeholder.html(placeholder);

            },
            stop: function( event, ui ) {
                var areasStories = {
                    'item-backlog': 'backlog',
                    'item-sprint': 'sprint'
                };
                setTimeout(function () {
                    // call the function
                    areaStory = areasStories[ui.item[0].firstElementChild.classList[1]];
                    updateStoryOrder(areaStory)
                }, 1000); // Enable after 1000 ms.

            }
    }
    $( "#sprint .project-items" ).sortable(sortableOptions);
    $( "#backlog .project-items" ).sortable(sortableOptions);


    /*
    ==============
     PLUGNS HACKS
    ==============
    */

    // modify style buttons
    $.fn.editableform.buttons =
     '<button type="button" class="btn editable-cancel pull-left"><i class="icon-return-key"></i></button>'+
      '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
    $.fn.editable.defaults.mode = 'inline';

    /*
    =============================
     ITEMS GENERATED DYNAMICALLY
    =============================
    */

    //apply editable to parent div
    $('#content').editable({
      selector: 'a.editable',
      url: url.create_or_update_itens,
      emptytext: msg.field_empty,
      rows: 1,
      params: function(params) {
          // sending parameters indicating whether the item is to upgrade or not
          // send the new ID as param
          var dbUpdate = $(this).attr("data-update"),
              dbID = $(this).attr("data-pk"),
              order = $(this).attr("data-index"),
              definitionready = $(this).closest('.definition_ready_container').find(".definition_ready_card").attr('data-pk');

          if(dbUpdate) {
            // updating tasks
            params.dbUpdate = true;
            params.dbID = dbID;
          }else {
            // creating tasks
            params.dbUpdate = false;
            params.definitionready = definitionready;
            params.order = order;
          }
          params.project_id = info.project_id;
          params.page = info.page;
          return params;
      },
      validate: function(value) {
          if(value === '') return msg.validation_error;
      },
      success: function(value,response) {
        // enables the buttons
        var story = $(this).closest(".story");

        if(value.name === "story") {
            story.find(".new_story").removeClass("new_story");
            story.find(".create_definition_ready").removeAttr("disabled");
            story.find(".story_points").removeAttr("disabled");
            story.find(".benefit").removeAttr("disabled");
            story.find(".expand_story").removeAttr("disabled");
            $(this).closest(".story_container").find(".send_story_sprint").removeAttr("disabled");

        }else if(value.name === "definition_ready") {
            var label_DR = story.find(".qtd_definition_ready").text();
            story.find(".qtd_definition_ready").text(parseInt(label_DR)+1);
            story.find(".create_task").removeAttr("disabled");
        }else if(value.name === "task") {
            $(this).closest(".definition_ready_container").find(".expand_definition_ready").removeAttr("disabled");
        }

        // recalculates story points
        setTimeout(function () {
           calcStoryPoints();
        }, 100);


        // get the coming new database ID and update in DOM
        $(this).attr("data-pk", value.database_id);
        // changes the status of the created item for item update
        $(this).attr("data-update", true);
      },
    });

// ========================================
//  END IF THE USER HAS PERMISSION TO EDIT
// ========================================
} else {
    $(".project-items").addClass("no_permission");
}


// by clicking the button to add Story
$('#create_story').click(function(){

    var keys = [],
        index = "";
    $(".project-items").children().each(function(){
        index = $(this).find(".story_card").attr("data-index");
        keys.push(parseInt(index))
    });
    // finds the highest rate for the new story
    if(keys.length > 0) {
      var lessIndex = Array.min(keys),
          indexItem = lessIndex - 1;
    } else {
      var indexItem = 0;
    }

    var html = '<ul class="story_container item_container"><li class="story"><div class="story_header"><div class="text_container"><a href="#" class="editable-click editable-empty story_card editable new_story" data-type="textarea" data-placeholder="' + msg.field_empty + '" data-pk="'+info.project_id+'" data-index="'+indexItem+'" data-name="story">' + msg.field_empty + '</a></div><div class="buttons_container"><button class="btn btn-nostyle expand_story pull-right" alt="'+title.expand+'" title="'+title.expand+'" disabled="disabled"><i class="icon-circle-arrow-down"></i></button><button class="btn delete_item pull-right" alt="'+title.remove+'" title="'+title.remove+'"><i class="icon-trash"></i></button><select class="pull-right benefit" alt="'+title.benefit+'" title="'+title.benefit+'" disabled="disabled"><option value="" disabled selected>?</option><option value="P">P</option><option value="M">M</option><option value="G">G</option><option value="GG">GG</option></select><input class="pull-right story_points only_numbers" type="number" placeholder="?" min="1" alt="'+title.points+'" title="'+title.points+'" disabled="disabled"><button class="btn create_definition_ready pull-right" alt="'+title.create_DR+'" title="'+title.create_DR+'" disabled="disabled">+ '+buttons.DR+'</button><span class="label qtd_definition_ready pull-right tip-bottom" alt="'+title.label_DR+'" title="'+title.label_DR+'">0</span></div><div class="clearfix"></div></div><div class="list_definition_ready"></div></li><div class="buttons_footer new_buttons_footer"><button class="btn btn-primary pull-right send_story_sprint" disabled="disabled">'+buttons.send_sprint+' <i class="icon-circle-arrow-right icon-white"></i></button><div class="clearfix"></div></div></ul>';

    $("#backlog").find(".project-items").prepend(html);

    // I open the card after editing it creates
    setTimeout(function () {
       $(".new_story:first").trigger('click');
    }, 100);
});

// by clicking the button to add Definition of Ready
$(document).on("click", ".create_definition_ready", function(){
    $(this).closest(".story").find(".definition_ready_container").slideDown("slow");
    $(this).closest(".story_container").find(".buttons_footer").fadeIn("fast", "linear");
    var story_id = $(this).closest(".story").find(".story_card").attr("data-pk");

    var html = '<ul class="item_container"><li class="definition_ready_container new_definition_ready_container"><div class="definition_ready"><div class="text_container"><span class="label" style="margin-right: 4px;" alt="'+title.label_DR+'" title="'+title.label_DR+'">'+buttons.DR+' </span><a href="#" class="editable-click editable-empty definition_ready_card editable new_definition_ready" data-type="textarea" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="definition_ready">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn btn-minimize expand_definition_ready pull-right" alt="'+title.expand+'" title="'+title.expand+'" disabled="disabled"><i class="icon-circle-arrow-up"></i></button><button class="btn delete_item pull-right" alt="'+title.remove+'" title="'+title.remove+'"><i class="icon-trash"></i></button><button class="btn create_task pull-right" alt="'+title.task+'" title="'+title.task+'" disabled="disabled">+ '+buttons.task+'</button></div><div class="clearfix"></div></div><div class="list_taks"></div></li></ul>';

    var newItem = $(this).closest(".story").find(".list_definition_ready").prepend(html);

    setTimeout(function () {
       newItem.find(".new_definition_ready:first").trigger('click')
    }, 100);

});

// by clicking the button to add Task
$(document).on("click", ".create_task", function(){

    var story_id = $(this).closest(".definition_ready_container").find(".definition_ready_card").attr("data-pk");

    var html = '<ul class="item_container zebra_row"><li class="task"><div class="text_container"><a href="#" class="editable-click editable-empty editable new_task" data-type="textarea" data-placeholder="'+msg.field_empty+'" data-pk="'+story_id+'" data-name="task">'+msg.field_empty+'</a></div><div class="buttons_container"><button class="btn delete_item pull-right" alt="Delete" title="Delete"><i class="icon-trash"></i></button><button class="btn btn-nostyle comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment-custom"><span>0</span></i></button></div><div class="clearfix"></div></li></ul>';

    var newItem = $(this).closest(".definition_ready_container").find(".list_taks").prepend(html);

    setTimeout(function () {
       newItem.find(".new_task:first").trigger('click')
    }, 100);

});

// click expand story
$(document).on("click", ".expand_story", function(){
    var item = $(this);

    item.closest(".story_container").find(".definition_ready_container").slideToggle("slow");
    item.closest(".story_container").find(".buttons_footer").fadeToggle("fast", "linear");
    item.find("i").toggleClass("icon-circle-arrow-down").toggleClass("icon-circle-arrow-up");
});

// to expand definition_ready content
$(document).on("click", ".expand_definition_ready", function(){
    var item = $(this);
    item.closest(".definition_ready_container").find(".task").fadeToggle("fast", "linear");
    item.find("i").toggleClass("icon-circle-arrow-up").toggleClass("icon-circle-arrow-down");
});

// clean values ​​that are not numbers
$(document).on("keydown", ".only_numbers", function(event){
    var key = window.event.keyCode || event.keyCode;
    return ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || (key == 8) || (key == 9) || (key == 13));
});

// update Story Points
$(document).on("change", ".story_points", function(){
    if (this.value === "" || this.value === "0") {
        this.value = 1;
    }

    var validPoints = calcStoryPoints(null);

    if (validPoints) {
        var story = $(this).closest(".story"),
            storyID = story.find(".story_card").attr("data-pk");
        ajax(url.changeStories+'?story_points='+this.value+'&story_id='+storyID, [''], 'target_ajax');
        statusAction("","","send");
    } else {
        alert(msg.number_story_points_exceeded);
        return false;
    }

});

// update Benefit
$(document).on("change", ".benefit", function(){
    var story = $(this).closest(".story"),
        storyID = story.find(".story_card").attr("data-pk");
    ajax(url.changeStories+'?benefit='+this.value+'&story_id='+storyID, [''], 'target_ajax');
    var status = statusAction("","","send");

    if(status) {
        var initialValue = story.find('.benefit option:first-child').text(),
            options = story.find(":selected").text();
        if(initialValue === "?") {
            story.find('.benefit option:first-child').removeAttr("selected");
        }
        story.find('.benefit option[value='+options+']').attr('selected', 'selected');
    }

});

// send story to sprint
$(document).on("click", ".send_story_sprint", function(){
    var object = $(this).closest(".story_container"),
        storyID = object.find(".story_card").attr("data-pk"),
        sprintID = $("#sprint").attr("data-sprint"),
        storyPoints = object.find('input.story_points')[0].value;


    if (!storyPoints) {
      alert(msg.need_story_points);
      return false
    }

    if(sprintID === undefined) {
      alert(msg.move_sprint_error);
      return false
    }

    var validPoints = calcStoryPoints(storyPoints);
    if (!validPoints) {
        alert(msg.number_story_points_exceeded);
        return false;
    }

    ajax(url.changeStories+'?name=sprint&sprint_id='+sprintID+'&story_id='+storyID+'&project_id='+info.project_id, [''], 'target_ajax');
    statusAction(object,"sprint","send");

    // update all story order in sprint
    setTimeout(function(){
        updateStoryOrder('sprint');
    },1000); // Enable after 1000 ms.
});

// back story to backlog
$(document).on("click", ".back_backlog", function(){
    var object = $(this).closest(".story_container"),
        storyID = object.find(".story_card").attr("data-pk"),
        sprintID = $(".story_container").attr("data-sprint");



    ajax(url.changeStories+'?name=backlog&sprint_id='+storyID+'&story_id='+storyID+'&project_id='+info.project_id, [''], 'target_ajax');
    statusAction(object,"backlog","send");

    //update all story order in backlog
    setTimeout(function(){
        updateStoryOrder('backlog');
        calcStoryPoints();
    },1000); // Enable after 1000 ms.

});

// remove item
$(document).on("click", ".delete_item", function(){
  if(confirm(msg.confirm)) {
    var object = $(this).closest(".item_container").find('a'),
        pk = object.attr('data-pk'),
        name = object.attr('data-name');

    removeItem(pk,name,object,"remove");
  }
});

// for remove itens
function removeItem(pk,name,object,action) {

    if(name === "task") {
        // for delete tasks only
        var definitionready = $(object).closest('.definition_ready_container').find(".definition_ready_card").attr('data-pk');
        ajax(url.removeBacklogItens+'?pk='+pk+'&name='+name+'&definitionready='+definitionready+'&project_id='+info.project_id, [''], 'target_ajax');

    }else{
        ajax(url.removeBacklogItens+'?pk='+pk+'&name='+name+'&project_id='+info.project_id, [''], 'target_ajax');
    }

    var status = statusAction(object,"",action);

    if(status === true) {
        // get total number of Definitions of Ready and decreases
        console.log(status)
        if(name === "definition_ready") {
            var label_DR = $(object).closest(".story").find(".qtd_definition_ready");
            label_DR.text(parseInt(label_DR.text())-1);
        }
    }
}

// update order position of dom
function updateStoryOrder(area_stories){
    var story = $("#"+area_stories),
        stories_container = story.find(".project-items"),
        sprint_id = story.attr("data-sprint"),
        allValues = {},
        valuesUrl = "";

    stories_container.children().each(function(index) {
        index += 1;
        order = $(this).index();
        id = $(this).find('.story_card').attr('data-pk');

        allValues[index] = jQuery.param({"id": id, "order": order});

        $(this).find(".story_card").attr('data-index',order);

    });

    valuesUrl = jQuery.param(allValues);
    // send to server
    ajax(url.changeStories+'?sprint_id='+sprint_id+'&order=order'+'&project_id='+info.project_id+'&'+valuesUrl, [''], 'target_ajax');
    // test server callback
    statusAction("","sprint","order");
}

function statusAction(object,item,action) {
  // The first parameter tells whether the element will be deleted in the DOM
    var message = $("#target_ajax").text();
    console.log(message)

  if (message.length > 0) {
    if(message === 'True') {
      // var msg_text = msg.remove_sucess,
      // msg_type = msg.type_success;
        if(item==="sprint") {
            // move story to sprint
            if(action==="send") {
                // msg_text = "Movido com Sucesso!";
                var button = '<button class="btn btn-danger pull-right back_backlog"><i class="icon-circle-arrow-left icon-white"></i> '+buttons.back_backlog+'</button><div class="clearfix"></div></div>',
                    story_content = $('#sprint').find(".project-items");
                // move and add button
                $(object).clone().appendTo(story_content).find(".buttons_footer").empty().append(button);
                $(object).fadeOut("fast", function() { $(this).remove() });

                // collapse story
                $("#sprint").find(".story_container:last").find(".expand_story").trigger('click');

            } else if(action==="order") {
                console.log("order updated!")
            }

        // move story to backlog
        } else if(item==="backlog") {
            // move story to sprint
            if(action==="send") {
                // msg_text = "Movido com Sucesso!";
                var button = '<button class="btn btn-primary pull-right send_story_sprint">'+buttons.send_sprint+' <i class="icon-circle-arrow-right icon-white"></i></button><div class="clearfix"></div>',
                    story_content = $('#backlog').find(".project-items");
                // move and add button
                $(object).clone().appendTo(story_content).find(".buttons_footer").empty().append(button);
                $(object).fadeOut("fast", function() { $(this).remove() });
                $("#backlog").find(".story_container:last").find(".expand_story").trigger('click');

            }

        // for any one
        } else if(item==="") {
            // move story to sprint
            if(action==="remove") {
                // find element to be deleted
                $(object).closest(".item_container").fadeOut("fast", function() { $(this).remove() });
            }
        }

    } else if(message === "False") {
      // msg_text = msg.remove_error;
      // msg_type = msg.type_error;
    }


    // notifiction
    // $.pnotify({
    //   title: msg.titulo_cartao,
    //   text: msg_text,
    //   type: msg_type
    // });

  } else {
    console.log("waiting for reply...")
    setTimeout(function() {
        statusAction(object,item,action)
    }, 300);
  }
  // Clean the return of ajax call
  $("#target_ajax").empty();
  return true
}
