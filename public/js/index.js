jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
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

	// active fonctions
		addSession();
		//displaySession();

	/**
	* handlers
	*/
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
	function onlistSessions(list) {
		console.log(list);
		sessionList = list;
        for(var i=0; i<sessionList.length; i++) {
        	$('.session').prepend('<a href="/select/'+ sessionList[i] +'"><li>' + sessionList[i] + '</li></a>');
        }
	}

	//Ajouter une session
	function addSession(){
		$("#add-session").on('click', function(){
			$(".session").append("<input class='new-session'></input><input type='submit' class='submit-session'></input>");
			$('input.submit-session').on('click', function(){
				var newSession = $('input.new-session').val();
				session = {
        			name: newSession 
    			}
    			sessionList.push(session);
				socket.emit('newSession', {name: newSession});
			})
		})
	}

	function displaySession(){
		$.getJSON('http://localhost:8080/sessions.json', function(data) {
			var items = [];
			$.each( data, function( key, val ) {
				items.push( "<li id='" + key + "'>" + val.name + "</li>" );
				console.log(items);
			});
			 
			$( "<ul/>", {
			    "class": "my-new-list",
			    html: items.join( "" )
			  }).appendTo( "body" );

		});
		console.log(sessionList);
	}



});











