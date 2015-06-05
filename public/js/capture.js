jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
  var host = window.location.host;
	var socket = io.connect();
	var sessionId = '';
  //compteur d'image pour le stop motion
  var countImage = 0;
  //compteur de clicks pour le stopmotion
  var countPress = 0;
  //compteur de click général
  var countClick = 0;
  //compteur pour l'equalizer
  var countEqualizer = 0;
  // var recordAudio;
  // var recordVideo;
  var isEventExecutedVideo = false;
  var isEventExecutedAudio = false;
  var isEventExecutedEqualizer = false;


	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);

  // fonctions
  events();
  main();

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
    $("#photo").addClass('active');
    changeMedia();
    //Keypress for powermate
    function changeMedia(){
      $(".btn-choice #photo").on("click", function(){ 
        photoDisplay();       
        $(".btn-choice button").removeClass('active');
        $(this).addClass("active"); 
      });
      $(".btn-choice #video-btn").on("click", function(){
        videoDisplay();
        $(".btn-choice button").removeClass('active');
        $(this).addClass("active"); 
      });
      $(".btn-choice #stopmotion").on("click", function(){
        stopMotionDisplay();
        $(".btn-choice button").removeClass('active');
        $(this).addClass("active");
      });
      $(".btn-choice #audio").on("click", function(){
        audioDisplay();
        $(".btn-choice button").removeClass('active');
        $(this).addClass("active");
      });
      $(".btn-choice").on('click', backAnimation);
      $("body").keypress(function(e){
        countClick ++;
        var code = e.keyCode || e.which;
        var $activeButton = $(".btn-choice").find('.active');
        if(countClick > 10){
          countClick = 0;
          if(code == 97) { //When A is pressed - Powermate Rotate to Right
            var $nextButton = $activeButton.next();
            $activeButton.removeClass('active');
            if ($nextButton.length){
              $nextButton.addClass('active');
            }
            else{
              $nextButton = $(".btn-choice button").first().addClass('active');
            }
            //console.log("Powermate Rotate to Right");
          }
          if(code == 98) { //When B is pressed - Powermate Rotate to Left
            var $prevButton = $activeButton.prev();
            $activeButton.removeClass('active');
            if ($prevButton.length){
              $prevButton.addClass('active');
            }
            else{
              $prevButton = $(".btn-choice button").last().addClass('active');
            }
            //console.log("Powermate Rotate to Left");
          }
          if(code == 97 || code == 98){
            $(".form-meta.active").slideUp( "slow" ); 
            $(".form-meta").removeClass('active');
            if($('.screenshot .count-image')){
              $('.screenshot .count-image').remove();
            }
            backAnimation();
            countPress = 0;

            if($("#photo").hasClass('active')){
              photoDisplay();
            }
            if($("#video-btn").hasClass('active')){
              videoDisplay();
            }
            if($("#stopmotion").hasClass('active')){
              stopMotionDisplay();
            }
            if($("#audio").hasClass('active')){
              audioDisplay();
            }
          }
        }
      });
    }
    function photoDisplay(){
      $('.screenshot .canvas-view').show();
      $('.screenshot video').hide();
      $('.photo-capture').css('display', 'block');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','none');
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();
    }
    function videoDisplay(){
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','block');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','none');
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();
    }
    function stopMotionDisplay(){
      $('.screenshot .canvas-view').show();
      $('.screenshot #camera-preview').hide();
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','block');
      $('.audio-capture').css('display','none');
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();
      var canvas = document.querySelector('#canvas');
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
    }
    function audioDisplay(){
      $('.screenshot #camera-preview').hide();
      $('.photo-capture').css('display', 'none');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','block');
      $('.screenshot #canvas').css('display', 'none');
      $('.right .son').css('display', 'block');
      $('#video').hide();
      $('#canvas-audio').show();
    }
    $(".clear").off();
    $(".clear").on("click", function(e){
      console.log('File was delete');
      socket.emit("deleteFile", {name:app.session});
      backAnimation();
      e.stopPropagation;
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
        function (stream) {
          if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
          } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
          }
          video.play();
        },
        function(err) {
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

      //init events
      initEvents();

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
      //Mouse function
      $(".photo-capture #capture-btn").on('click', takepicture);
      $("#start-sm").on('click', startStopMotion);
      $("#capture-sm").on('click', onStopMotionDirectory);
      $("#stop-sm").on('click', stopStopMotion);
      $("#video-btn").on('click', function(){
        audioVideo("click");
      });
      $("#audio").on('click', function(e){
        audioCapture("click");
        createEqualizer(e, "click");
      });

      //Powermate function
      $("body").keypress(function(e){
        // variable to check if event is already executed
        // Taking pictures
        var code = e.keyCode || e.which;
        if($("#photo").hasClass('active')){
          if(code == 100) { //When Space is pressed
            takepicture();
            console.log("taking a picture");
          }
        }
        if($("#video-btn").hasClass('active')){
          if(code == 100) {
            countPress ++;
            audioVideo();
          }
        }
        if($("#stopmotion").hasClass('active')){
          // Taking StopMotion
          if(code == 100) { //When Space is pressed
            countPress ++;
            //console.log(countPress);
            if(countPress == 1){
              console.log("start a stopmotion");
              startStopMotion();
            }
            else{
              //console.log('test');
              onStopMotionDirectory();
              //socket.on('newStopMotionDirectory', onStopMotionDirectory);
            }
          }
          if(code == 99){
            stopStopMotion();
            countPress = 0;
          }
        }
        if($("#audio").hasClass('active')){
          if(code == 100) {
            countPress ++;
            countEqualizer ++;
            audioCapture(code);
            createEqualizer(e);
          }
        }
      });

      // Crée un nouveau stop motion + ajoute des images dedans + transforme le stop motion en vidéo
      function startStopMotion(){
        countImage = 0;
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
        //$('.screenshot').append('<p>Nouveau Stop Motion! Cliquez sur le bouton enregistrer pour commencer à prendre des photos</p>')
        socket.emit('newStopMotion', {id: sessionId, name: app.session});
        //socket.on('newStopMotionDirectory', onStopMotionDirectory);
      }
             
      function onStopMotionDirectory(){
          //console.log("start taking picture");
          var dir = "sessions/" + app.session + "/01-stopmotion";
          $("#stop-sm").show();
          $('.screenshot p').remove();
          countImage ++;
          //console.log(countImage);
          $(".screenshot").append("<p class='count-image'></p>");
          $(".screenshot .count-image").text("Image n°" + countImage);
          takepictureMotion(dir, countImage);
          //ev.preventDefault();
      }

      function stopStopMotion(){
        var dir = "sessions/" + app.session + "/01-stopmotion";
        $("#stop-sm").hide();
        $("#start-sm").show();
        $("#capture-sm").hide();
        countImage = 0;
        $('.screenshot .count-image').remove();
        //socket.emit('StopMotion', {id: sessionId, name: app.session, dir: dir});
        socket.emit('stopmotionCapture', {id: sessionId, name: app.session, dir: dir});
        socket.on('newStopMotionCreated', function(req){
          $('.screenshot .canvas-view').hide();
          $('.right').css('height', "auto");
          $('#camera-preview').attr('src', 'https://'+host+'/' + app.session + '/'+req.fileName+'')
          $('#camera-preview').show();
          $(".form-meta").slideDown( "slow" ).addClass('active'); 
        });
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    //Capture le flux audio
    function audioCapture(code){
      
      //Variables     
      var mediaStream = null;
      //var recordAudio;

      var startRecordingBtn = document.getElementById('start-recording');
      var stopRecordingBtn = document.getElementById('stop-recording');
      var cameraPreview = document.getElementById('son');

      //click events
      if(code == "click"){
        $("#start-recording").off();
        $("#start-recording").on('click', function(){
          console.log("you are using the mouse for recording audio");
          startRecordAudio();
          isEventExecutedVideo = false;
          $(".btn-choice").click(function(e){
            if(isEventExecutedVideo == false){
              isEventExecutedVideo = true;
              console.log("Audio File was not saved");
              recordAudio.stopRecording();
              startRecordingBtn.style.display = "block";
              stopRecordingBtn.style.display = "none";
              startRecordingBtn.disabled = false;
              stopRecordingBtn.disabled = true;
            }
          });
        });

        $("#stop-recording").off();
        $("#stop-recording").on('click', function(){
          stopRecordAudio();
          socket.on('AudioFile', function(fileName, sessionName) {
            href = 'https://localhost:8080/static/' + sessionName + '/' + fileName;
            console.log('got file ' + href);
            cameraPreview.src = href;
            cameraPreview.play();
            cameraPreview.muted = false;
            cameraPreview.controls = true;
          });
          console.log("stop recording audio");
        });
      }

      //powermate events
      if(countPress == 1){
        startRecordAudio();
        console.log("recording audio");
        isEventExecutedAudio = false;
        $("body").keypress(function(e){
          if(isEventExecutedAudio == false){
            var code = e.keyCode || e.which;
            if(code == 97 || code == 98){
              isEventExecutedAudio = true;
              console.log("File was not saved");
              recordAudio.stopRecording();
              startRecordingBtn.style.display = "block";
              stopRecordingBtn.style.display = "none";
              countPress = 0;
            }
          }
        });
      }

      if(countPress > 1){
        stopRecordAudio();
        socket.on('AudioFile', function(fileName, sessionName) {
          href = 'https://localhost:8080/static/' + sessionName + '/' + fileName;
          console.log('got file ' + href);
          cameraPreview.src = href;
          cameraPreview.play();
          cameraPreview.muted = false;
          cameraPreview.controls = true;
        });
        console.log("stop recording audio");
        countPress = 0;
      }
      
      function startRecordAudio(){
        backAnimation();
        
        // Initialise getUserMedia
        navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        navigator.getMedia(
          {
            video: false,
            audio: true
          },
          function (stream) {
            // get user media pour le son
            mediaStream = stream;
            recordAudio = RecordRTC(stream, {
              type: 'audio'
            });
            recordAudio.startRecording();
            cameraPreview.src = window.URL.createObjectURL(stream);
            cameraPreview.play();
            cameraPreview.muted = false;
            cameraPreview.controls = true;
          },
          function(error) {
            alert(JSON.stringify(error));
          }
        );
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        startRecordingBtn.style.display = "none";
        stopRecordingBtn.style.display = "block";
      }

      function stopRecordAudio(){
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        startRecordingBtn.style.display = "block";
        stopRecordingBtn.style.display = "none";
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
            socket.emit('audio', {files: files, id: sessionId, name: app.session});
            console.log("Audio is recording url " + url);
            animateWindows(files, "audioCapture");
            if (mediaStream) mediaStream.stop();
          });
        });
      }
    }
  
    //Capture le flux audio et video
    function audioVideo(click){
      //Variables
      // you can set it equal to "false" to record only audio
      var recordVideoSeparately = !!navigator.webkitGetUserMedia;
      if (!!navigator.webkitGetUserMedia && !recordVideoSeparately) {
          var cameraPreview = document.getElementById('camera-preview');
          cameraPreview.parentNode.innerHTML = '<audio id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></audio> ';
      }

      var mediaStream = null;

      var startVideoRecording = document.getElementById('record-btn');
      var stopVideoRecording = document.getElementById('stop-btn');
      var cameraPreview = document.getElementById('camera-preview');

      //click events
      if(click == "click"){
        $("#record-btn").off();
        $("#record-btn").on('click', function(){
          console.log("you are using the mouse for recording");
          startVideo();
          isEventExecutedVideo = false;
          $(".btn-choice").click(function(e){
            if(isEventExecutedVideo == false){
              isEventExecutedVideo = true;
              console.log('your video was not saved');
              recordVideo.stopRecording();
              e.preventDefault();
              startVideoRecording.style.display = "block";
              stopVideoRecording.style.display = "none";
              startVideoRecording.disabled = false;
              stopVideoRecording.disabled = true;
            }
          });
        });

        $("#stop-btn").off();
        $("#stop-btn").on('click', function(){
          stopVideo();
          socket.on('merged', function(fileName, sessionName) {
            href = 'https://localhost:8080/static/' + sessionName + '/' + fileName;
            console.log('got file ' + href);
            cameraPreview.src = href;
            cameraPreview.play();
            cameraPreview.muted = false;
            cameraPreview.controls = true;
          });
        });
      }


      //Powermate events
      if(countPress == 1){
        startVideo();
        console.log("recording video");
        isEventExecutedVideo = false;
        $("body").keypress(function(e){
          if(isEventExecutedVideo == false){
            var code = e.keyCode || e.which;
            if(code == 97 || code == 98){
                isEventExecutedVideo = true;
                console.log('your video was not saved');
                recordVideo.stopRecording();
                e.preventDefault();
                startVideoRecording.style.display = "block";
                stopVideoRecording.style.display = "none";
                countPress = 0;
              }
            }
        });
      }

      if(countPress > 1){
        stopVideo();
        socket.on('merged', function(fileName, sessionName) {
          href = 'https://localhost:8080/static/' + sessionName + '/' + fileName;
          console.log('got file ' + href);
          cameraPreview.src = href;
          cameraPreview.play();
          cameraPreview.muted = false;
          cameraPreview.controls = true;
        });
        countPress = 0;
        console.log("stop recording video");
      }

      function startVideo(){
        $('#camera-preview').hide();
        backAnimation();
        // Initialise getUserMedia
        navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        navigator.getMedia(
          {
            video: true,
            audio: false
          },
          function (stream) {
            // get user media pour le son
            mediaStream = stream;
            recordVideo = RecordRTC(stream, {
              type: 'video'
            });
            recordVideo.startRecording();
            cameraPreview.src = window.URL.createObjectURL(stream);
            cameraPreview.play();
            cameraPreview.muted = true;
            cameraPreview.controls = true;
          },
          function(error) {
            alert(JSON.stringify(error));
          }
        );

        startVideoRecording.disabled = true;
        stopVideoRecording.disabled = false;
        startVideoRecording.style.display = "none";
        stopVideoRecording.style.display = "block";
      }

      function stopVideo(){
        startVideoRecording.disabled = false;
        stopVideoRecording.disabled = true;
        startVideoRecording.style.display = "block";
        stopVideoRecording.style.display = "none";
        cameraPreview.style.display = "block";
        // stop video recorder
        recordVideo.stopRecording(function() {
          // get video data-URL
          recordVideo.getDataURL(function(videoDataURL) {
            var files = {
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
            });
            if (mediaStream) mediaStream.stop();
          });
          cameraPreview.src = '';
          cameraPreview.poster = 'https://localhost:8080/loading.gif';
        });
      }
    }

    // CREATE A SOUND EQUALIZER
    function createEqualizer(e, click){
      window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function(callback, element){
                  window.setTimeout(callback, 1000 / 60);
                };
      })();

      window.AudioContext = (function(){
          return  window.AudioContext || window.mozAudioContext;
      })();

      // Global Variables for Audio
      var audioContext;
      var analyserNode;
      //var javascriptNode;
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
          console.log('Web Audio API is not supported in this browser');
      }
      console.log(click);
      //click events
      if(click == "click"){
        //$("#start-recording").off();
        $("#start-recording").on('click', function(e){
          startEqualizer(e);
          isEventExecutedVideo = false;
          $(".btn-choice").click(function(e){
            if(isEventExecutedVideo == false){
              isEventExecutedVideo = true;
              stopEqualizer(e);
              console.log("equalizer stoped");
            }
          });
        });

        //$("#stop-recording").off();
        $("#stop-recording").on('click', function(e){
          console.log("stop equalizer");
          stopEqualizer(e);
        });
      }


      //Powermate events
      //Clear Equalizer Canvas
      if(countEqualizer == 1){
        startEqualizer(e);
        isEventExecutedEqualizer == false;
        console.log('start recording');
        $("body").keypress(function(e){
          if(isEventExecutedEqualizer == false){
            var code = e.keyCode || e.which;
            if(code == 97 || code == 98){
              console.log("equalizer stoped");
              isEventExecutedEqualizer = true;
              stopEqualizer(e);
              countEqualizer = 0;
            }
          }
        });
      }

      //Stop Equalizer
      if(countEqualizer > 1){
        console.log("stop equalizer");
        stopEqualizer(e);
        countEqualizer = 0;
        console.log('stop recording');
      }

      function startEqualizer(e){
        e.preventDefault();
        clearCanvas();     
        // Initialise getUserMedia
        navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia); 
        navigator.getMedia(
          {
            video: false,
            audio: true
          },
          setupAudioNodes,
          function(err) {
            alert(JSON.stringify(error));
          }
        );
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

  }  

  //fenêtre de preview retourne au center
  function backAnimation(){
    if($(".right").hasClass('active')){
      $('.left').animate({'left':'30%'}, 'slow');
      $('.right').removeClass('active').animate({'top':'200px', 'left':'30%'}, 500,function(){$(this).css("display", "none")});
    }
  }

  //animation des fenêtres à la capture
  function animateWindows(data, capture){
    if(!$('.right').hasClass('active')){
      //console.log('right class active')
      $(".right").css('display', 'block').addClass('active');
      $('.left').animate({'left':'7%'}, 'slow');
      $('.right').animate({'left':'52%'}, 'slow', function(){
        $('.right').css('height', "auto");
        $(".form-meta").slideDown( "slow" ).addClass('active');
        socket.emit(capture, {data: data, id: sessionId, name: app.session});
      });
    }
    else{
      //console.log('right NOT class active')
      socket.emit(capture, {data: data, id: sessionId, name: app.session});
    }
  }
  function timestampToDate(timestamp){
    date = new Date(timestamp * 1000),
    datevalues = [
       date.getFullYear(),
       date.getMonth()+1,
       date.getDate(),
       date.getHours(),
       date.getMinutes(),
       date.getSeconds(),
    ];
    console.log(datevalues);
  }


  
});