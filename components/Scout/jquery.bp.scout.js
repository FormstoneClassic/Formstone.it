/*
 * Scout Plugin - Simple Google Analytics Events
 * @author Ben Plum
 * @version 0.1.1
 *
 * Copyright (c) 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 *
 */

if (jQuery) (function($) {
	
	// Default Options
	var options = {
		delay: 100,
		extensions: {}, // extension options
		filetypes: /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i
	};
	
	var $body;
	
	// Initialize
	function _init(opts) {
		$body = $("body");
		
		// Extend 
		$.extend(options, opts);
		
		// Attach Scout events 
		if (!$body.data("scouting")) {
			$body.find("a").not("[data-scout-event]").each(_buildEvent);
			
			$body.data("scouting", true)
				 .on("click.scout", "*[data-scout-event]", _track);
			
			for (var i in $.scout.extensions) {
				$.scout.extensions[i]( options.extensions[i] || null );
			}
		}
	}
	
	// Track events on click
	function _track(e) {
		e.preventDefault();
		
		var $target = $(this),
			url = $target.attr("href"),
			data = $target.data("scout-event").split(",");
		
		// Trim that data
		for (var i in data) {
			data[i] = $.trim(data[i]);
		}
		
		// Push data
		_push(data[0], data[1], (data[2] || url), data[3], data[4]);
		
		// If active link, launch that ish!
		if (url && !$target.data("scout-stop")) {
			// Delay based on Google's outbound link handler: 
			// http://support.google.com/analytics/bin/answer.py?hl=en&answer=1136920
			setTimeout(function() { 
				// Check window target
				if ($target.attr("target")) {
					window.open(url, $target.attr("target"));
				} else {
					document.location.href = url;
				}
			}, options.delay);
		}
	}
	
	// Build events
	function _buildEvent() {
		var $target = $(this),
			href = (typeof($target.attr("href")) != "undefined") ? $target.attr("href") :"",
			internal = href.match(document.domain.split('.').reverse()[1] + '.' + document.domain.split('.').reverse()[0]),
			eventData;
		
		if (href.match(/^mailto\:/i)) {
			// Email
			eventData = "Email, Click, " + href.replace(/^mailto\:/i, '');
		} else if (href.match(/^tel\:/i)) {
			// Action
			eventData = "Telephone, Click, " + href.replace(/^tel\:/i, '');
		} else if (href.match(options.filetypes)) {
			// Files
			var extension = (/[.]/.exec(href)) ? /[^.]+$/.exec(href) : undefined;
			eventData = "File, Download:" + extension[0] + ", " + href.replace(/ /g,"-");
		} else if (href.match(/^https?\:/i) && !internal) {
			// External Link
			eventData = "ExternalLink, Click, " + href.replace(/^https?\:\/\//i, '');
		}
		
		$target.attr("data-scout-event", eventData);
	}
	
	// Push event to Google:
	// https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
	function _push(category, action, label, value, noninteraction) {
		if (typeof _gaq == "undefined") {
			_gaq = [];
		}
		_gaq.push(['_trackEvent', category, action, label, value, noninteraction]);
	}
	
	// Define Plugin 
	$.scout = function() {
		if (arguments.length && typeof arguments[0] !== 'object') {
			_push.apply(this, arguments);
		} else {
			_init.apply(this, arguments);
		}
	};
	$.scout.extensions = {};
})(jQuery);