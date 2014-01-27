/*
 * Contextualize Plugin - Give your links some context
 * @author Ben Plum
 * @version 0.4.2
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
 
if (jQuery) (function($) {
	
	// Default Options
	var options = {
		exclude: "",
		prefix: "icon_",
		types: ["pdf", "doc", "xls", "ppt", "swf", "zip", "mp3"]
	};
	
	// Public Methods
	var pub = {
		
		// Set / Update defaults
		defaults: function(opts) {
			options = jQuery.extend(options, opts);
			return $(this);
		},
		
		// Remove some context
		remove: function(opts) {
			return $(this).filter('[context="on"]')
						  .removeClass( options.prefix + "external " + options.prefix + options.types.join(" " + options.prefix) )
						  .attr("context", null);
		}
	};
	
	// Add some context
	function _init(opts) {
		options = jQuery.extend(options, opts);
		var filter = (options.exclude != "") ? ", " + options.exclude : "",
			$items = $(this).not('[context="on"]' + filter),
			counter = $items.lenth;
		
		for (var i = 0, count = $items.length; i < count; i++) {
			var $anchor = $items.eq(i);
			
			if ($anchor.attr("href") !== undefined) {
				var classes = "",
					ext = $anchor.attr("href").substr(-3).toLowerCase();
				
				if ($.inArray(ext, options.types) > -1) {
					classes += " " + options.prefix + ext;
				}
				if ($anchor.attr("target") == "_blank") {
					classes += " " + options.prefix + "external";
				}
				
				$anchor.addClass(classes).attr("context", "on");
			}
		}
		
		return $items;
	}
	
	// Define Plugin 
	$.fn.contextualize = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery); 