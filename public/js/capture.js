jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var socket = io.connect(serverBaseUrl);
	var sessionId = '';
  //compteur d'image pour le stop motion
  var countImage = 0;

	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);

  // fonctions
  fluxWebcam();
  //captureVideo();
  //videoCapture();
  //audioCapture();
  audioVideo();
  events();

	/**
	* handlers
	*/
	/* sockets */

	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
		socket.emit('newUser', {id: sessionId, name: app.session});
	};
	
  function onSocketError(reason) {
	 console.log('Unable to connect to server', reason);
	};

  function events(){
    $('#photo').on('click', function(){
      $('.screenshot .canvas-view').show();
      $('.screenshot video').hide();
      $('.btn-choice').children().removeClass('active');
      $(this).addClass('active');
      $('.photo-capture').css('display', 'block');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','none');
    });
    $('#video-btn').on('click', function(){
      $('.btn-choice').children().removeClass('active');
      $(this).addClass('active');
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','block');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','none');
    });
    $('#stopmotion').on('click', function(){
      $('.screenshot .canvas-view').show();
      $('.screenshot #camera-preview').hide();
      $('.btn-choice').children().removeClass('active');
      $(this).addClass('active');
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','block');
      $('.audio-capture').css('display','none');
    });
    $('#audio').on('click', function(){
      $('.screenshot #camera-preview').hide();
      $('.btn-choice').children().removeClass('active');
      $(this).addClass('active');
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','block');
      $('.screenshot #canvas').css('display', 'none');
      $('.right .son').css('display', 'block');
    });
    $('.btn-choice button').on('click', function(){
      $('.btn-choice button').attr("disabled", false);
      $(this).attr("disabled",true);
      $(".form-meta.active").slideUp( "slow" ); 
      $(".form-meta").removeClass('active')
    });
  }

  // Capture des videos en format webm
  function videoCapture(){
    $('#stop-btn').on('click', function(){
      $(".form-meta").slideDown( "slow" ); 
      $(".form-meta").addClass('active');
    });

    (function(exports) {
      exports.URL = exports.URL || exports.webkitURL;
      exports.requestAnimationFrame = exports.requestAnimationFrame ||
      exports.webkitRequestAnimationFrame || exports.mozRequestAnimationFrame ||
      exports.msRequestAnimationFrame || exports.oRequestAnimationFrame;
      exports.cancelAnimationFrame = exports.cancelAnimationFrame ||
      exports.webkitCancelAnimationFrame || exports.mozCancelAnimationFrame ||
      exports.msCancelAnimationFrame || exports.oCancelAnimationFrame;


      navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

      var ORIGINAL_DOC_TITLE = document.title;
      var video = $('#video');
      var canvas = document.createElement('canvas'); // offscreen canvas.
      var rafId = null;
      var startTime = null;
      var endTime = null;
      var frames = [];


      function $(selector) {
        return document.querySelector(selector) || null;
      }

      function toggleActivateRecordButton() {
        var b = $('#record-btn');
        b.textContent = b.disabled ? 'Record' : 'Recording...';
        b.classList.toggle('recording');
        b.disabled = !b.disabled;
      }

      function turnOnCamera(e) {
        // e.target.disabled = true;
        $('#record-btn').disabled = false;

        video.controls = false;

        var finishVideoSetup_ = function() {
          // Note: video.onloadedmetadata doesn't fire in Chrome when using getUserMedia so
          // we have to use setTimeout. See crbug.com/110938.
          setTimeout(function() {
            video.width = 520;//video.clientWidth;
            video.height = 390;// video.clientHeight;
            // Canvas is 1/2 for performance. Otherwise, getImageData() readback is
            // awful 100ms+ as 640x480.
            canvas.width = video.width;
            canvas.height = video.height;
          }, 1000);
        };

        navigator.getUserMedia({video: true, audio: true}, function(stream) {
          video.src = window.URL.createObjectURL(stream);
          finishVideoSetup_();
        }, function(e) {
          alert('Fine, you get a movie instead of your beautiful face ;)');

          video.src = 'Chrome_ImF.mp4';
          finishVideoSetup_();
        });
      };

      function record() {
        var elapsedTime = $('#elasped-time');
        var ctx = canvas.getContext('2d');
        var CANVAS_HEIGHT = canvas.height;
        var CANVAS_WIDTH = canvas.width;

        frames = []; // clear existing frames;
        startTime = Date.now();

        toggleActivateRecordButton();
        $('#stop-btn').disabled = false;

        function drawVideoFrame_(time) {
          rafId = requestAnimationFrame(drawVideoFrame_);
          ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          var url = canvas.toDataURL('image/webp', 1); // image/jpeg is way faster :(
          frames.push(url);
        };

        rafId = requestAnimationFrame(drawVideoFrame_);
      };

      function stop() {
        cancelAnimationFrame(rafId);
        endTime = Date.now();
        $('#stop-btn').disabled = true;
        document.title = ORIGINAL_DOC_TITLE;
        toggleActivateRecordButton();
        console.log('frames captured: ' + frames.length + ' => ' +
                    ((endTime - startTime) / 1000) + 's video');
        embedVideoPreview();
      };

      function embedVideoPreview(opt_url) {
        $('.screenshot .canvas-view').style.display = "none";
        var url = opt_url || null;
        var video = $('.screenshot video') || null;
        var downloadLink = $('.screenshot a[download]') || null;

        if (!video) {
          video = document.createElement('video');
          video.autoplay = true;
          video.controls = true;
          video.loop = true;
          video.style.width = canvas.width + 'px';
          video.style.height = canvas.height + 'px';
          $('.screenshot').appendChild(video);
          
          downloadLink = document.createElement('a');
          downloadLink.download = 'capture.webm';
          downloadLink.textContent = '[ download video ]';
          downloadLink.title = 'Download your .webm video';
          var p = document.createElement('p');
          p.appendChild(downloadLink);

          $('.screenshot').appendChild(p);

        } else {
          window.URL.revokeObjectURL(video.src);
        }

        if (!url) {
          var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
          url = window.URL.createObjectURL(webmBlob);
        }

        video.src = url;
        downloadLink.href = url;
        socket.emit('videoCapture', {url: url, id: sessionId, name: app.session});

      }

      function initEvents() {
        $('#video-btn').addEventListener('click', turnOnCamera);
        $('#record-btn').addEventListener('click', record);
        $('#stop-btn').addEventListener('click', stop);
      }

      initEvents();

      exports.$ = $;

    })(window);
  }
  
  //Fonction pour capturer une vidéo à partir de photos encoder en base64
  //fonction désactivée
  function captureVideo(){
    var image = document.getElementById('photo');
    var video = document.getElementById('video');
    var record = document.getElementById('record-btn');
    var play = document.getElementById('play-btn');
    var reset = document.getElementById('reset');
    var save = document.getElementById('save-video');
    var recorder;

    getUserMedia(function (err, stream) {
      if (err) return console.log(err);
      attachMediaStream(stream, video, {muted: true});
      recorder = window.recorder = new VideoRecorder(video);
    });

    record.addEventListener('click', function () {
      if (recorder.running) {
        recorder.stop();
        this.innerHTML = 'Record';
      } else {
        recorder.record();
        this.innerHTML = 'Pause';
      }
    });

    play.addEventListener('click', function () {
      fauxplay(recorder.data, image, {loop: true, duration: recorder.runningTime})
    });

    save.addEventListener('click', function () {
      console.log(recorder.data);
      socket.emit('saveVideo', {data: recorder.data, id: sessionId, name: app.session});
    });

    reset.addEventListener('click', function () {
      recorder.stop();
      recorder.reset();
    });
  }

  // Prend des photos et des stop motion
  function fluxWebcam(){
    //définition des variables 
    var streaming = false,
        video        = document.querySelector('#video'),
        canvas       = document.querySelector('#canvas'),
        photo        = document.querySelector('#photo'),
        startbutton  = document.querySelector('#capture-btn'),
        startsm  = document.querySelector('#start-sm'),
        capturesm  = document.querySelector('#capture-sm'),
        stopsm  = document.querySelector('#stop-sm'),
        width = 620,
        height = 0;

    // Initialise getUserMedia
    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
    navigator.getMedia(
      {
        video: true,
        audio: true
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    // fonction qui prend des photos et qui les envoie au serveur
    function takepicture() {
      $('.screenshot video').hide();
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(video, 0, 0, width, height);
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
      $(".form-meta").slideDown( "slow" ); 
      $(".form-meta").addClass('active');
      $("#valider").off('click');
      $("#valider").on('click', function(e){
        var titreImage = $('input.titre').val();
        var legendeImage = $('textarea.legende').val();
        var tagsImage = $('input.tags').val();
        socket.emit('imageCapture', {data: data, id: sessionId, name: app.session, titre: titreImage, legende: legendeImage, tags: tagsImage});
        $(".form-meta input").val("");
        $(".form-meta textarea").val("");
        $(".form-meta.active").slideUp( "slow" ); 
        $(".form-meta").removeClass('active');
      });
    }

    // fonction qui prend des photos pour le stop motion et qui les envoie au serveur
    function takepictureMotion(dir, count) {
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(video, 0, 0, width, height);
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
      socket.emit('imageMotion', {data: data, id: sessionId, name: app.session, dir: dir, count: count});
    }

    function initEvents() {
      // Event bouton prendre une photo
      startbutton.addEventListener('click', function(ev){
          takepicture();
        //ev.preventDefault();
        ev.stopPropagation();
      }, false);

      // Event bouton stop motion
      // Crée un nouveau stop motion + ajoute des images dedans + transforme le stop motion en vidéo
      startsm.addEventListener('click', function(){
        $("#start-sm").hide();
        $("#capture-sm").show();
        $("#stop-sm").show();
        socket.emit('newStopMotion', {id: sessionId, name: app.session});
        socket.on('newStopMotionDirectory', onStopMotionDirectory);
        function onStopMotionDirectory(dir){
          capturesm.addEventListener('click', function(ev){
            countImage ++;
            takepictureMotion(dir, countImage);
            ev.preventDefault();
          }, false);
          stopsm.addEventListener('click', function(ev){
            countImage = 0;
            socket.emit('StopMotion', {id: sessionId, name: app.session, dir: dir});
            $('.screenshot .canvas-view').hide();
            setTimeout(function() {
              $('.screenshot').append("<video src='http://localhost:8080/" + app.session + "/stopmotion.mp4' autoplay='true' controls='true' loop='true' width='620' height='465'></video>");
              $(".form-meta").slideDown( "slow" ); 
              $(".form-meta").addClass('active');
              $("#valider").off('click');
              $("#valider").on('click', function(e){
                var titreSM = $('input.titre').val();
                var legendeSM = $('textarea.legende').val();
                var tagsSM = $('input.tags').val();
                socket.emit('stopmotionCapture', {id: sessionId, name: app.session, titre: titreSM, legende: legendeSM, tags: tagsSM, dir: dir});
                $(".form-meta.active").slideUp( "slow" ); 
                $(".form-meta").removeClass('active');
              });
            }, 1000);
            ev.preventDefault();
          }, false);
        }
        
      });
    }
    initEvents();
  }

  //Capture le flux audio
  function audioCapture(){
    (function() {
      var params = {},
          r = /([^&=]+)=?([^&]*)/g;

      function d(s) {
          return decodeURIComponent(s.replace(/\+/g, ' '));
      }

      var match, search = window.location.search;
      while (match = r.exec(search.substring(1)))
          params[d(match[1])] = d(match[2]);

      window.params = params;
    })();
    var recordAudio = document.getElementById('start-recording'),
        stopRecordingAudio = document.getElementById('stop-recording'),
        pauseResumeAudio = document.getElementById('pause-recording'),
        audio = document.getElementById('son');

        var audioConstraints = {
            audio: true,
            video: false
        };

        var audioStream;
        var recorder;

        recordAudio.onclick = function() {
          if (!audioStream)
            navigator.getUserMedia(audioConstraints, function(stream) {
                if (window.IsChrome) stream = new window.MediaStream(stream.getAudioTracks());
                audioStream = stream;

                // "audio" is a default type
                recorder = window.RecordRTC(stream, {
                    type: 'audio',
                    bufferSize: typeof params.bufferSize == 'undefined' ? 16384 : params.bufferSize,
                    sampleRate: typeof params.sampleRate == 'undefined' ? 44100 : params.sampleRate,
                    leftChannel: params.leftChannel || false,
                    disableLogs: params.disableLogs || false,
                });
                recorder.startRecording();
            }, function() {});
            else {
                audio.src = URL.createObjectURL(audioStream);
                audio.muted = true;
                audio.play();
                if (recorder) recorder.startRecording();
            }

            window.isAudio = true;

            this.disabled = true;
            stopRecordingAudio.disabled = false;
            pauseResumeAudio.disabled = false;
        };

        stopRecordingAudio.onclick = function() {
          console.log(recorder);
          this.disabled = true;
          recordAudio.disabled = false;
          audio.src = '';

          if (recorder)
            recorder.stopRecording(function(url) {
              console.log("Audio is recording url " + url);
              audio.src = url;
              audio.muted = false;
              audio.play();

              document.getElementById('audio-url-preview').innerHTML = '<a href="' + url + '" target="_blank"></a>';
              //socket.emit('sonCapture', {id: sessionId, name: app.session, fileName: sessionId + '.wav', type: 'audio/wav', dataURL: url.audio});
            });
        };
        
        pauseResumeAudio.onclick = function() {
            if(!recorder) return;
            
            if(this.innerHTML === 'Pause') {
                this.innerHTML = 'Resume';
                recorder.pauseRecording();
                return;
            }
            
            this.innerHTML = 'Pause';
            recorder.resumeRecording();
        };
  }

  //Capture le flux audio et video
  function audioVideo(){
    // you can set it equal to "false" to record only audio
    var recordVideoSeparately = !!navigator.webkitGetUserMedia;
    if (!!navigator.webkitGetUserMedia && !recordVideoSeparately) {
        var cameraPreview = document.getElementById('camera-preview');
        cameraPreview.parentNode.innerHTML = '<audio id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></audio> ';
    }


    var mediaStream = null;
    var startRecording = document.getElementById('record-btn');
    var stopRecording = document.getElementById('stop-btn');
    var cameraPreview = document.getElementById('camera-preview');
    var recordAudio, recordVideo;
    startRecording.onclick = function() {
      startRecording.disabled = true;
      startRecording.style.display = "none";
      stopRecording.style.display = "block";
      navigator.getUserMedia({
          audio: true,
          video: true
      }, function(stream) {
          mediaStream = stream;
          recordAudio = RecordRTC(stream, {
              onAudioProcessStarted: function() {
                recordVideoSeparately && recordVideo.startRecording();
                cameraPreview.src = window.URL.createObjectURL(stream);
                cameraPreview.play();
                cameraPreview.muted = true;
                cameraPreview.controls = false;
              }
          });
          recordVideo = RecordRTC(stream, {
              type: 'video'
          });
          recordAudio.startRecording();
          stopRecording.disabled = false;
      }, function(error) {
          alert(JSON.stringify(error));
      });
    };
    stopRecording.onclick = function() {
        startRecording.disabled = false;
        stopRecording.disabled = true;
        cameraPreview.style.display = "block";
        // stop audio recorder
        recordVideoSeparately && recordAudio.stopRecording(function() {
            // stop video recorder
            recordVideo.stopRecording(function() {
                // get audio data-URL
                recordAudio.getDataURL(function(audioDataURL) {
                    // get video data-URL
                    recordVideo.getDataURL(function(videoDataURL) {
                        var files = {
                            audio: {
                                type: recordAudio.getBlob().type || 'audio/wav',
                                dataURL: audioDataURL
                            },
                            video: {
                                type: recordVideo.getBlob().type || 'video/webm',
                                dataURL: videoDataURL
                            }
                        };
                        socket.emit('audioVideo', {files: files, id: sessionId, name: app.session});
                        $('.screenshot .canvas-view').hide();
                        $(".form-meta").slideDown( "slow" ); 
                        $(".form-meta").addClass('active');
                        $("#valider").off('click');
                        $("#valider").on('click', function(e){
                          var titreVideo = $('input.titre').val();
                          var legendeVideo = $('textarea.legende').val();
                          var tagsVideo = $('input.tags').val();
                          //Confirme l'enregistrement de la vidéo et envoie les meta données. 
                          //socket.emit('audioVideoCapture', {files: files, id: sessionId, name: app.session, titre: titreVideo, legende: legendeVideo, tags: tagsVideo});
                          $(".form-meta input").val("");
                          $(".form-meta textarea").val("");
                          $(".form-meta.active").slideUp( "slow" ); 
                          $(".form-meta").removeClass('active');
                        });
                        if (mediaStream) mediaStream.stop();
                    });
                });
                cameraPreview.src = '';
                cameraPreview.poster = 'http://localhost:8080/ajax-loader.gif';
            });
        });
        // if firefox or if you want to record only audio
        // stop audio recorder
        !recordVideoSeparately && recordAudio.stopRecording(function() {
            // get audio data-URL
            recordAudio.getDataURL(function(audioDataURL) {
                var files = {
                    audio: {
                        type: recordAudio.getBlob().type || 'audio/wav',
                        dataURL: audioDataURL
                    }
                };
                socket.emit('audioVideo', {files: files, id: sessionId, name: app.session});
                if (mediaStream) mediaStream.stop();
            });
            cameraPreview.src = '';
            cameraPreview.poster = 'http://localhost:8080/ajax-loader.gif';
        });
    };
    socket.on('merged', function(fileName, sessionName) {
        href = 'http://localhost:8080/static/' + sessionName + '/audiovideo/' + fileName;
        console.log('got file ' + href);
        cameraPreview.src = href
        cameraPreview.play();
        cameraPreview.muted = false;
        cameraPreview.controls = true;
    });
    socket.on('ffmpeg-output', function(result) {
        // if (parseInt(result) >= 100) {
        //     progressBar.parentNode.style.display = 'none';
        //     return;
        // }
        // progressBar.parentNode.style.display = 'block';
        // progressBar.value = result;
        // percentage.innerHTML = 'Ffmpeg Progress ' + result + "%";
    });
    socket.on('ffmpeg-error', function(error) {
        alert(error);
    });
  } 
  
});