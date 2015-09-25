jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var domainUrl = window.location.href;
	var socket = io.connect();
	var sessionId = '';
	var session = {};
	var sessionList = [];

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
		$(".session .list-session ul").append('<li class="session-project"><a href="'+domainUrl+'select/'+req.name+'"><h2>'+req.name+'</h2><p class="description">'+req.description+'</p><img src="' + domainUrl +req.name+'/'+ req.name +'-thumb.jpg"></a></li>')
	}

	//Ajouter une session
	function addSession(){
		$("#add-session").on('click', function(){
			var newContentToAdd = "<h3 class='popoverTitle'>Ajouter une nouvelle session</h3><form onsubmit='return false;' class='add-project'><input class='new-session' placeholder='Nom'></input><input class='description-session' placeholder='Description'></input><input type='file' id='thumbfile' accept='image/*'></input><input type='submit' class='submit-session'></input></form>";
			
			var closeAddProjectFunction = function() {
			};

			fillPopOver( newContentToAdd, $(this), 300, 300, closeAddProjectFunction);
			var imageData;
			
			$('#thumbfile').bind('change', function(e){
		  	//upload(e.originalEvent.target.files);
		  	imageData = e.originalEvent.target.files;
			});
			
			$('input.submit-session').on('click', function(){
				var newSession = $('input.new-session').val();
				var description = $('input.description-session').val();
				var f = imageData[0];
				var reader = new FileReader();
				session = {
        			name: newSession 
    			}
    		sessionList.push(session);
    		reader.onload = function(evt){
					socket.emit('newSession', {name: newSession, description:description , file:evt.target.result});
				};
				reader.readAsDataURL(f);
				closePopover(closeAddProjectFunction);

			})
		})
	}

	function displayNewSession(req){
		$(".session .list-session ul").prepend('<li class="session-project"><a href="'+domainUrl+'select/'+req.name+'"><h2>'+req.name+'</h2><p class="description">'+req.description+'</p><img src="' + domainUrl +req.name+'/'+ req.name +'-thumb.jpg"></a></li>');
	}

});











