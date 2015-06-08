jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var domainUrl = window.location.host;
	var socket = io.connect();
	var sessionId = '';

	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);
	socket.on('listMedias', ondisplayMedias);

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
		for (var i = 0; i < array.length; i++) {    	
    	var extension = array[i].split('.').pop();
    	var identifiant =  array[i].replace("." + extension, "");
    	console.log(identifiant);
			if(extension == "jpg"){
				$('.mediaContainer').append("<li class='media images-bibli' id='"+ identifiant+"'><div class='mediaContent'><img src='https://"+domainUrl + "/" +app.session + "/"+ array[i] + "'></div></li>");
			}
			if(extension == "webm" || extension == "mp4"){
				$('.mediaContainer').append("<li class='media videos-bibli' id='"+ identifiant+"'><div class='mediaContent'><video src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "' controls></div></li>");""
			}
			if(extension == "wav"){
				$('.mediaContainer').append("<li class='media sons-bibli' id='"+ identifiant+"'><div class='mediaContent'><audio src='https://"+domainUrl + "/"+app.session + "/" + array[i] + "' controls></div></li>");""
				//console.log(array[i]);
			}
		}
		var matchID = $(".mediaContainer .media").attr("id");
		$.each(json["files"]["images"], function(i, val) {
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +val['titre'] + "</h3>");
		  //console.log(i + "-" + val["titre"]);
		});
		$.each(json["files"]["stopmotion"], function(i, val) {
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +val['titre'] + "</h3>");
		  //console.log(i + "-" + val["titre"]);
		});
		$.each(json["files"]["videos"], function(i, val) {
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +val['titre'] + "</h3>");
		  //console.log(i + "-" + val["titre"]);
		});
		$.each(json["files"]["audio"], function(i, val) {
			$("#" + val['name']).append("<h3 class='mediaTitre'>" +val['titre'] + "</h3>");
		  //console.log(i + "-" + val["titre"]);
		});
		//var identifiant = images.replace(".jpg", "");
		//for(var i=0; i<images.length; i++) {
        	// $('.mediaContainer').append("<li><img src='http://localhost:8080/" + app.session + "/" + images[i] + "'></li>");
   //  	$('.mediaContainer').append("<li class='images-bibli' id='"+ identifiant+"'' ><img src='http://localhost:8080/" + app.session + "/" + images + "'></li>");    	
   //  //}
   //  	//console.log(json["files"]["images"]['name']);
   //  	var matchID = $(".images-bibli").attr("id");
			// // for(var key in json["files"]["images"]) {
			// // 	console.log(key['name']);	
			// // 	//if(matchID == json["files"]["images"][key]['name']){
			// // 		$("#" + json["files"]["images"][key]['name']).append("<h2>" +json["files"]["images"][key]['titre'] + "</h2>");
	  // //  			//console.log("key:"+key+", value:"+json["files"]["images"][key]['titre']);
	  // //  		//}
			// // }
			// $.each(json["files"]["images"], function(i, val) {
			// 		$("#" + val['name']).append("<h2>" +val['titre'] + "</h2>");
			//   //console.log(i + "-" + val["titre"]);
			// });
	}

	function ondisplayVideos(videos){
    $('.mediaContainer').append("<li class='video-bibli'><video controls src='https://"+domainUrl + "/"+app.session + "/" + videos + "'></li>");    	
	}

	function ondisplayAudio(audio){
    $('.mediaContainer').append("<li class='audio-bibli'><audio controls src='https://"+domainUrl + "/"+app.session + "/" + audio + "'></li>");    	
	}

});