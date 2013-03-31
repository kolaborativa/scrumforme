/*
=====================
 MODIFICAÇÕES GERAIS
=====================
*/

// global
// OBS: outras variaveis globais são geradas no layout_base

var msg = {
    titulo_caixa : "Editar Cartão",
    titulo_nova_caixa : "Novo Cartão",
    campo_vazio : "Click para escrever",
    erro : "Não pode ser vazio!",
    confirma : 'Você tem certeza que deseja continuar?',
    titulo_cartao : "Cartão"
};

// modificar stilo dos botoes
$.fn.editableform.buttons = '<button type="submit" class="btn btn-success editable-submit pull-right"><i class="icon-ok icon-white"></i></button>';
$.fn.editable.defaults.mode = 'inline';

/*
=============================
 ITENS GERADOS DINAMICAMENTE
=============================
*/

// chamada do plugin x-editable
// create new story
// $('#stories').editable({
//   selector: '.new_story',
//   url: urlStory,
//   title: msg.titulo_nova_caixa,
//   emptytext: msg.campo_vazio,
//   validate: function(value) {
//       if(value.texto === '') return msg.erro;
//       console.log(value)
//   }, // End validate function()
//   success: function(value,response) {
//       if(response.success) {
//       } else if(response.error) {
//       }
//   }
// });

// // create new definition of ready
// $('.new_story').editable({
//   selector: '.new_definition_ready',
//   // url: urlNovoEdita,
//   url: "http://localhost:8000",
//   title: msg.titulo_nova_caixa,
//   emptytext: msg.campo_vazio,
//   validate: function(value) {
//       if(value.texto === '') return msg.erro;
//   }, // End validate function()
//   success: function(value,response) {
//       if(response.success) {
//       } else if(response.error) {
//       }
//   }
// });


//apply editable to parent div
$('#stories').editable({
  selector: 'a',
  url: urlStory,
  emptytext: msg.campo_vazio,
  pk: projectID,
  validate: function(value) {
  	// alert(value)
      if(value === '') return msg.erro;
  },
  success: function(value,response) {
  	$(this).parent().find(".create_definition_ready").removeAttr("disabled");
  	$(this).parent().find(".story_points").removeAttr("disabled");
  	$(this).parent().find(".benefit").removeAttr("disabled");
  }
});
 
$('.new_story').editable({
  selector: 'a',
  url: urlStory,
  pk: projectID,
  emptytext: msg.campo_vazio,
  validate: function(value) {
      if(value === '') return msg.erro;
  }
});
 
$(document).on("click", ".classe3", function(){
    html='<div class="classe4">Meu novo campo: <a href="#" class="editable-click editable-empty">Empty</a></div>';
    $('.classe2').append(html);
});
$('#add-empty').click(function(){
  var i = $('#user a').length,
      html = '<div class="classe2">Field '+i+': <a href="#" data-name="field'+i+'" data-type="text" data-value="" title="Field '+i+'" class="editable-click editable-empty">Empty</a> <input type="button" value"banana" name="batata" class="classe3"/></div>';
  $('#user').append(html);
});

// ao clicar no botao de adicionar novo item
$('#create_story').click(function(){
    // var container = $(this).parent().next(".itens"),
    //     classeBotao = this.className.split(" ")[0],
    //     keys = [];

    // var cartoes = container[0].getElementsByClassName("cartao")
    // for (var i = 0, len = cartoes.length; i < len; i++){
    //   var el = cartoes[i];
    //   keys.push(parseInt(el.getAttribute("data-pk")));
    // }

    // if(keys.length > 0) {
    //   var maiorIndice = Array.max(keys),
    //       indiceItem = maiorIndice + 1;
    // } else {
    //   var indiceItem = 1;
    // }
	var indiceItem = 1;

    var html = '<ul class="stories_container"><div class="stories_header"><a href="#" class="editable-click editable-empty story_card new_story editable" data-type="text" data-placeholder="Click para escrever">Click para escrever</a><button class="btn expand_story pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_story pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><select class="span1 pull-right benefit" name="size" id="size" disabled="disabled"><option value="P" selected>P</option><option value="M">M</option><option value="G">G</option><option value="GG">GG</option></select><input class="span1 pull-right story_points" type="number" min="1" pattern="\d*" placeholder="?" ><button class="btn btn-primary create_definition_ready pull-right" disabled="disabled">'+botonDefinitionReady+'</button></div><div class="stories_footer"></div></ul>';

    // container.find("ul").append(html);
    $("#stories").append(html);

    // abro a edição do cartao apos cria-lo
    setTimeout(function () {
       $(".new_story:last").trigger('click');
    }, 100);
    // faz scroll ate o elemento
    // $('html,body').animate({ scrollTop: container.find(".cartao:last").offset().top - (200) }, 1500);
});

// ao clicar no botao de adicionar novo item
$(document).on("click", ".create_definition_ready", function(){
	// var classeBotao = this.className.split(" ")[0]
	// alert(classeBotao)

    var html = '<li><a href="#" class="editable-click editable-empty new_definition_ready editable" data-type="text" data-placeholder="'+msg.campo_vazio+'" >'+msg.campo_vazio+'</a><button class="btn expand_definition_ready pull-right" alt="Expand" title="Expand"><i class="icon-chevron-down"></i></button><button class="btn delete_definition_ready pull-right" alt="Delete" title="Delete"><i class="icon-remove"></i></button><button class="btn comment_definition_ready pull-right" alt="Comment" title="Comment"><i class="icon-comment"></i></button><button class="btn plus_card pull-right" alt="Create Card" title="Create Card"><i class="icon-plus-sign"></i></button></li>';

    $(this).parent().next().append(html);
});

$(document).on("click", ".expand_story", function(){
    var definition_ready = $(this).parent().next(".stories_footer");
    definition_ready.toggle();
});

$(document).on("blur", ".story_points", function(){
    var definition_ready = $(this).parent().next(".stories_footer");
    definition_ready.toggle();
});