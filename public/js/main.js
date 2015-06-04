jQuery(document).ready(function($) {
	$(".navbar-brand svg").find("rect,circle,polyline,line,path").velocity({
			scale: 0
		}, {
    	duration: 0,
		});

	$(".navbar-brand svg").velocity({ opacity: 1} );
	$(".navbar-brand svg").find("rect,circle,polyline,line,path").each(function(i) {
		$(this).delay(i*20).velocity({
			scale: 1
		}, {
    	duration: 1200,
    	easing: "spring"
		});
	});
});