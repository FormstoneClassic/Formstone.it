/* 
 * Mimeo v3.0.4 - 2014-02-12 
 * A jQuery plugin for responsive images. Part of the Formstone Library. 
 * http://formstone.it/mimeo/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var $window = $(window),
		$pictures = null,
		pixelRatio = (typeof window.devicePixelRatio !== "undefined") ? Math.ceil(window.devicePixelRatio) : 1;

	var pub = {

		/**
		 * @method
		 * @name update
		 * @description Updates cache of active picture elements
		 * @example $.mimeo("update");
		 */
		update: function() {
			$pictures = $("picture").each(function(i, picture) {
				var $sources = $(picture).find("source, .mimeo-source");

				for (var j = 0, count = $sources.length; j < count; j++) {
					var $source = $sources.eq(j),
						media = $source.attr("media"),
						srcset = $source.attr("srcset");

					// Check for srcset
					if (srcset) {
						var sources = {},
							ratio = 1;

						// Check each source
						srcset = srcset.split(",");
						for (var k in srcset) {
							if (srcset.hasOwnProperty(k)) {
								var s = srcset[k].trim().split(" "),
									r = parseInt(s[1], 10);

								// Get the largest source possible
								if (r > ratio && r <= pixelRatio) {
									ratio = r;
								}

								sources[r] = s[0];
							}
						}

						// Store all soruces and set target src attribute
						$source.data("mimeo-sources", sources)
							   .attr("src", sources[ratio]);
					}

					if (media) {
						var _mq = window.matchMedia(media.replace(Infinity, "100000px"));
						_mq.addListener(_respond);
						$source.data("mimeo-match", _mq);
					}
				}
			});

			_respond();
		}
	};

	/**
	 * @events
	 * @event change.mimeo "Image source change; trigged on target <picture> element"
	 */

	/**
	 * @method private
	 * @name _init
	 * @description Initialize plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		//$.extend(options, opts || {});

		//if (nativeSupport) {
		//	return;
		//}

		pub.update();
	}

	/**
	 * @method private
	 * @name _respond
	 * @description Handle media query changes
	 */
	function _respond() {
		$pictures.each(function() {
			var $target = $(this),
				$image = $target.find("img"),
				$sources = $target.find("source, .mimeo-source"),
				index = false;

			for (var i = 0, count = $sources.length; i < count; i++) {
				var match = $sources.eq(i).data("mimeo-match");

				if (match && match.matches) {
					index = i;
				}
			}

			if (index === false) {
				index = $sources.length - 1;
			}

			$image.attr("src", $sources.eq(index).attr("src"));

			$target.trigger("change.mimeo");
		});
	}

	$.mimeo = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery, window);