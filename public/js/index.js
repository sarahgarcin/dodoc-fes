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
	function onlistSessions(session) {
		$(".session .list-session ul").prepend('<li class="session-project"><a href="'+domainUrl+'select/'+session+'">'+session+'</a></li>')
	}

	//Ajouter une session
	function addSession(){
		$("#add-session").on('click', function(){
			$(this).off();
			$(".session").append("<div class='add-project'><input class='new-session'></input><input type='submit' class='submit-session'></input></div>");
			$('input.submit-session').on('click', function(){
				var newSession = $('input.new-session').val();
				session = {
        			name: newSession 
    			}
    			sessionList.push(session);
				socket.emit('newSession', {name: newSession});
				$(".add-project").remove();
				$("#add-session").on();
			})
		})
	}

	function displayNewSession(req){
		$(".session .list-session ul").prepend('<li class="session-project"><a href="'+domainUrl+'select/'+req.name+'">'+req.name+'</a></li>');
	}

});











