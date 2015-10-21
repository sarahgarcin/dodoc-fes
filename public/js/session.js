jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var domainUrl = window.location.href;
	var originUrl = window.location.origin;
	var socket = io.connect();
	var sessionId = '';
	var session = {};
	var sessionList = [];
	var currentSession = app.session;

	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);
	socket.on('listProjets', onlistProjets);
	socket.on('displayNewProjet', displayNewProjet);

	socket.emit("displayPage", currentSession);

	// active fonctions
	addProjet();
	
	// Affiche le thum en arrière plan, il faut d'abord vérifier si ce thumb existe
	//$(".thumb-background img").attr("src", originUrl+ "/" +currentSession + "/"+ currentSession +"-thumb.jpg");
	
	/* sockets */
	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
		//socket.emit('newUser', {id: sessionId});
	};

	function onSocketError(reason) {
		console.log('Unable to connect to server', reason);
	};

	// Affiche la liste des sessions
	function onlistProjets(projet) {
		var projectName = projet.name.replace(/_/g," ");
		if(projet.thumb != "none"){
			$(".projets-block .list-projets ul").append('<li class="item-project vignette"><a href="'+domainUrl +'/'+ projet.name+'/publi"><h2>'+projectName+'</h2><p class="description">'+projet.description+'</p><img src="' + originUrl + '/'+projet.session+ '/'+projet.name+'/'+projet.name +'-thumb.jpg"></a><div class="delete"><img src="/images/clear.svg"></div></li>');
		}
		else{
			$(".projets-block .list-projets ul").append('<li class="item-project vignette"><a href="'+domainUrl +'/'+ projet.name+'/publi"><h2>'+projectName+'</h2><p class="description">'+projet.description+'</p></a><div class="delete"><img src="/images/clear.svg"></div></li>');
		}
		deleteProjet();
	}

	//Ajouter un projet
	function addProjet(){
		$("#add-projet").on('click', function(){
			var newContentToAdd = "<h3 class='popoverTitle'>Ajouter un nouveau projet</h3><form onsubmit='return false;' class='add-project'><input class='new-projet' placeholder='Nom'></input><input class='description-projet' placeholder='Description'></input><input type='file' id='thumbfile' accept='image/*' placeholder='Ajouter une image'></input><label for='thumbfile'>Ajouter une image</label><input type='submit' class='submit-projet'></input></form>";
			var closeAddProjectFunction = function() {
			};

			fillPopOver( newContentToAdd, $(this), 300, 300, closeAddProjectFunction);
			imageData = null;
			var fileName;
			
			uploadImage($("#thumbfile"));
			submitProjet($('input.submit-projet'), 'newProjet', closeAddProjectFunction);
			
		});
	}

	function displayNewProjet(projet){
		var projectName = projet.format;
		if(projet.thumb != "none"){
			$(".projets-block .list-projets ul").prepend('<li class="item-project vignette"><a href="'+domainUrl +'/'+ projectName+'/publi"><h2>'+projet.name+'</h2><p class="description">'+projet.description+'</p><img src="' + originUrl + '/'+projet.session+ '/'+projectName+'/'+projectName +'-thumb.jpg"></a><div class="delete"><img src="/images/clear.svg"></div></li>');
		}
		else{
			$(".projets-block .list-projets ul").prepend('<li class="item-project vignette"><a href="'+domainUrl +'/'+ projectName+'/publi"><h2>'+projet.name+'</h2><p class="description">'+projet.description+'</p></a><div class="delete"><img src="/images/clear.svg"></div></li>');
		}
		deleteProjet();
		
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

	function submitProjet($button, send, closeAddProjectFunction, oldSession){
		$button.on('click', function(){
			var newProjet = $('input.new-projet').val();
			var description = $('input.description-projet').val();

			if(imageData != null){
				console.log('Une image a été ajoutée');
				var f = imageData[0];
				var reader = new FileReader();
				reader.onload = function(evt){
					socket.emit(send, {session: currentSession, name: newProjet, description:description , file:evt.target.result, fileName:fileName});
				};
				reader.readAsDataURL(f);
			}
			else{
				console.log("Pas d'image chargé");
				socket.emit(send, {session: currentSession, name: newProjet, description:description});
			}
			closePopover(closeAddProjectFunction);
		})
	}

	function deleteProjet(){
		var $delButton = $(".vignette .delete");
		$delButton.click(function(){
			var projetName = $(this).parent().children("a").attr('href').split("/select/" + app.session +"/").pop();
			var projetNameClean = projetName.replace("/publi", "");
			console.log(projetNameClean);
			if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
				socket.emit("deleteProjet", app.session, projetNameClean);
				$(this).parent(".vignette").remove();
	    }
	    return false;
		}); 
	}

});











