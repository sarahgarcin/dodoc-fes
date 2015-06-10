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
	socket.on('displayNewImage', displayNewImage);
	socket.on('displayNewStopMotion', displayNewStopMotion);
	socket.on('displayNewVideo', displayNewVideo);
	socket.on('displayNewAudio', displayNewAudio);

	/**
	* handlers
	*/
	/* sockets */


	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
			socket.emit('newUserSelect', {id: sessionId, name: app.session});
	};

	function onSocketError(reason) {
		console.log('Unable to connect to server', reason);
	};

	function ondisplayMedias(array, json){
		$(".mediaContainer li").remove();
		for (var i = 0; i < array.length; i++) {
    	var extension = array[i].split('.').pop();
    	var identifiant =  array[i].replace("." + extension, "");
			if(extension == "jpg"){
				$('.mediaContainer').append("<li class='media images-bibli' id='"+ identifiant+"'><div class='mediaContent'><img src='https://"+domainUrl + "/" +app.session + "/"+ array[i] + "' preload='none'></div></li>");
			}
			if(extension == "webm"){
				$('.mediaContainer').append("<li class='media videos-bibli' id='"+ identifiant+"'><div class='mediaContent'><video preload='none' controls poster='https://"+domainUrl + "/"+app.session + "/"+identifiant +"-thumb.png'><source src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "'></video></div></li>");
			}
			if(extension == "mp4"){
				$('.mediaContainer').append("<li class='media stopmotion-bibli' id='"+ identifiant+"'><div class='mediaContent'><video preload='none' controls poster='https://"+domainUrl + "/"+app.session + "/"+identifiant +"-thumb.png'><source src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "'></video></div></li>");
			}
			if(extension == "wav"){
				$('.mediaContainer').append("<li class='media sons-bibli' id='"+ identifiant+"'><div class='mediaContent'><audio src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "' preload='none' controls></div></li>");
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

	function displayNewImage(images){
		timestampToDate(images.title);
	   $('.mediaContainer').append("<li class='media images-bibli' id='"+ images.title+"'><div class='mediaContent'><img src='https://"+domainUrl + "/" +app.session + "/"+ images.file + "' preload='none'></div><h3 class='mediaTitre'>" +time+ "</h3></li>");
	}

	function displayNewStopMotion(stopmotion){
		timestampToDate(stopmotion.title);
	  $('.mediaContainer').append("<li class='media stopmotion-bibli' id='"+ stopmotion.title+"'><div class='mediaContent'><video controls preload='none' poster='https://"+domainUrl + "/"+app.session + "/"+stopmotion.title +"-thumb.png'><source src='https://"+domainUrl + "/"+app.session + "/" + stopmotion.file + "' type='video/webm'></video></div><h3 class='mediaTitre'>" +time+ "</h3></li>");
	}

	function displayNewVideo(videos){
		timestampToDate(videos.title);
	  $('.mediaContainer').append("<li class='media videos-bibli' id='"+ videos.title+"'><div class='mediaContent'><video controls preload='none' poster='https://"+domainUrl + "/"+app.session + "/"+videos.title +"-thumb.png'><source src='https://"+domainUrl + "/"+app.session + "/" + videos.file + "' type='video/webm'></video></div><h3 class='mediaTitre'>" +time+ "</h3></li>");
	}

	function displayNewAudio(audio){
		timestampToDate(audio.title);
 	  $('.mediaContainer').append("<li class='media sons-bibli' id='"+ audio.title+"''><div class='mediaContent'><audio src='https://"+domainUrl + "/"+app.session + "/" + audio.file + "' preload='none' controls></div><h3 class='mediaTitre'>" +time+ "</h3></li>");
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