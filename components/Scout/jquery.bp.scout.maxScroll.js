/*
 * Scout Plugin - Scroll Extension - Track user scroll positions
 * @author Ben Plum
 * @version 0.0.3
 *
 * Copyright (c) 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 *
 */

if (jQuery) (function($) {
	
	// Default Options
	var options = {
		time: 60 // seconds
	};
	
	var $window = $(window),
		$document = $(document),
		eventTimer = null,
		scrollMax = 0;
	
	// Initialize
	function _init(opts) {
		options = $.extend(options, opts);
		
		// Bind events
		$window.on("scroll.scout-maxscroll", _onScroll)
			   .on("unload.scout-maxscroll, pronto.request", _pushScroll);
		
		_onScroll();
	}
	
	function _onScroll() {
		// Set max scroll
		var scrollTop = $window.scrollTop();
		scrollMax = (scrollMax > scrollTop) ? scrollMax : scrollTop;
		
		// Start Timer
		_clearTimer();
		eventTimer = setTimeout(_pushScroll, (1000 * options.time));
	}
	
	function _pushScroll() {
		_clearTimer();
		// Push event
		var properties = _getProperties();
		$.scout("ScrollPosition", "Device:"+properties.device, properties.path, properties.position);
	}
	
	function _getProperties() {
		var windowWidth = $window.width(),
			windowHeight = $window.height(),
			documentHeight = $document.outerHeight(false),
			device = "Mobile";
		
		// Device class
		if (windowWidth > 460) device = "Tablet";
		if (windowWidth > 740) device = "Desktop";
		
		// Final percentage
		var position = Math.floor((scrollMax / (documentHeight - windowHeight)) * 100);
		
		// Catch weird outliers
		if (position < 0) position = 0;
		if (position > 100) position = 100;
		
		// Return props
		return {
			device: device, 
			position: position, 
			path: window.location.pathname
		}
	}
	
	function _clearTimer() {
		if (eventTimer !== null) {
			clearTimeout(eventTimer);
			eventTimer = null;
		}
	}
	
	if ($.scout) {
		// Define Plugin 
		$.scout.extensions.maxScroll = function(opts) {
			_init(opts);
		};
	}
})(jQuery);