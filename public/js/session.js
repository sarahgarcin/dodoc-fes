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
	//$('body').css({'background':"url("+originUrl+ "/" +currentSession + "/"+ currentSession +"-thumb.jpg) no-repeat fixed", "background-size":"cover"});
	$(".thumb-background img").attr("src", originUrl+ "/" +currentSession + "/"+ currentSession +"-thumb.jpg");

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
		$(".projets-block .list-projets ul").append('<li class="item-project vignette"><a href="'+domainUrl +'/'+ projet.name+'/publi"><h2>'+projet.name+'</h2><p class="description">'+projet.description+'</p><img src="' + originUrl + '/'+projet.session+ '/'+projet.name+'/'+projet.name +'-thumb.jpg"></a></li>');
	}

	//Ajouter une session
	function addProjet(){
		$("#add-projet").on('click', function(){
			var newContentToAdd = "<h3 class='popoverTitle'>Ajouter un nouveau projet</h3><form onsubmit='return false;' class='add-project'><input class='new-projet' placeholder='Nom'></input><input class='description-projet' placeholder='Description'></input><input type='file' id='thumbfile' accept='image/*' placeholder='Ajouter une image'></input><label for='thumbfile'>Ajouter une image</label><input type='submit' class='submit-projet'></input></form>";
			
			var closeAddProjectFunction = function() {
			};

			fillPopOver( newContentToAdd, $(this), 300, 300, closeAddProjectFunction);
			var imageData;
			
			$('#thumbfile').bind('change', function(e){
		  	//upload(e.originalEvent.target.files);
		  	imageData = e.originalEvent.target.files;
		  	//change the label of the button in the name of the image
		  	var file = this.files[0].name;
			  var dflt = $(this).attr("placeholder");
			  if($(this).val()!=""){
			    $(this).next().text(file);
			  } else {
			    $(this).next().text(dflt);
			  }
			});
			
			$('input.submit-projet').on('click', function(){
				var newProjet = $('input.new-projet').val();
				var description = $('input.description-projet').val();
				var f = imageData[0];
				var reader = new FileReader();
				// session = {
    //     			name: newSession 
    // 			}
    // 		sessionList.push(session);
    		reader.onload = function(evt){
					socket.emit('newProjet', {session: currentSession, name: newProjet, description:description , file:evt.target.result});
				};
				reader.readAsDataURL(f);
				closePopover(closeAddProjectFunction);

			})
		})
	}

	function displayNewProjet(projet){
		$(".projets-block .list-projets ul").prepend('<li class="item-project vignette"><a href="'+domainUrl +'/'+ projet.name+'/publi"><h2>'+projet.name+'</h2><p class="description">'+projet.description+'</p><img src="' + originUrl + '/'+projet.session+ '/'+projet.name+'/'+projet.name +'-thumb.jpg"></a></li>');
	}

});











