/* 
 * Sizer v3.0.2 - 2014-03-18 
 * A jQuery plugin for matching dimensions. Part of the Formstone Library. 
 * http://formstone.it/sizer/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var $window = $(window);

	/**
	 * @options
	 * @param minWidth [string] <0> "Width at which to auto-enable plugin"
	 */
	var options = {
		minWidth: 0
	};

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.sizer("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name disable
		 * @description Disables target instance
		 * @example $(".target").sizer("disable");
		 */
		disable: function() {
			return $(this).each(function(i, el) {
				var data = $(el).data("sizer");

				if (data && !data.disabled) {
					data.disabled = true;

					data.$items.css({ height: "" });

					if (data.updateParent) {
						data.$sizer.css({ height: "" })
								   .find(".sizer-update").css({ height: "" });
					}
				}
			});
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").sizer("destroy");
		 */
		destroy: function() {
			return $(this).each(function(i, el) {
				var data = $(el).data("sizer");

				if (data) {
					data.$sizer.off(".sizer");
					data.$items.css({ height: "" });

					if (data.updateParent) {
						data.$sizer.css({ height: "" })
								   .find(".sizer-update").css({ height: "" });
					}

					data.$items.find("sizer-size")
							   .unwrap();
				}
			});
		},

		/**
		 * @method
		 * @name enable
		 * @description Enables target instance
		 * @example $(".target").sizer("enable");
		 */
		enable: function() {
			return $(this).each(function(i, el) {
				var data = $(el).data("sizer");

				if (data && data.disabled) {
					data.disabled = false;
					_resize({ data: data });
				}
			});
		},

		/**
		 * @method
		 * @name resize
		 * @description Resizes instance of plugin
		 * @example $(".target").sizer("resize");
		 */
		resize: function() {
			return $(this).each(function(i, el) {
				var data = $(el).data("sizer");

				if (data) {
					_resize({ data: data });
				}
			});
		}
	};

	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Local options
		opts = $.extend({}, options, opts || {});

		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}

		// Extra styles [?]
		if (!$("#sizer-style").length) {
			$("body").append('<style id="sizer-style">.sizer-size:after { clear: both; content: "."; display: block; height: 0; line-height: 0; visibility: hidden; }</style>');
		}

		return $items;
	}

	/**
	 * @method private
	 * @name _build
	 * @description Builds each instance
	 * @param $el [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($sizer, opts) {
		if (!$sizer.hasClass("sizer")) {
			// EXTEND OPTIONS
			var data = $.extend({}, {
					$sizer: $sizer,
					$items: $sizer.find(".sizer-item"),
					updateParent: $sizer.hasClass("sizer-update") || $sizer.find(".sizer-update").length > 0,
					diabled: false
				}, opts, $sizer.data("sizer-options"));

			data.$items.wrapInner('<div class="sizer-size" />');

			data.$sizer.addClass("sizer")
					   .data("sizer", data);

			_resize({ data: data });

			data.$sizer.find("img").each(function() {
				var $img = $(this);
				if (!$img[0].complete) {
					$img.one("load", function() {
						_resize({ data: data });
					});
				} else {
					_resize({ data: data });
				}
			});
		}
	}

	function _resize(e) {
		var data = e.data,
			width = $window.width();

		if (data.minWidth < width) {
			var height = 0;

			for (var i = 0; i < data.$items.length; i++) {
				var itemHeight = data.$items.eq(i).find(".sizer-size").outerHeight(true);
				if (itemHeight > height) {
					height = itemHeight;
				}
			}

			data.$items.css({ height: height });
			if (data.updateParent) {
				data.$sizer.css({ height: height })
						   .find(".sizer-update").css({ height: height });
			}
		} else {
			data.$items.css({ height: "" });
			data.$sizer.css({ height: "" });
		}
	}

	$.fn.sizer = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.sizer = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery, window);