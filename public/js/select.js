jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var domainUrl = window.location.host;
	var socket = io.connect();
	var sessionId = '';
	var time;
	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);
	socket.on('listMedias', ondisplayMedias);
	socket.emit('newUserSelect', {id: socket.io.engine.id, name: app.session});

	/**
	* handlers
	*/
	/* sockets */


	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
	};
	function onSocketError(reason) {
		console.log('Unable to connect to server', reason);
	};

	function ondisplayMedias(array, json){
		for (var i = 0; i < array.length; i++) {    	
    	var extension = array[i].split('.').pop();
    	var identifiant =  array[i].replace("." + extension, "");
    	//console.log(identifiant);
			if(extension == "jpg"){
				$('.mediaContainer').append("<li class='media images-bibli' id='"+ identifiant+"'><div class='mediaContent'><img src='https://"+domainUrl + "/" +app.session + "/"+ array[i] + "' preload='none'></div></li>");
			}
			if(extension == "mp4" || extension == "webm"){
				$('.mediaContainer').append("<li class='media videos-bibli' id='"+ identifiant+"'><div class='mediaContent'><video preload='none' controls><source src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "'></video></div></li>");""
			}
			if(extension == "wav"){
				$('.mediaContainer').append("<li class='media sons-bibli' id='"+ identifiant+"'><div class='mediaContent'><audio src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "' preload='none' controls></div></li>");""
				//console.log(array[i]);
			}
		}
		var matchID = $(".mediaContainer .media").attr("id");
		$.each(json["files"]["images"], function(i, val) {
			timestampToDate(val['name']);
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +time+ "</h3>");
		});
		$.each(json["files"]["stopmotion"], function(i, val) {
			timestampToDate(val['name']);
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +time + "</h3>");
		});
		$.each(json["files"]["videos"], function(i, val) {
			timestampToDate(val['name']);
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +time + "</h3>");
		});
		$.each(json["files"]["audio"], function(i, val) {
			timestampToDate(val['name']);
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +time+ "</h3>");
		});
	}

	function ondisplayVideos(videos){
    $('.mediaContainer').append("<li class='video-bibli'><video controls preload='none' controls><source src='https://"+domainUrl + "/"+app.session + "/" + videos + "' type='video/webm'></video></li>");    	
	}

	function ondisplayAudio(audio){
    $('.mediaContainer').append("<li class='audio-bibli'><audio controls src='https://"+domainUrl + "/"+app.session + "/" + audio + "'></li>");    	
	}

	function timestampToDate(timestamp){
    var date = new Date(timestamp);
		// hours part from the timestamp
		var hours = date.getHours();
		// minutes part from the timestamp
		var minutes = "0" + date.getMinutes();
		// seconds part from the timestamp
		var seconds = "0" + date.getSeconds();

		// will display time in 10:30:23 format
		time = hours + 'h' + minutes.substr(minutes.length-2);
		//console.log(time);
	}

});