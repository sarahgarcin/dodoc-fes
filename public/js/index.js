var serverBaseUrl = document.domain;
var domainUrl = window.location.href;
var socket = io.connect();
var sessionId = '';
var sessionList = [];

jQuery(document).ready(function($) {
	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);
	socket.on('listSessions', onlistSessions);
	socket.on('displayNewSession', displayNewSession);

	// active fonctions
	addSession();

});

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('newUser', {id: sessionId});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

// Affiche la liste des sessions
function onlistSessions(req) {
	var sessionName = req.name.replace(/_/g," ");
	if(req.thumb != "none"){
		$(".session .list-session ul").prepend('<li class="session-project vignette"><a href="'+domainUrl+'select/'+req.name+'"><h2>'+sessionName+'</h2><p class="description">'+req.description+'</p><img src="' + domainUrl +req.name+'/'+ req.name +'-thumb.jpg"></a><div class="modify"><img src="/images/save.svg"></div><div class="delete"><img src="/images/clear.svg"></div></li>');
	}
	else{
		$(".session .list-session ul").prepend('<li class="session-project vignette"><a href="'+domainUrl+'select/'+req.name+'"><h2>'+sessionName+'</h2><p class="description">'+req.description+'</p></a><div class="modify"><img src="/images/save.svg"></div><div class="delete"><img src="/images/clear.svg"></div></li>')
	}
	deleteSession();
	modifySession();
}

//Ajouter une session
function addSession(){
	$("#add-session").on('click', function(){
		var newContentToAdd = "<h3 class='popoverTitle'>Ajouter une nouvelle session</h3><form onsubmit='return false;' class='add-project'><input class='new-session' placeholder='Nom'></input><input class='description-session' placeholder='Description'></input><input type='file' id='thumbfile' accept='image/*' placeholder='Ajouter une image'></input>  <label for='thumbfile'>Ajouter une image</label><input type='submit' class='submit-session'></input></form>";
		var closeAddProjectFunction = function() {
		};

		fillPopOver( newContentToAdd, $(this), 300, 300, closeAddProjectFunction);
		imageData = null;
		var fileName;

		uploadImage($("#thumbfile"));
		submitSession($('input.submit-session'), 'newSession', closeAddProjectFunction);
		
	})
}

function displayNewSession(req){
	console.log(req);
	if(req.thumb != "none"){
		$(".session .list-session ul").prepend('<li class="session-project vignette"><a href="'+domainUrl+'select/'+req.format+'"><h2>'+req.name+'</h2><p class="description">'+req.description+'</p><img src="' + domainUrl +req.format+'/'+ req.format +'-thumb.jpg"></a><div class="modify"><img src="/images/save.svg"></div><div class="delete"><img src="/images/clear.svg"></div></li>');
	}
	else{
		$(".session .list-session ul").prepend('<li class="session-project vignette"><a href="'+domainUrl+'select/'+req.format+'"><h2>'+req.name+'</h2><p class="description">'+req.description+'</p></a><div class="modify"><img src="/images/save.svg"></div><div class="delete"><img src="/images/clear.svg"></div></li>');
		}
	deleteSession();
	modifySession();
}

function deleteSession(){
	var $delButton = $(".vignette .delete");
	$delButton.click(function(){
		var $session = $(this).parent().children("a").attr('href').split("/select/").pop();
		if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
			socket.emit("deleteSession", $session);
			$(this).parent(".vignette").remove();
    }
    return false;
	}); 
}

function modifySession(){
	var $modButton = $(".vignette .modify");
	$modButton.click(function(){
		var $session = $(this).parent().children("a").attr('href').split("/select/").pop();
		socket.emit("modifySession", $session);
		socket.on("changeSession",function(data){
			var newContentToAdd = "<h3 class='popoverTitle'>Modifier la session</h3><form onsubmit='return false;' class='add-project'><input class='new-session'></input><input class='description-session'></input><input type='file' id='thumbfile' accept='image/*' placeholder='Ajouter une image'></input> <label for='thumbfile'>"+data.file+"</label><input type='submit' class='submit-session'></input></form>";
			var closeAddProjectFunction = function() {
			};
			fillPopOver(newContentToAdd, $modButton, 300, 300, closeAddProjectFunction);
			$('.new-session').val(data.name);
			$('.description-session').val(data.description);
			var imageData;
			var fileName;

			uploadImage($("#thumbfile"));
			submitSession($('input.submit-session'), 'sessionIsModify', closeAddProjectFunction, $session);
		});	
	});
}

function uploadImage($button){
	$button.bind('change', function(e){
  	//upload(e.originalEvent.target.files);
  	imageData = e.originalEvent.target.files;
  	//change the label of the button in the name of the image
  	fileName = this.files[0].name;
	  var dflt = $(this).attr("placeholder");
	  if($(this).val()!=""){
	    $(this).next().text(fileName);
	  } else {
	    $(this).next().text(dflt);
	  }
	});

}

function submitSession($button, send, closeAddProjectFunction, oldSession){
	$button.on('click', function(){
		var newSession = $('input.new-session').val();
		var description = $('input.description-session').val();

		if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit(send, {name: newSession, old: oldSession, description:description , file:evt.target.result, fileName:fileName});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, {name: newSession, old: oldSession, description:description});
		}
		closePopover(closeAddProjectFunction);
	})
}
