/* 
 * Scout v3.0.1 - 2014-04-10 
 * A jQuery plugin for pushing Google Analytics Events. Part of the Formstone Library. 
 * http://formstone.it/scout/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var $body;

	/**
	 * @options
	 * @param delay [int] <100> "Tarcking delay"
	 * @param filetypes [regex] </\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i> "Default file types to track"
	 * @param universal [boolean] <true> "Flag to use Universal Analytics"
	 */
	var options = {
		delay: 100,
		// extensions: {},
		filetypes: /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i,
		universal: true
		/*
		// May use when adding tag manager support
		tracking: {
			legacy: false, // Use legacy ga code
			manager: false, // Use tag manager events
			variable: 'currentURL', // data layer variable name - macro in tag manager
			event: 'PageView' // event name - rule in tag manager
		}
		*/
	};

	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		$body = $("body");
		$.extend(options, opts || {});

		// Attach Scout events
		if (!$body.data("scouting")) {
			$body.find("a").not("[data-scout-event]").each(_buildEvent);

			$body.data("scouting", true)
				 .on("click.scout", "*[data-scout-event]", _track);

			/*
			// Extentions may return later
			for (var i in $.scout.extensions) {
				$.scout.extensions[i]( options.extensions[i] || null );
			}
			*/
		}
	}

	/**
	 * @method private
	 * @name _track
	 * @description Tracks event
	 * @param e [object] "Event data"
	 */
	function _track(e) {
		e.preventDefault();

		var $target = $(this),
			url = $target.attr("href"),
			data = $target.data("scout-event").split(",");

		// Trim that data
		for (var i in data) {
			if (data.hasOwnProperty(i)) {
				data[i] = $.trim(data[i]);
			}
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

	/**
	 * @method private
	 * @name _buildEvent
	 * @description Build events for email, phone, file types & external links
	 */
	function _buildEvent() {
		var $target = $(this),
			href = (typeof($target.attr("href")) !== "undefined") ? $target.attr("href") :"",
			internal = href.match(document.domain.split(".").reverse()[1] + "." + document.domain.split(".").reverse()[0]),
			eventData;

		if (href.match(/^mailto\:/i)) {
			// Email
			eventData = "Email, Click, " + href.replace(/^mailto\:/i, "");
		} else if (href.match(/^tel\:/i)) {
			// Action
			eventData = "Telephone, Click, " + href.replace(/^tel\:/i, "");
		} else if (href.match(options.filetypes)) {
			// Files
			var extension = (/[.]/.exec(href)) ? /[^.]+$/.exec(href) : undefined;
			eventData = "File, Download:" + extension[0] + ", " + href.replace(/ /g,"-");
		} else if (href.match(/^https?\:/i) && !internal) {
			// External Link
			eventData = "ExternalLink, Click, " + href.replace(/^https?\:\/\//i, "");
		}

		$target.attr("data-scout-event", eventData);
	}

	/**
	 * @method private
	 * @name _push
	 * @description Push event to GA; Legacy or Universal
	 */
	function _push(category, action, label, value, noninteraction) {
		if (options.universal) {
			if (typeof window.ga === "function") {
				// Universal Analytics

				// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
				var event = {
					"hitType": "event",
					"location": window.location,
					"title": window.document.title
				};

				if (category) {
					event["eventCategory"] = category;
				}
				if (action) {
					event["eventAction"] = action;
				}
				if (label) {
					event["eventLabel"] = label;
				}
				if (value) {
					event["eventValue"] = value;
				}
				if (noninteraction) {
					event["nonInteraction"] = noninteraction;
				}

				window.ga("send", event);
			}
			/*
			// May use when adding tag manager support
			if (options.tracking.manager) {
				// Tag Manager
				var page = {};
				page[options.tracking.variable] = url;
				window.dataLayer = window.dataLayer || [];

				// Push new url to varibale then tracking event
				window.dataLayer.push(page);
				window.dataLayer.push({ 'event': options.tracking.event });
			} else {
				// Basic
				if (typeof ga === "function") {
					ga('send', 'pageview', url);
				}

				// Specific tracker - only needed if using mutiple and/or tag manager
				//var t = ga.getAll();
				//ga(t[0].get('name')+'.send', 'pageview', '/mimeo/');
			}
			*/
		} else {
			// Legacy Analytics
			// https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
			if (typeof window._gaq === "undefined") {
				window._gaq = [];
			}
			window._gaq.push(["_trackEvent", category, action, label, value, noninteraction]);
		}
	}

	$.scout = function() {
		if (arguments.length && typeof arguments[0] !== "object") {
			_push.apply(this, arguments);
		} else {
			_init.apply(this, arguments);
		}
	};
	// $.scout.extensions = {};
})(jQuery, window);