jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var domainUrl = window.location.href;
	var host = window.location.host;
	var socket = io.connect();
	var sessionId = '';
	var time;
	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);
	socket.on('puclicationPage', onPublicationPage);


	//socket.emit('newUserSelect', {id: socket.io.engine.id, name: app.session});
	//ondisplayMedias();

	/**
	* handlers
	*/
	/* sockets */


	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
		socket.emit('newUserPubli', app.session);
	};


	function onSocketError(reason) {
		console.log('Unable to connect to server', reason);
	};

	function onPublicationPage(html){
		var htmlContent = html;
		$(".container-publi .content").html(htmlContent);
		$(".container-publi .content").find(".remove-media").remove();
		var publiTitle = $(".container-publi .content").find(".montage-title input").val();
		$(".container-publi .content").find(".montage-title").append("<h2>"+publiTitle+"</h2>");
		$(".container-publi .content").find(".montage-title input").remove();

		$(".container-publi .content").find(".mediaContent")
			.removeClass("clone-media")
			.removeClass("pep-active")
			.removeClass("pep-ease")
			.attr("style", "");
	}

});
