/* 
 * Pronto v3.0.18 - 2014-08-19 
 * A jQuery plugin for faster page loads. Part of the formstone library. 
 * http://formstone.it/pronto/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	/* global ga */

	var $window = $(window),
		$body,
		navtiveSupport = window.history && window.history.pushState && window.history.replaceState,
		currentURL = '',
		visited = 0;

	/**
	 * @options
	 * @param force [boolean] <false> "Forces new requests when navigating back/forward"
	 * @param jump [boolean] <false> "Jump page to top on render"
	 * @param modal [boolean] <false> "Flag for content loaded into modal"
	 * @param selecter [string] <'a'> "Selecter to target in the DOM"
	 * @param render [function] <$.noop> "Custom render function"
	 * @param requestKey [string] <'pronto'> "GET variable for requests"
	 * @param target [object] <{ title: 'title', content: '#pronto' }> "Key / value pair for rendering responses (key is response key, value is target selector)"
	 * @param tracking.legacy [boolean] <false> "Flag for legacy Google Analytics tracking"
	 * @param tracking.manager [boolean] <false> "Flag for Tag Manager tracking"
	 * @param tracking.variable [string] <'currentURL'> "Tag Manager dataLayer variable name (macro in Tag Manager)"
	 * @param tracking.event [string] <'PageView'> "Tag Manager event name (rule in Tag Manager)"
	 */
	var options = {
		force: false,
		jump: true,
		modal: false,
		selector: "a",
		render: $.noop,
		requestKey: "pronto",
		target: {
			title: "title",
			content: "#pronto"
		},
		tracking: {
			legacy: false, // Use legacy ga code
			manager: false, // Use tag manager events
			variable: 'currentURL', // data layer variable name - macro in tag manager
			event: 'PageView' // event name - rule in tag manager
		}
	};

	/**
	 * @events
	 * @event pronto.request "Before request is made; triggered on window"
	 * @event pronto.progress "As request is loaded; triggered on window"
	 * @event pronto.load "After request is loaded; triggered on window"
	 * @event pronto.render "After state is rendered; triggered on window"
	 * @event pronto.error "After load error; triggered on window"
	 */

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.pronto("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name disable
		 * @description Disable Pronto
		 * @example $.pronto("enable");
		 */
		disable: function() {
			if ($body && $body.hasClass("pronto")) {
				$body.off("click.pronto")
					 .removeClass("pronto");
			}
		},

		/**
		 * @method
		 * @name enable
		 * @description Enables Pronto
		 * @example $.pronto("enable");
		 */
		enable: function() {
			if ($body && !$body.hasClass("pronto")) {
				$body.on("click.pronto", options.selector, _onClick)
					 .addClass("pronto");
			}
		},

		/**
		 * @method
		 * @name load
		 * @description Loads new page
		 * @param opts [url] <''> "URL to load"
		 * @example $.pronto("load", "http://website.com/page/");
		 */
		load: function(url) {
			if (!navtiveSupport) {
				window.location.href = url;
			} else if (url) {
				_request(url);
			}
			return;
		}
	};

	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Check for push/pop support
		if (!navtiveSupport) {
			return;
		}

		$body = $("body");

		if (!$body.hasClass("pronto")) {
			$.extend(true, options, opts || {});

			options.$container = $(options.container);
			if (options.render === $.noop) {
				options.render = _renderState;
			}

			// Capture current url & state
			currentURL = window.location.href;

			// Set initial state
			_saveState();

			// Bind state events
			$window.on("popstate.pronto", _onPop);

			pub.enable();
		}
	}

	/**
	 * @method private
	 * @name _onClick
	 * @description Handles click events
	 * @param e [object] "Event data"
	 */
	function _onClick(e) {
		var url = e.currentTarget;

		// Ignore everything but normal click
		if (  (e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) || (window.location.protocol !== url.protocol || window.location.host !== url.host) || url.target === "_blank" ) {
			return;
		}

		// Update state on hash change
		if (url.hash && url.href.replace(url.hash, '') === window.location.href.replace(location.hash, '') || url.href === window.location.href + '#') {
			_saveState();
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		if (currentURL === url.href) {
			_saveState();
		} else {
			_request(url.href);
		}
	}

	/**
	 * @method private
	 * @name _onPop
	 * @description Handles history navigation events
	 * @param e [object] "Event data"
	 */
	function _onPop(e) {
		var data = e.originalEvent.state;

		if (data) {
			if (options.modal && visited === 0 && data.url) {
				// If opening content in a 'modal', return to original page on reload->back
				window.location.href = data.url;
			} else {
				// Check if data exists
				if (data.url !== currentURL) {
					if (options.force) {
						// Force a new request, even if navigating back
						_request(data.url);
					} else {
						// Fire request event
						$window.trigger("pronto.request");

						_process(data.url, data.data, data.scroll, false);
					}
				}
			}
		}
	}

	/**
	 * @method private
	 * @name _request
	 * @description Requests new content via AJAX
	 * @param url [string] "URL to load"
	 */
	function _request(url) {
		// Fire request event
		$window.trigger("pronto.request");

		// Request new content
		$.ajax({
			url: url + ((url.indexOf("?") > -1) ? "&"+options.requestKey+"=true" : "?"+options.requestKey+"=true"),
			dataType: "json",
			/* cache: false, */
			xhr: function() {
				// custom xhr
				var xhr = new window.XMLHttpRequest();

				/*
				//Upload progress ?
				xhr.upload.addEventListener("progress", function(e) {
					if (e.lengthComputable) {
						var percent = (e.loaded / e.total) / 2;
						$window.trigger("pronto.progress", [ percent ]);
					}
				}, false);
				*/

				//Download progress
				xhr.addEventListener("progress", function(e) {
					if (e.lengthComputable) {
						var percent = e.loaded / e.total;
						$window.trigger("pronto.progress", [ percent ]);
					}
				}, false);

				return xhr;
			},
			success: function(response) {
				response  = (typeof response === "string") ? $.parseJSON(response) : response;

				_process(url, response, (options.jump ? 0 : false), true);
			},
			error: function(jqXHR, status, error) {
				$window.trigger("pronto.error", [ error ]);

				// Try to parse response text
				try {
					var response  = $.parseJSON(jqXHR.responseText);
					_process(url, response, 0, true);
				} catch (e) {
					//console.error(e);
				}
			}
		});
	}

	/**
	 * @method private
	 * @name _process
	 * @description Processes a state
	 * @param url [string] "State URL"
	 * @param data [object] "State Data"
	 * @param scrollTop [int] "Current scroll position"
	 * @param doPush [boolean] "Flag to replace or add state"
	 */
	function _process(url, data, scrollTop, doPush) {
		// Fire load event
		$window.trigger("pronto.load");

		// Trigger analytics page view
		_track(url);

		// Update current state before rendering new state
		_saveState();

		// Render before updating
		options.render.call(this, data);

		// Update current url
		currentURL = url;

		if (doPush) {
			// Push new states to the stack
			history.pushState({
				url: currentURL,
				data: data,
				scroll: scrollTop
			}, "state-"+currentURL, currentURL);

			visited++;
		} else {
			// Update state with history data
			_saveState();
		}

		$window.trigger("pronto.render");

		if (scrollTop !== false) {
			$window.scrollTop(scrollTop);
		}
	}

	/**
	 * @method private
	 * @name _renderState
	 * @description Renders a new state
	 * @param data [object] "State Data"
	 */
	function _renderState(data) {
		// Update DOM
		if (typeof data !== "undefined") {
			for (var key in options.target) {
				if (options.target.hasOwnProperty(key) && data.hasOwnProperty(key)) {
					$(options.target[key]).html(data[key]);
				}
			}
		}
	}

	/**
	 * @method private
	 * @name _saveState
	 * @description Saves the current state
	 */
	function _saveState() {
		// Save state data before updating history
		var data = [];
		for (var key in options.target) {
			if (options.target.hasOwnProperty(key)) {
				data[key] = $(options.target[key]).html();
			}
		}

		// Update state
		history.replaceState({
			url: currentURL,
			data: data,
			scroll: $window.scrollTop()
		}, "state-"+currentURL, currentURL);
	}

	function _updateProgress(percent) {
	}

	/**
	 * @method private
	 * @name _unescape
	 * @description Unescapes HTML
	 * @param text [string] "Text to unescape"
	 */
	function _unescape(text) {
		return text.replace(/&lt;/g, "<")
				   .replace(/&gt;/g, ">")
				   .replace(/&nbsp;/g, " ")
				   .replace(/&amp;/g, "&")
				   .replace(/&quot;/g, '"')
				   .replace(/&#039;/g, "'");
	}

	/**
	 * @method private
	 * @name _track
	 * @description Pushes new page view to the Google Analytics (Legacy or Universal)
	 * @param url [string] "URL to track"
	 */
	function _track(url) {
		// Strip domain
		url = url.replace(window.location.protocol + "//" + window.location.host, "");

		if (options.tracking.legacy) {
			// Legacy Analytics
			window._gaq = window._gaq || [];
			window._gaq.push(["_trackPageview", url]);
		} else {
			// Universal Analytics
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
		}
	}

	$.pronto = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery, this);