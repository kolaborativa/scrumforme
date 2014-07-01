	document.addEventListener("DOMContentLoaded", tudo);
	function tudo(){
		document.getElementById("login_index").addEventListener("click", mostra_login)
		document.getElementById("registro_index").addEventListener("click", mostra_registro)
	}
	function mostra_login(){
		document.getElementById("registro").style.display = "none"
		document.getElementById("entrar").style.display = "block"
		document.getElementById("login_index").style.background = "#34abbd"
		document.getElementById("registro_index").style.background = "#197a8b"
	}
	function mostra_registro(){
		document.getElementById("entrar").style.display = "none"
		document.getElementById("registro").style.display = "block"
		document.getElementById("login_index").style.background = "#197a8b"
		document.getElementById("registro_index").style.background = "#34abbd"
	}