function fillPopOver( content, thisbutton, finalWidth, finalHeight, closeCallbackFunction ) {
	var $popover = $(".popover");
	if( $popover.find(".popoverContainer").length === 0) {
		$popover.html( "<div class='popoverContainer'></div>");
	}

	$("body").addClass("is-overlaid");

	$popoverContainer = $popover.find(".popoverContainer");
	$popoverContainer.html(content);

	$popoverContainer.append('<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div>');

	$popover.addClass("is-visible");

	var button = thisbutton;
	var maxQuickWidth = 900;

	var topSelected = button.offset().top - $(window).scrollTop(),
	leftSelected = button.offset().left,
	widthSelected = button.width(),
	heightSelected = button.height(),
	windowWidth = $(window).width(),
	windowHeight = $(window).height(),
	finalLeft = (windowWidth - finalWidth)/2,
	finalTop = (windowHeight - finalHeight)/2,
	quickViewWidth = ( windowWidth * 0.8 < maxQuickWidth ) ? windowWidth * 0.8 : maxQuickWidth ,
	quickViewLeft = (windowWidth - quickViewWidth)/2;

	$('.popover').css({
	    "top": topSelected,
	    "left": leftSelected,
	    "width": widthSelected,
	    "height": heightSelected
	}).velocity({
		//animate the quick view: animate its width and center it in the viewport
		//during this animation, only the slider button is visible
	    'top': finalTop+ 'px',
	    'left': finalLeft+'px',
	    'width': finalWidth+'px',
	    'height': finalHeight+'px'
	}, 1000, [ 400, 0 ], function(){
		//animate the quick view: animate its width to the final value
/*
		$('.popover').addClass('animate-width').velocity({
			'left': quickViewLeft+'px',
	    	'width': quickViewWidth+'px',
		}, 300, 'ease' ,function(){
			//show quick view content
//					$('.cd-quick-view').addClass('add-content');
		});
*/
	});

	$("body").on('click', function(event){
		if( $(event.target).is('.close-panel') || $(event.target).is('body.is-overlaid')) {
			closePopover( closeCallbackFunction);
		}
	});
	$(document).keyup(function(event){
  	if(event.which === '27'){
			closePopover( closeCallbackFunction);
		}
	});
}

function closePopover( closeCallbackFunction) {
	console.log( "closePopover ");
	console.log( closeCallbackFunction);
	console.log( "--- ");

	$("body").removeClass("is-overlaid");
	$(".popover").removeClass("is-visible").empty();
	closeCallbackFunction();
}


jQuery(document).ready(function($) {
	$(".navbar-brand svg").find("rect,circle,polyline,line,path").velocity({
			scale: 0
	}, {
    		duration: 0,
	});

	$(".navbar-brand svg").velocity({ opacity: 1} );
	$( $(".navbar-brand svg").find("rect,circle,polyline,line,path").get().reverse() ).each(function(i) {
		$(this).delay(i*30).velocity({
			scale: 1
		}, {
    	duration: 2200,
    	easing: "spring"
		});
	});

	$('[data-toggle="tooltip"]').tooltip()

	// fade in au chargement de la page
	setTimeout(function() {
		$("body").addClass("is-loaded");
	}, 500);

	// fade out au changement de page



});