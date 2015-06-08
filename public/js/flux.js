jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var domainUrl = window.location.href;
	var host = window.location.host;
	var socket = io.connect();
	var sessionId = '';
	console.log(host);
	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);
	socket.on('listMedias', ondisplayMedias);
	socket.on('displayNewImage', displayNewImage);
	socket.on('displayNewStopMotion', displayNewStopMotion);
	socket.on('displayNewVideo', displayNewVideo);
	socket.on('displayNewAudio', displayNewAudio);


	socket.emit('newUserSelect', {id: socket.io.engine.id, name: app.session});

	/**
	* handlers
	*/
	/* sockets */


	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
		// socket.emit('newUserSelect', {id: sessionId, name: app.session});
	};
	function onSocketError(reason) {
		console.log('Unable to connect to server', reason);
	};

	function ondisplayMedias(array, json){
		for (var i = 0; i < array.length; i++) {    	
    	var extension = array[i].split('.').pop();
    	var identifiant =  array[i].replace("." + extension, "");
			if(extension == "jpg"){
				$('.container-flux .content ul').prepend("<li class='images-bibli' id='"+ identifiant+"'' ><img src='https://"+host+"/" + app.session + "/" + array[i] + "'></li>");
			}
			if(extension == "webm" || extension == "mp4"){
				$('.container-flux .content ul').prepend("<li class='videos-bibli' id='"+ identifiant+"'' ><video src='https://"+host+"/" + app.session + "/" + array[i] + "' controls preload='none'></li>");
			}
			if(extension == "wav"){
				$('.container-flux .content ul').prepend("<li class='sons-bibli' id='"+ identifiant+"'' ><audio src='https://"+host+"/" + app.session + "/" + array[i] + "' controls preload='none'></li>");
			}
		}
	}

	function displayNewImage(req){
		if(req.extension == "jpg"){
			$('.container-flux .content ul').prepend("<li class='images-bibli' id='"+ req.title+"'' ><img src='https://"+host+"/" + app.session + "/" + req.file + "'></li>");
		}
	}

	function displayNewStopMotion(req){
		if(req.extension == "mp4"){
			$('.container-flux .content ul').prepend("<li class='motion-bibli' id='"+ req.title+"'' ><video src='https://"+host+"/" + app.session + "/" + req.file + "' controls preload='none'></li>");
		}
	}

	function displayNewVideo(req){
		if(req.extension == "webm"){
			$('.container-flux .content ul').prepend("<li class='video-bibli' id='"+ req.title+"'' ><video src='https://"+host+"/" + app.session + "/" + req.file + "' controls preload='none'></li>");
		}
	}

	function displayNewAudio(req){
		if(req.extension == "wav"){
			$('.container-flux .content ul').prepend("<li class='audio-bibli' id='"+ req.title+"'' ><audio src='https://"+host+"/" + app.session + "/" + req.file + "' controls preload='none'></li>");
		}
	}
});