var fs = require('fs-extra'),
		glob = require("glob"),
		path = require("path"),
		gm = require('gm'),
		markdown = require( "markdown" ).markdown,
		exec = require('child_process').exec,
		phantom = require('phantom'),
		ffmpeg = require('fluent-ffmpeg')
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
		socket.on("newUserSelect", onNewUserSelect);
		socket.on("newSession", addNewSession);
		socket.on("imageCapture", onNewImage);
		socket.on("newStopMotion", onNewStopMotion);
		socket.on("imageMotion", onNewImageMotion);
		//socket.on("StopMotion", onStopMotion);
		socket.on("stopmotionCapture", onStopMotionCapture);
		//socket.on("videoCapture", onNewVideo);
		socket.on("audioVideo", onNewAudioVideo);
		// socket.on("audioVideoCapture", onNewAudioVideoCapture);
		//socket.on("audio", onNewAudio);
		socket.on("audioCapture", onNewAudioCapture);
		socket.on("deleteFile", deleteFile);
		socket.on("deleteImageMotion", deleteImageMotion);

	});

	// events

	function onNewUser(req){
		console.log(req);
		listSessions();		
	};

	function onNewUserSelect(req){
		listMedias(req);
	}

	//Ajoute le dossier de la session + l'ajouter à la liste des sessions
	function addNewSession(session) {
    var sessionPath = 'sessions/'+session.name;
		fs.ensureDirSync(sessionPath);

		var jsonFile = 'sessions/' + session.name + '/' +session.name+'.json';
		var objectJson = {"files": {"images":[], "videos":[], "stopmotion":[], "audio":[]}};
		var jsonString = JSON.stringify(objectJson);
		fs.appendFile(jsonFile, jsonString, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("Session was created!");
      }
    });
    io.sockets.emit("displayNewSession", {name: session.name});
	}

	//Liste les dossiers dans sessions/
	function listSessions() {
		var dir = "sessions/";
		fs.readdir(dir, function (err, files) { if (err) throw err;
		  files.forEach( function (file) {
		    files.push(file);
		    if(file == ".DS_Store"){
		    	fs.unlink(dir+'.DS_Store');
		    }
		    io.sockets.emit('listSessions', file);
		  });
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

	//ajoute les images au dossier de session
	function onNewImage(req) {
		var imageBuffer = decodeBase64Image(req.data);
		currentDate = Date.now();
		filename = 'sessions/' + req.name + '/' + currentDate + '.jpg';
		fs.writeFile(filename , imageBuffer.data, function(err) { 
			//console.log(err);
		});
		
		var jsonFile = 'sessions/' + req.name + '/' +req.name+'.json';
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
    io.sockets.emit("displayNewImage", {file: currentDate + ".jpg", extension:"jpg", name:req.name, title: currentDate});
	}

	//Liste les medias sur la page select
	function listMedias(req){
		//read json file to send data
		var jsonFile = 'sessions/' + req.name + '/' +req.name+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);

		var dir = "sessions/" + req.name ;
		fs.readdir(dir, function(err, files) {
			var media = [];
			if (err) return;
			files.forEach(function(f) {
				media.push(f);
			});
			io.sockets.emit('listMedias', media,jsonObj);
		});
	}

	// Crée un nouveau dossier pour le stop motion
	function onNewStopMotion(req) {
		var StopMotionDirectory = 'sessions/' + req.name + '/01-stopmotion';
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
		  .fps(6)
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
		var videoPath = 'sessions/' + req.name + '/' + fileName + '.mp4';
		//make sure you set the correct path to your video file
		var proc = new ffmpeg({ source: req.dir + '/%d.png'})
		  // using 12 fps
		  .fps(6)
		  // setup event handlers
		  .on('end', function() {
		    console.log('file has been converted succesfully');
		    io.sockets.emit("newStopMotionCreated", {fileName:fileName + '.mp4', name:req.name, dir:req.dir });
		  	io.sockets.emit("displayNewStopMotion", {file: fileName + ".mp4", extension:"mp4", name:req.name, title: fileName});
		  })
		  .on('error', function(err) {
		    console.log('an error happened: ' + err.message);
		  })
		  // save to file
		  .save(videoPath);

		var jsonFile = 'sessions/' + req.name + '/' +req.name+'.json';
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
    var VideoDirectory = 'sessions/' + data.name + '/00-audiovideo';
    var sessionDirectory = 'sessions/' + data.name;

    writeToDisk(data.files.video.dataURL, fileName + '.webm', data.name);
    io.sockets.emit('merged', fileName + '.webm', data.name);
    
    //Write data to json
    var jsonFile = 'sessions/' + data.name + '/' +data.name+'.json';
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
    io.sockets.emit("displayNewVideo", {file: fileName + ".webm", extension:"webm", name:data.name, title: fileName});
	}

	function writeToDisk(dataURL, fileName, session) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './sessions/' + session + '/' + fileName,
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
		//move wav file
  	//   var wav = fs.createReadStream(VideoDirectory + file +".wav");
		// var newWave = fs.createWriteStream('sessions/' + req.name + '/' + file + ".wav" );
		// wav.pipe(newWave);
		//move video file
    var video = fs.createReadStream(VideoDirectory + file +".webm");
		var newVideo = fs.createWriteStream('sessions/' + req.name + '/' + file + ".webm" );
		video.pipe(newVideo);
		//move merge file
  	//   var merge = fs.createReadStream(VideoDirectory + req.file);
		// var newMerge = fs.createWriteStream('sessions/' + req.name + '/' + req.file );
		// merge.pipe(newMerge);

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
      fileRootNameWithBase = './sessions/' + req.name +'/'+ fileWithExt,
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
    io.sockets.emit('AudioFile', fileWithExt, req.name);

		//add data to json file
		var jsonFile = 'sessions/' + req.name + '/' +req.name+'.json';
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
    io.sockets.emit("displayNewAudio", {file: fileName + ".wav", extension:"wav", name:req.name, title: fileName});
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