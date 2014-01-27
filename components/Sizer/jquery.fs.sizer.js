/*
 * Sizer Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.1.6
 *
 * Copyright (c) 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
 
if (jQuery) (function($) {
	var sizerCount = 0;
	
	var options = {
		minWidth: 0
	};
	
	var pub = {
		
		// Set Defaults
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		// Disable
		disable: function() {
			$(this).each(function() {
				var data = $(this).data("sizer");
				data.disabled = true;
				data.$sizer.off("resize.sizer");
				data.$items.css({ height: "" });
				if (data.updateParent) {
					data.$sizer.css({ height: "" })
							   .find(".sizer-update").css({ height: "" });
				}
			});
		},
		
		// Enable
		enable: function() {
			$(this).each(function() {
				var data = $(this).data("sizer");
				if (data.disabled) {
					data.disabled = false;
					data.$sizer.on("resize.sizer", data, _resize)
							   .trigger("resize.sizer");
				}
			});
		}
	};
	
	
	// Initialize
	function _init(opts) {
		// Settings
		opts = $.extend({}, options, opts);
		
		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		
		if (!$("#sizer-style").length) {
			$("body").append('<style id="sizer-style">.sizer-size:after { clear: both; content: "."; display: block; height: 0; line-height: 0; visibility: hidden; }</style>');
		}
		
		return $items;
	}
	
	function _build($sizer, opts) {
		var data = $.extend({}, {
				$sizer: $sizer,
				$items: $sizer.find(".sizer-item"),
				updateParent: $sizer.hasClass("sizer-update") || $sizer.find(".sizer-update").length > 0,
				/* minWidth: $sizer.data("sizer-min-width") || 0, */
				diabled: false,
				guid: sizerCount++
			}, opts);
		
		data.$items.wrapInner('<div class="sizer-size" />');
		
		data.$sizer.addClass("sizer-ready")
				   .data("sizer", data)
				   .on("resize.sizer", data, _resize)
				   .trigger("resize.sizer");
		
		data.$sizer.find("img").each(function() {
			var $img = $(this);
			if (!$img[0].complete) {
				$img.on("load", function() {
					$(this).trigger("resize.sizer");
				});
			} else {
				$(this).trigger("resize.sizer");
			}
		}); 
	}
	
	function _resize(e) {
		var data = e.data;
		
		if (data.minWidth < Site.maxWidth) {
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
})(jQuery);