jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var socket = io.connect();
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
  main();
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
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();
    });
    $('#video-btn').on('click', function(){
      $('.btn-choice').children().removeClass('active');
      $(this).addClass('active');
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','block');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','none');
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();
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
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();
    });
    $('#audio').on('click', function(e){
      $('.screenshot #camera-preview').hide();
      $('.btn-choice').children().removeClass('active');
      $(this).addClass('active');
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','block');
      $('.screenshot #canvas').css('display', 'none');
      $('.right .son').css('display', 'block');
      $('#video').hide();
      $('#canvas-audio').show();
      createEqualizer();
    });
    $('.btn-choice button').on('click', function(){
      $('.btn-choice button').attr("disabled", false);
      $(this).attr("disabled",true);
      $(".form-meta.active").slideUp( "slow" ); 
      $(".form-meta").removeClass('active');
      if($('.screenshot .count-image')){
        $('.screenshot .count-image').remove();
      }
      backAnimation();
    });
  }

  // Prend des photos et des stop motion
  function main(){
    //définition des variables pour la photo et le stop motion
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

    //Variable pour le son
    var mediaStream = null;
    var startRecording = document.getElementById('start-recording');
    var stopRecording = document.getElementById('stop-recording');
    var cameraPreview = document.getElementById('son');
    var recordAudio;

    //Variable pour la video
    // you can set it equal to "false" to record only audio
    var recordVideoSeparately = !!navigator.webkitGetUserMedia;
    if (!!navigator.webkitGetUserMedia && !recordVideoSeparately) {
        var cameraPreview = document.getElementById('camera-preview');
        cameraPreview.parentNode.innerHTML = '<audio id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></audio> ';
    }

    var startVideoRecording = document.getElementById('record-btn');
    var stopVideoRecording = document.getElementById('stop-btn');
    var cameraPreview = document.getElementById('camera-preview');
    var recordVideo;

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
        // get user media pour le son
        mediaStream = stream;
        recordAudio = RecordRTC(stream, {
            type: 'audio',
            onAudioProcessStarted: function() {
              recordVideoSeparately && recordVideo.startRecording();
              cameraPreview.src = window.URL.createObjectURL(stream);
              cameraPreview.play();
              cameraPreview.muted = true;
              cameraPreview.controls = true;
            }
        });
        recordAudio.startRecording();
        stopRecording.disabled = false;
        //fin get user media son
        //get user media pour la video
        recordVideo = RecordRTC(stream, {
          type: 'video'
        });
        recordAudio.startRecording();
        stopVideoRecording.disabled = false;
      },
      function(err) {
        console.log("An error occured! " + err);
        alert(JSON.stringify(error));
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
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(video, 0, 0, width, height);
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
      animateWindows(data, "imageCapture");      
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
        countImage = 0;
        console.log(countImage);
        $("#start-sm").hide(); $("#capture-sm").show(); $("#stop-sm").hide();
        $('.screenshot .canvas-view').show(); $('#camera-preview').hide();
        if($(".form-meta").hasClass('active')){
          $(".form-meta.active").slideUp( "slow", function(){ 
            $(".form-meta").removeClass('active');
          });
        }
        $(".right").css('display', 'block').addClass('active');
        $('.left').animate({'left':'7%'}, 'slow');
        $('.right').animate({'left':'52%'}, 'slow');
        $('.screenshot').append('<p>Nouveau Stop Motion! Cliquez sur le bouton enregistrer pour commencer à prendre des photos</p>')
        socket.emit('newStopMotion', {id: sessionId, name: app.session});
        socket.on('newStopMotionDirectory', onStopMotionDirectory);
        function onStopMotionDirectory(dir){
          capturesm.addEventListener('click', function(ev){
            $("#stop-sm").show();
            $('.screenshot p').remove();
            countImage ++;
            console.log(countImage);
            $(".screenshot").append("<p class='count-image'></p>");
            $(".screenshot .count-image").text("Image n°" + countImage);
            takepictureMotion(dir, countImage);
            ev.preventDefault();
          }, false);
          stopsm.addEventListener('click', function(ev){
            $("#stop-sm").hide();
            $("#start-sm").show();
            $("#capture-sm").hide();
            countImage = 0;
            $('.screenshot .count-image').remove();
            socket.emit('StopMotion', {id: sessionId, name: app.session, dir: dir});
            $('.screenshot .canvas-view').hide();
            setTimeout(function() {
              $('.right').css('height', "auto");
              $('#camera-preview').attr('src', 'http://localhost:8080/' + app.session + '/stopmotion.mp4')
              //$('.screenshot').append("<video class='stopmotion-preview' src='http://localhost:8080/" + app.session + "/stopmotion.mp4' autoplay='true' controls='true' loop='true' width='620' height='465'></video>"); 
              $('#camera-preview').show();
              $(".form-meta").slideDown( "slow" ); 
              $(".form-meta").addClass('active');
              $("#valider").off('click');
              $("#valider").on('click', function(e){
                var titreSM = $('input.titre').val();
                var legendeSM = $('textarea.legende').val();
                var tagsSM = $('input.tags').val();
                socket.emit('stopmotionCapture', {id: sessionId, name: app.session, titre: titreSM, legende: legendeSM, tags: tagsSM, dir: dir});
                $(".form-meta input").val("");
                $(".form-meta textarea").val("");
                $(".form-meta.active").slideUp( "slow", function(){ 
                  $(".form-meta").removeClass('active');
                  $('.left').animate({'left':'30%'}, 'slow');
                  $('.right').css("z-index", 3).removeClass('active').animate({'width':"200px", 'top':'60px', 'left':'87%', 'opacity': 0}, 500, function(){
                    $(this).css({"z-index": -1, "width":"800px", 'top':"200px", 'left':'30%', 'opacity':1});
                    $(".count-add-media").animate({'opacity': 1}, 700, function(){$(this).fadeOut(700);});
                  });
                });
                $("#start-sm").show();
                $("#capture-sm").hide();
                $("#stop-sm").hide();
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              });
            }, 1000);
            $('.screenshot #camera-preview').hide();
            ev.preventDefault();
          }, false);
        }
        
      });
    }
    initEvents();
    audioCapture();
    audioVideo();

    //Capture le flux audio
    function audioCapture(){

      startRecording.onclick = function() {
        startRecording.disabled = true;
        startRecording.style.display = "none";
        stopRecording.style.display = "block";
      };

      stopRecording.onclick = function(e) {
          startRecording.disabled = false;
          stopRecording.disabled = true;
          startRecording.style.display = "block";
          stopRecording.style.display = "none";
          cameraPreview.style.display = "block";

          // stop audio recorder
          recordAudio.stopRecording(function(url) {
            // get audio data-URL
            recordAudio.getDataURL(function(audioDataURL) {
              var files = {
                  audio: {
                      type: recordAudio.getBlob().type || 'audio/wav',
                      dataURL: audioDataURL
                  }
              };
              //socket.emit('audio', {files: files, id: sessionId, name: app.session});
              console.log("Audio is recording url " + url);
              cameraPreview.src = url;
              cameraPreview.muted = false;
              cameraPreview.play();
              // $("#son").attr('src', url);
              //document.getElementById('audio-url-preview').innerHTML = '<a href="' + url + '" target="_blank"></a>';
              animateWindows(files, "audioCapture");
              if (mediaStream) mediaStream.stop();
          });
          });
      };
    }
  
    //Capture le flux audio et video
    function audioVideo(){

      startVideoRecording.onclick = function() {
        startVideoRecording.disabled = true;
        startVideoRecording.style.display = "none";
        stopVideoRecording.style.display = "block";
      };
      stopVideoRecording.onclick = function() {
          startVideoRecording.disabled = false;
          stopVideoRecording.disabled = true;
          startVideoRecording.style.display = "block";
          stopVideoRecording.style.display = "none";
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
                  $(".right").css('display', 'block').addClass('active');
                  $('.left').animate({'left':'7%'}, 'slow');
                  $('.right').animate({'left':'52%'}, 'slow', function(){
                    $('.right').css('height', "auto");
                    $(".form-meta").slideDown( "slow" ); 
                    $(".form-meta").addClass('active');
                    $("#valider").off('click');
                  });
                  if (mediaStream) mediaStream.stop();
                });
              });
              cameraPreview.src = '';
              cameraPreview.poster = 'http://localhost:8080/loading.gif';
            });
          });
          // if firefox or if you want to record only audio
          // stop audio recorder
          !recordVideoSeparately && recordAudio.stopVideoRecording(function() {
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
            cameraPreview.poster = 'http://localhost:8080/loading.gif';
          });
      };
      socket.on('merged', function(fileName, sessionName) {
        href = 'http://localhost:8080/static/' + sessionName + '/audiovideo/' + fileName;
        console.log('got file ' + href);
        cameraPreview.src = href
        cameraPreview.play();
        cameraPreview.muted = false;
        cameraPreview.controls = true;
        $("#valider").on('click', function(e){
          var titreVideo = $('input.titre').val();
          var legendeVideo = $('textarea.legende').val();
          var tagsVideo = $('input.tags').val();
          //Confirme l'enregistrement de la vidéo et envoie les meta données. 
          socket.emit('audioVideoCapture', {file:fileName, id: sessionId, name: app.session, titre: titreVideo, legende: legendeVideo, tags: tagsVideo});
          $(".form-meta input").val("");
          $(".form-meta textarea").val("");
          $(".form-meta.active").slideUp( "slow", function(){ 
            $(".form-meta").removeClass('active');
            $('.left').animate({'left':'30%'}, 'slow');
            $('.right').css("z-index", 3).removeClass('active').animate({'width':"200px", 'top':'60px', 'left':'87%', 'opacity': 0}, 500, function(){
              $(this).css({"z-index": -1, "width":"800px", 'top':"200px", 'left':'30%', 'opacity':1});
              $(".count-add-media").animate({'opacity': 1}, 700, function(){$(this).fadeOut(700);});
            });
          });
        });
      });
      socket.on('ffmpeg-output', function(result) {
      });
      socket.on('ffmpeg-error', function(error) {
        alert(error);
      });
    } 
  }  

  //fenêtre de preview retroune au center
  function backAnimation(){
    if($(".right").hasClass('active')){
      $('.left').animate({'left':'30%'}, 'slow');
      $('.right').removeClass('active').animate({'top':'200px', 'left':'30%'}, 500,function(){$(this).css("display", "none")});
    }
  }

  //animation des fenêtres à la capture
  function animateWindows(data, capture){
    //$('.screenshot .canvas-view').hide();
    $(".right").css('display', 'block').addClass('active');
    $('.left').animate({'left':'7%'}, 'slow');
    $('.right').animate({'left':'52%'}, 'slow', function(){
      $('.right').css('height', "auto");
      $(".form-meta").slideDown( "slow" ); 
      $(".form-meta").addClass('active');
      $("#valider").off('click');
      $("#valider").on('click', function(e){
        var titre = $('input.titre').val();
        var legende = $('textarea.legende').val();
        var tags = $('input.tags').val();
        socket.emit(capture, {data: data, id: sessionId, name: app.session, titre: titre, legende: legende, tags: tags});
        $(".form-meta input").val("");
        $(".form-meta textarea").val("");
        $(".form-meta.active").slideUp( "slow", function(){ 
          $(".form-meta").removeClass('active');
          $('.left').animate({'left':'30%'}, 'slow');
          $('.right').css("z-index", 3).removeClass('active').animate({'width':"200px", 'top':'60px', 'left':'87%', 'opacity': 0}, 500, function(){
            $(this).css({"z-index": -1, "width":"800px", 'top':"200px", 'left':'30%', 'opacity':1});
            $(".count-add-media").animate({'opacity': 1}, 700, function(){$(this).fadeOut(700);});
          });
        });
      });
    });
  }

// CREATE A SOUND EQUALIZER
  function createEqualizer(){
    // Hack to handle vendor prefixes
    navigator.getUserMedia = ( navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia);

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function(callback, element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    window.AudioContext = (function(){
        return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
    })();

    // Global Variables for Audio
    var audioContext;
    var analyserNode;
    var javascriptNode;
    var sampleSize = 1024;  // number of samples to collect before analyzing
                            // decreasing this gives a faster sonogram, increasing it slows it down
    var amplitudeArray;     // array to hold frequency data
    var audioStream;

    // Global Variables for Drawing
    var column = 0;
    var canvasWidth  = 620;
    var canvasHeight = 256;
    var ctx;

    ctx = $("#canvas-audio").get()[0].getContext("2d");

    try {
        audioContext = new AudioContext();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
    startEqualizer();
    $('#stop-recording').click(function(e){
      stopEqualizer(e);
    });

    function startEqualizer(){
      clearCanvas();
      // get the input audio stream and set up the nodes
      try {
          navigator.getUserMedia(
            { video: false,
              audio: true},
            setupAudioNodes,
            onError);
      } catch (e) {
          alert('webkitGetUserMedia threw exception :' + e);
      }
    }

    function stopEqualizer(e){
      e.preventDefault();
      javascriptNode.onaudioprocess = null;
      if(audioStream) audioStream.stop();
      if(sourceNode)  sourceNode.disconnect();
    }

    function setupAudioNodes(stream) {
        // create the media stream from the audio input source (microphone)
        sourceNode = audioContext.createMediaStreamSource(stream);
        audioStream = stream;

        analyserNode   = audioContext.createAnalyser();
        javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

        // Create the array for the data values
        amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

        // setup the event handler that is triggered every time enough samples have been collected
        // trigger the audio analysis and draw one column in the display based on the results
        javascriptNode.onaudioprocess = function () {

            amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteTimeDomainData(amplitudeArray);

            // draw one column of the display
            requestAnimFrame(drawTimeDomain);
        }

        // Now connect the nodes together
        // Do not connect source node to destination - to avoid feedback
        sourceNode.connect(analyserNode);
        analyserNode.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
    }

    function onError(e) {
        console.log(e);
    }

    function drawTimeDomain() {
        var minValue = 9999999;
        var maxValue = 0;

        for (var i = 0; i < amplitudeArray.length; i++) {
            var value = amplitudeArray[i] / 256;
            if(value > maxValue) {
                maxValue = value;
            } else if(value < minValue) {
                minValue = value;
            }
        }

        var y_lo = canvasHeight - (canvasHeight * minValue) - 1;
        var y_hi = canvasHeight - (canvasHeight * maxValue) - 1;

        ctx.fillStyle = 'red';
        ctx.fillRect(column,y_lo, 1, y_hi - y_lo);

        // loop around the canvas when we reach the end
        column += 1;
        if(column >= canvasWidth) {
            column = 0;
            clearCanvas();
        }
    }

    function clearCanvas() {
        column = 0;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.strokeStyle = 'blue';
        var y = (canvasHeight / 2) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth-1, y);
        ctx.stroke();
    }
  }

  
});