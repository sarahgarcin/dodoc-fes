var fs = require('fs-extra'),
	glob = require("glob"),
	path = require("path"),
	gm = require('gm'),
	markdown = require( "markdown" ).markdown,
	exec = require('child_process').exec,
	phantom = require('phantom'),
	ffmpeg = require('fluent-ffmpeg'),
	sprintf = require("sprintf-js").sprintf,
	vsprintf = require("sprintf-js").vsprintf;


var uploadDir = '/uploads';


module.exports = function(app, io){

	console.log("main module initialized");

	// VARIABLES
	var sessions_p = "sessions/";
	var session_list = [];
	currentDate = Date.now();

	io.on("connection", function(socket){
		socket.on("newUser", onNewUser);
		socket.on("displayPage", onDisplayPage);
		socket.on("newUserSelect", listMedias);
		socket.on("newSession", addNewSession);
		socket.on("deleteSession", deleteSession);
		socket.on("modifySession", modifySession);
		socket.on("sessionIsModify", onSessionModify);
		socket.on("newProjet", addNewProjet);
		socket.on("deleteProjet", deleteProjet);
		socket.on("imageCapture", onNewImage);
		socket.on("newStopMotion", onNewStopMotion);
		socket.on("imageMotion", onNewImageMotion);
		socket.on("stopmotionCapture", onStopMotionCapture);
		socket.on("audioVideo", onNewAudioVideo);
		socket.on("audioCapture", onNewAudioCapture);
		socket.on("deleteFile", deleteFile);
		socket.on("deleteImageMotion", deleteImageMotion);
		socket.on("saveMontage", saveMontage);
		socket.on("titleMontage", titleMontage);
		socket.on('sendPublication', onPublication);
		socket.on('sendMetaData', onMetaData);
		// receive a new text media
		socket.on("newTextMedia", onNewTextMedia);
		// receive a new local media
		socket.on("newLocalMedia", onNewLocalMedia);
		socket.on('newUserPubli', displayPubli);

	});

	// events

	function onNewUser(req){
		console.log(req);
		listSessions();
	};
	function onDisplayPage(req){
		listProjets(req);	
	};

	//Ajoute le dossier de la session + l'ajouter à la liste des sessions
	function addNewSession(session) {
		var sessionName = session.name.replace(/ /g,"_");
    var sessionPath = 'sessions/'+sessionName;
		fs.ensureDirSync(sessionPath);

		if(session.file){
			var thumbName = sessionName + "-thumb";
	    var filePath = sessionPath + "/" + thumbName + ".jpg";

	    var imageBuffer = decodeBase64Image(session.file);

	    fs.writeFile(filePath, imageBuffer.data, function (err) {
	        console.info("write new file to " + filePath);
	    });
	    writeJsonFile(session.fileName);
	    io.sockets.emit("displayNewSession", {name: session.name, description: session.description, format: sessionName, thumb:session.fileName});
	  }
	  else{
	  	writeJsonFile("none");
	  	io.sockets.emit("displayNewSession", {name: session.name, description: session.description, format: sessionName, thumb:"none"});
	  }

	  function writeJsonFile(fichier){
	  	var jsonFile = 'sessions/' + sessionName + '/' +sessionName+'.json';
			var objectJson = {"name":session.name, "description":session.description, "fileName":fichier}
			var jsonString = JSON.stringify(objectJson);
			fs.appendFile(jsonFile, jsonString, function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	          console.log("Session was created!");
	      }
	    });
	  }
	}

	function deleteSession(session){
		var sessionPath = 'sessions/'+session;
		rmDir(sessionPath);
	}

	function modifySession(session){
		var sessionName = session.replace(/ /g,"_");
		var sessionPath = 'sessions/' + sessionName;
		var data = fs.readFileSync(sessionPath + "/" + sessionName + ".json", "UTF-8");
		var jsonObj = JSON.parse(data);
    io.sockets.emit('changeSession', {session: sessionName, name:jsonObj.name, description: jsonObj.description, file:jsonObj.fileName});
	}

 	function onSessionModify(data){
 		var sessionName = data.name.replace(/ /g,"_");
 		var oldFolder = 'sessions/' + data.old; 
 		var newFolder = 'sessions/' + sessionName;
 		fs.renameSync(oldFolder, newFolder);
 		var oldFileName = 'sessions/' + sessionName + "/" + data.old+".json"; 
 		var fileName = 'sessions/' + sessionName + '/'+sessionName+'.json'; 
 		fs.renameSync(oldFileName, fileName);
		var jsonContent = fs.readFileSync(fileName,"UTF-8");
		var jsonObj = JSON.parse(jsonContent);
		jsonContent.name = data.name;
		jsonContent.description = data.description;
		jsonContent.file = data.fileName;
		fs.writeFileSync(fileName, JSON.stringify(jsonContent));

		//write image file
		var thumbName = sessionName + "-thumb";
    var filePath = 'sessions/'+ newFolder + "/" + thumbName + ".jpg";

    var imageBuffer = decodeBase64Image(data.file);

    fs.writeFile(filePath, imageBuffer.data, function (err) {
        console.info("write new file to " + filePath);
    });
	}

	function addNewProjet(projet) {
		var projectName = projet.name.replace(/ /g,"_");
    var projetPath = 'sessions/'+projet.session+"/"+projectName;
		fs.ensureDirSync(projetPath);

		if(projet.file){
			var thumbName = projectName + "-thumb";
	    var filePath = projetPath + "/" + thumbName + ".jpg";
	    var imageBuffer = decodeBase64Image(projet.file);
	    fs.writeFile(filePath, imageBuffer.data, function (err) {
	        console.info("write new file to " + filePath);
	    });
			var jsonFile = projetPath+ "/" +projectName+'.json';
			var objectJson = {"session":projet.session, "name":projet.name, "description":projet.description, "fileName":projet.fileName, "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}}
			var jsonString = JSON.stringify(objectJson);
			fs.appendFile(jsonFile, jsonString, function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	        console.log("Session was created!");
	      }
	    });
	    io.sockets.emit("displayNewProjet", {session: projet.session, name: projet.name, format: projectName, description: projet.description, thumb:projet.fileName});
	  }
	  else{
	  	var jsonFile = projetPath+ "/" +projectName+'.json';
			var objectJson = {"session":projet.session, "name":projet.name, "description":projet.description, "fileName":"none", "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}}
			var jsonString = JSON.stringify(objectJson);
			fs.appendFile(jsonFile, jsonString, function(err) {
	      if(err) {console.log(err);} 
	      else {console.log("Session was created!");}
	    });
	  	io.sockets.emit("displayNewProjet", {session: projet.session, name: projet.name, format: projectName, description: projet.description, thumb:"none"});
	  }
	}

	function deleteProjet(session, projet){
		var projetPath = 'sessions/'+session+'/'+projet;
		console.log(projetPath);
		rmDir(projetPath);
	}

	//Liste les dossiers dans sessions/
	function listSessions() {
		var dir = "sessions/";
		var sessionList = [];
		fs.readdir(dir, function (err, files) { if (err) throw err;
		  files.forEach( function (file) {
		    files.push(file);
		    // if(file == ".DS_Store"){
		    // 	fs.unlink(dir+'.DS_Store');
		    // }
		    if(! /^\..*/.test(file)){
			    var jsonFile = dir + file + '/' +file+'.json';
					var data = fs.readFileSync(jsonFile,"UTF-8");
					var jsonObj = JSON.parse(data);
					var Obj = {name:file, description: jsonObj.description, thumb: jsonObj.fileName};
			    io.sockets.emit('listSessions', {name:file, description: jsonObj.description, thumb: jsonObj.fileName});
			    session_list.push(Obj);
			  }
		  });
		});
	}

	//Liste les dossiers projets dans sessions/nomdelasession/
	function listProjets(session) {
		var sessionPath = 'sessions/'+ session +"/";
		fs.readdirSync(sessionPath).filter(function(file) {
			if(fs.statSync(path.join(sessionPath, file)).isDirectory()){
				console.log(file);
				if(! /^\..*/.test(file)){
					var jsonFile = sessionPath + file + '/' +file+'.json';
					var data = fs.readFileSync(jsonFile,"UTF-8");
					var jsonObj = JSON.parse(data);
			    io.sockets.emit('listProjets', {session: session, name:file, description: jsonObj.description, thumb: jsonObj.fileName});
		  	}
			}
  	});
	}

	function deleteFile(req){
		var dir = 'sessions/' + req.name ;
		console.log('delete file');
		fs.readdir(dir,function(err,files){
	    if(err) throw err;
	    fs.unlink(dir + '/' + files[files.length - 2]);
	    listMedias(req);
		});
	}

	//Liste les medias sur la page select et flux
	function listMedias(req){
		//read json file to send data
		var jsonFile = 'sessions/' + req.name + '/' + req.projet +'/'+req.projet+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);

		var dir = "sessions/" + req.name + '/' + req.projet;
		fs.readdir(dir, function(err, files) {
			var media = [];
			if (err) return;
			files.forEach(function(f) {
				media.push(f);
			});
			io.sockets.emit('listMedias', media,jsonObj);
		});

		//show montage 
		var htmlFile = 'sessions/' + req.name + '/montage.html';
		if(fs.existsSync(htmlFile)){
			fs.readFile(htmlFile,"UTF-8", function (err, data) {
		    if (err) {
		       throw err;
		    }
		    io.sockets.emit('displayMontage', data);
			});
		}
	}

	//ajoute les images au dossier de session
	function onNewImage(req) {
		var imageBuffer = decodeBase64Image(req.data);
		currentDate = Date.now();
		filename = 'sessions/' + req.name + '/' +req.projet+"/"+ currentDate + '.jpg';
		fs.writeFile(filename , imageBuffer.data, function(err) { 
			//console.log(err);
		});
		
		var jsonFile = 'sessions/' + req.name + '/'+ req.projet+"/" +req.projet+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);
		var jsonAdd = { "name" : currentDate};
		jsonObj["files"]["images"].push(jsonAdd);
		fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
    });
    io.sockets.emit("displayNewImage", {file: currentDate + ".jpg", extension:"jpg", name:req.name, projet:req.projet, title: currentDate});
	}

	// Crée un nouveau dossier pour le stop motion
	function onNewStopMotion(req) {
		var StopMotionDirectory = 'sessions/' + req.name +'/'+ req.projet+'/01-stopmotion';
		if(StopMotionDirectory){
			fs.removeSync(StopMotionDirectory);
		}
		fs.ensureDirSync(StopMotionDirectory);
		io.sockets.emit('newStopMotionDirectory', StopMotionDirectory);
	}

	// Ajoute des images au dossier du stop motion
	function onNewImageMotion(req) {
		var imageBuffer = decodeBase64Image(req.data);
		filename = req.dir + '/' + req.count + '.png';
		fs.writeFile(filename , imageBuffer.data, function(err) { 
			// console.log(err);
		});
	}


	function deleteImageMotion(req){
		filename = req.dir + '/' + req.count + '.png';
		fs.unlinkSync(filename, function (err) {
	  if (err) throw err;
	  	console.log('successfully deleted ' + filename);
		});
	}

	//Don't use this function
	function onStopMotion(req) {
		//console.log(req.dir);
		var videoPath = 'sessions/' + req.name + '/01-stopmotion.mp4';
		if(videoPath){
			fs.remove(videoPath);
		}
		//make sure you set the correct path to your video file
		var proc = new ffmpeg({ source: req.dir + '/%d.png'})
		  // using 12 fps
		  .fps(3)
		  // setup event handlers
		  .on('end', function() {
		    console.log('file has been converted succesfully');
		  })
		  .on('error', function(err) {
		    console.log('an error happened: ' + err.message);
		  })
		  // save to file
		  .save(videoPath);
	}

	//Transforme les images en vidéos.
	function onStopMotionCapture(req){
		currentDate = Date.now();
		var fileName = currentDate;
		
		//SAVE VIDEO
		var videoPath = 'sessions/' + req.name + '/' +req.projet+'/'+ fileName + '.mp4';
		//make sure you set the correct path to your video file
		var proc = new ffmpeg({ source: req.dir + '/%d.png'})
		  // using 12 fps
		  .withFpsInput(5)
		  .fps(5)
		  // setup event handlers
		  .on('end', function() {
		    console.log('file has been converted succesfully');
		    io.sockets.emit("newStopMotionCreated", {fileName:fileName + '.mp4', name:req.name, projet:req.projet, dir:req.dir });
		  	io.sockets.emit("displayNewStopMotion", {file: fileName + ".mp4", extension:"mp4", name:req.name, projet:req.projet, title: fileName});
		  	var proc = ffmpeg(videoPath)
			  // set the size of your thumbnails
			  //.size('150x100')
			  // setup event handlers
			  .on('end', function(files) {
			    console.log('screenshots were saved as ' + fileName + "-thumb.png");
			  })
			  .on('error', function(err) {
			    console.log('an error happened: ' + err.message);
			  })
			  // take 2 screenshots at predefined timemarks
			  .takeScreenshots({ count: 1, timemarks: [ '00:00:00'], filename: fileName + "-thumb.png"}, 'sessions/' + req.name+"/"+req.projet);
		  })
		  .on('error', function(err) {
		    console.log('an error happened: ' + err.message);
		  })
		  // save to file
		  .save(videoPath);

		var jsonFile = 'sessions/' + req.name + '/'+req.projet+"/"+req.projet+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);
		var jsonAdd = { "name" : currentDate};
		jsonObj["files"]["stopmotion"].push(jsonAdd);
		fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
    });

    
	}

	function onNewAudioVideo(data){
		var currentDate = Date.now();
	    var fileName = currentDate;
	    var VideoDirectory = 'sessions/' + data.name + '/'+ data.projet +'/00-audiovideo';
	    var projetDirectory = 'sessions/' + data.name + '/'+ data.projet;

	    writeToDisk(data.files.video.dataURL, fileName + '.webm', data.name, data.projet);
	    io.sockets.emit('merged', fileName + '.webm', data.name, data.projet);
	    
	    //Write data to json
	    var jsonFile = 'sessions/' + data.name + '/' +data.projet + '/'+data.projet +'.json';
			var jsonData = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(jsonData);
			var jsonAdd = { "name" : fileName};
			jsonObj["files"]["videos"].push(jsonAdd);
			fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	          console.log("The file was saved!");
	      }
	    });
	 		var proc = ffmpeg(projetDirectory + "/" + fileName + ".webm")
		  // set the size of your thumbnails
		  //.size('150x100')
		  // setup event handlers
		  .on('end', function(files) {
		    console.log('screenshots were saved as ' + files);
		  })
		  .on('error', function(err) {
		    console.log('an error happened: ' + err.message);
		  })
		  // take 2 screenshots at predefined timemarks
		  .takeScreenshots({ count: 1, timemarks: [ '00:00:01'], filename: fileName + "-thumb.png"}, projetDirectory);
		  
		  io.sockets.emit("displayNewVideo", {file: fileName + ".webm", extension:"webm", name:data.name, projet:data.projet, title: fileName});
	}

	function writeToDisk(dataURL, fileName, session, projet) {
	    var fileExtension = fileName.split('.').pop(),
	        fileRootNameWithBase = './sessions/' + session + '/' + projet + '/' + fileName,
	        filePath = fileRootNameWithBase,
	        fileID = 2,
	        fileBuffer;

	    // @todo return the new filename to client
	    while (fs.existsSync(filePath)) {
	        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
	        fileID += 1;
	    }

	    dataURL = dataURL.split(',').pop();
	    fileBuffer = new Buffer(dataURL, 'base64');
	    fs.writeFileSync(filePath, fileBuffer);
	    // console.log('filePath', filePath);
	}

	//I don't use it because I only save video without audio
	function merge(fileName, session) {
	    var FFmpeg = require('fluent-ffmpeg');

	    var audioFile = path.join(__dirname, 'sessions', session, '00-audiovideo', fileName + '.wav'),
	        videoFile = path.join(__dirname, 'sessions', session, '00-audiovideo', fileName + '.webm'),
	        mergedFile = path.join(__dirname, 'sessions', session, '00-audiovideo', fileName + '-merged.webm');

	    new FFmpeg({
	            source: videoFile
	        })
	        .addInput(audioFile)
	        .on('error', function (err) {
	            io.sockets.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message);
	        })
	        .on('progress', function (progress) {
	            io.sockets.emit('ffmpeg-output', Math.round(progress.percent));
	        })
	        .on('end', function () {
	            io.sockets.emit('merged', fileName + '-merged.webm', session);
	            console.log('Merging finished !');

	            // removing audio/video files
	            //fs.unlink(audioFile);
	            //fs.unlink(videoFile);
	        })
	        .saveToFile(mergedFile);
	}

	//I don't use this function
	function onNewAudioVideoCapture(req){
		var VideoDirectory = 'sessions/' + req.name + '/00-audiovideo/';
		var file = req.file.substring(0, 13);
		var filename = parseInt(file);

		//save only video without audio
    	var video = fs.createReadStream(VideoDirectory + file +".webm");
		var newVideo = fs.createWriteStream('sessions/' + req.name + '/' + file + ".webm" );
		video.pipe(newVideo);

		//add data to json file
		var jsonObj = null;
		var jsonFile = 'sessions/' + req.name + '/' +req.name+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		try{
			jsonObj = JSON.parse(data);
		}
		catch (e){
			// If an error occurs while parsing the JSON string reset object
      // and emit the error.
      jsonObj = null;
      console.log('error ' + e);
		}
		var jsonAdd = { "name" : filename};
		jsonObj["files"]["videos"].push(jsonAdd);
		fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
   		});

    	io.sockets.emit("displayNewVideo", {file: currentDate + ".webm", extension:"webm", name:req.name, title: currentDate});
	}

	function onNewAudioCapture(req){
		//write audio to disk
		var currentDate = Date.now();
		var fileName = currentDate;
	  	var fileWithExt = fileName + '.wav';
	  	var fileExtension = fileWithExt.split('.').pop(),
	      fileRootNameWithBase = './sessions/' + req.name +'/'+ req.projet +'/'+fileWithExt,
	      filePath = fileRootNameWithBase,
	      fileID = 2,
	      fileBuffer;

	    // @todo return the new filename to client
	    // while (fs.existsSync(filePath)) {
	    //     filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
	    //     fileID += 1;
	    // }

	    dataURL = req.data.audio.dataURL.split(',').pop();
	    fileBuffer = new Buffer(dataURL, 'base64');
	    fs.writeFileSync(filePath, fileBuffer);
	    io.sockets.emit('AudioFile', fileWithExt, req.name, req.projet);

			//add data to json file
			var jsonFile = 'sessions/' + req.name + '/'+ req.projet+'/'+req.projet+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);
			var jsonAdd = { "name" : currentDate};
			jsonObj["files"]["audio"].push(jsonAdd);
			fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	          console.log("The file was saved!");
	      }
	    });
	    io.sockets.emit("displayNewAudio", {file: fileName + ".wav", extension:"wav", name:req.name, projet:req.projet,title: fileName});
	}

	function saveMontage(html, session){
		var directory = 'sessions/'+ session + "/";
		var htmlFile = directory + "montage.html";
		var objectHtml = html;
		fs.writeFile(htmlFile, objectHtml, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("Montage HTML was saved");
      }
	  });
	}

	function titleMontage(title, session){
		io.sockets.emit("titreMontage", title);
	}

	function onMetaData(data){
		var imageTitle = data.imageTitre;
		var imageDesc = data.imagedescription;
		var imageId = data.imageId;
		var session = data.session;
		var projet = data.projet;
		var type = data.type;

		var jsonFile = 'sessions/' + session + '/'+ projet+"/" +projet+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);
		switch(type){
			case 'image':
				for(var i in jsonObj["files"]["images"]){
					//console.log("image titre: " + jsonObj["files"]["images"][i].name + " - image id: " + imageId);
					if(jsonObj["files"]["images"][i].name == imageId){
						console.log(jsonObj["files"]["images"][i]);
						jsonObj["files"]["images"][i]["titre"] = imageTitle;
						jsonObj["files"]["images"][i]["description"] = imageDesc;
						fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        console.log("The file was saved!");
					    }
					  });
					}
				}
				break;
			case 'video':
				for(var i in jsonObj["files"]["videos"]){
					if(jsonObj["files"]["videos"][i].name == imageId){
						console.log(jsonObj["files"]["videos"][i]);
						jsonObj["files"]["videos"][i]["titre"] = imageTitle;
						jsonObj["files"]["videos"][i]["description"] = imageDesc;
						fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        console.log("The file was saved!");
					    }
					  });
					}
				}
				break;
			case 'stopmotion':
				for(var i in jsonObj["files"]["stopmotion"]){
					if(jsonObj["files"]["stopmotion"][i].name == imageId){
						console.log(jsonObj["files"]["stopmotion"][i]);
						jsonObj["files"]["stopmotion"][i]["titre"] = imageTitle;
						jsonObj["files"]["stopmotion"][i]["description"] = imageDesc;
						fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        console.log("The file was saved!");
					    }
					  });
					}
				}
				break;
			case 'son':
				for(var i in jsonObj["files"]["audio"]){
					if(jsonObj["files"]["audio"][i].name == imageId){
						console.log(jsonObj["files"]["audio"][i]);
						jsonObj["files"]["audio"][i]["titre"] = imageTitle;
						jsonObj["files"]["audio"][i]["description"] = imageDesc;
						fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        console.log("The file was saved!");
					    }
					  });
					}
				}
				break;
			case 'texte':
				for(var i in jsonObj["files"]["texte"]){
					if(jsonObj["files"]["texte"][i].name == imageId){
						console.log(jsonObj["files"]["texte"][i]);
						jsonObj["files"]["texte"][i]["meta-titre"] = imageTitle;
						jsonObj["files"]["texte"][i]["description"] = imageDesc;
						fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        console.log("The file was saved!");
					    }
					  });
					}
				}
				break;
		}
	}

	function onNewTextMedia(text){
		var session = text.session;
		var projet =text.projet;
		var date = Date.now();

		var jsonFile = 'sessions/' + session + '/'+ projet+"/" +projet+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);
		var jsonAdd = { "name" : date, "titre":text.titre, "contenu":text.texte};
		jsonObj["files"]["texte"].push(jsonAdd);
		fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
    });
    io.sockets.emit("displayNewText", {title:date, projet:projet, session: session, textTitre: text.titre, textContent: text.texte});
	}

	function onNewLocalMedia(data){
		var imageBuffer = decodeBase64Image(data.file);
		var date = Date.now();
		filename = 'sessions/' + data.session + '/' +data.projet+"/"+ date + '.jpg';
		fs.writeFile(filename , imageBuffer.data, function(err) { 
			console.log(err);
		});

		var jsonFile = 'sessions/' + data.session + '/'+ data.projet+"/" +data.projet+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);
		var jsonAdd = { "name" : currentDate};
		jsonObj["files"]["images"].push(jsonAdd);
		fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
    });
    io.sockets.emit("displayNewImage", {file: date + ".jpg", extension:"jpg", name:data.session, projet:data.projet, title: date});
	}

	function onPublication(session){
		var htmlFile = 'sessions/' + session + '/montage.html';
		if(fs.existsSync(htmlFile)){
			fs.readFile(htmlFile,"UTF-8", function (err, data) {
		    if (err) {
		       throw err;
		    }
		    io.sockets.emit('puclicationPage', data);
			});
		}
	}

	function displayPubli(session){
		var htmlFile = 'sessions/' + session + '/montage.html';
		if(fs.existsSync(htmlFile)){
			fs.readFile(htmlFile,"UTF-8", function (err, data) {
		    if (err) {
		       throw err;
		    }
		    io.sockets.emit('puclicationPage', data);
			});
		}	
	}


// helpers

//Décode les images en base64
function decodeBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
	response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
}

//remove all files in directory
//Call rmDir('path/to/dir') to remove all inside dir and dir itself. 
//Call rmDir('path/to/dir', false) to remove all inside, but not dir itself.
rmDir = function(dirPath, removeSelf) {
      if (removeSelf === undefined)
        removeSelf = true;
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      if (removeSelf)
        fs.rmdirSync(dirPath);
    };

  function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
  function timestampToTimer(time){
      var d = new Date(time);
      return pad(d.getHours()   ,2) + ':' + 
             pad(d.getMinutes() ,2) + ':' + 
             pad(d.getSeconds()   ,2);
  }

};