/* 
 * Ranger v3.1.0 - 2014-09-20 
 * A jQuery plugin for cross browser range inputs. Part of the formstone library. 
 * http://formstone.it/ranger/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */

;(function ($, window) {
	"use strict";

	/**
	 * @options
	 * @param customClass [string] <''> "Class applied to instance"
	 * @param formatter [function] <$.noop> "Value format function"
	 * @param label [boolean] <true> "Draw labels"
	 * @param labels.max [string] "Max value label; defaults to max value"
	 * @param labels.min [string] "Min value label; defaults to min value"
	 * @param vertical [boolean] <false> "Flag to render vertical range; Deprecated use 'orientation' attribute instead
	 */
	var options = {
		customClass: "",
		formatter: $.noop,
		label: true,
		labels: {
			max: false,
			min: false
		},
		vertical: false
	};

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.ranger("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").ranger("destroy");
		 */
		destroy: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("ranger");

				if (data) {
					data.$ranger.off(".ranger")
								.remove();

					data.$input.off(".ranger")
							   .removeClass("ranger-element")
							   .removeData("ranger");
				}
			});
		},

		/**
		 * @method
		 * @name disable
		 * @description Disables instance of plugin
		 * @example $(".target").ranger("disable");
		 */
		disable: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("ranger");

				if (data) {
					data.$input.prop("disabled", true);
					data.$ranger.addClass("disabled");
				}
			});
		},

		/**
		 * @method
		 * @name enable
		 * @description Enables instance of plugin
		 * @example $(".target").ranger("enable");
		 */
		enable: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("ranger");

				if (data) {
					data.$input.prop("disabled", false);
					data.$ranger.removeClass("disabled");
				}
			});
		},

		/**
		 * @method
		 * @name reset
		 * @description Resets current position
		 * @example $(".target").ranger("reset");
		 */
		reset: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("ranger");

				if (data) {
					data.stepCount = (data.max - data.min) / data.step;
					if (data.vertical) {
						data.trackHeight = data.$track.outerHeight();
						data.handleHeight = data.$handle.outerHeight();
						data.increment = data.trackHeight / data.stepCount;
					} else {
						data.trackWidth = data.$track.outerWidth();
						data.handleWidth = data.$handle.outerWidth();
						data.increment = data.trackWidth / data.stepCount;
					}

					var perc = (data.$input.val() - data.min) / (data.max - data.min);
					_position(data, perc, true); // isReset
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
		// Settings
		opts = $.extend({}, options, opts);

		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		return $items;
	}

	/**
	 * @method private
	 * @name _build
	 * @description Builds each instance
	 * @param $input [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($input, opts) {
		if (!$input.data("ranger")) {
			// EXTEND OPTIONS
			$.extend(opts, $input.data("ranger-options"));

			if (opts.formatter === $.noop) {
				opts.formatter = _formatNumber;
			}

			var min = parseFloat($input.attr("min")) || 0,
				max = parseFloat($input.attr("max")) || 100,
				step = parseFloat($input.attr("step")) || 1,
				value = parseFloat($input.val()) || (min + ((max - min) / 2));

			// Not valid in the spec
			opts.vertical = $input.attr("orient") === "vertical" || opts.vertical;

			var html = '<div class="ranger';
			if (opts.vertical) {
				html += ' ranger-vertical';
			}
			if (opts.label) {
				html += ' ranger-labels';
			}
			html += '">';
			html += '<div class="ranger-track">';
			html += '<span class="ranger-handle">';
			html += '<span class="ranger-marker"></span>';
			html += '</span>';
			html += '</div>';
			html += '</div>';

			// Modify DOM
			$input.addClass("ranger-element")
				  .after(html);

			// Store plugin data
			var $ranger = $input.next(".ranger"),
				$track = $ranger.find(".ranger-track"),
				$handle = $ranger.find(".ranger-handle"),
				$output = $ranger.find(".ranger-output");

			if (opts.label) {
				if (opts.vertical) {
					$ranger.prepend('<span class="ranger-label max">' + opts.formatter.call(this, (opts.labelMax) ? opts.labelMax : max) + '</span>')
						   .append('<span class="ranger-label min">' + opts.formatter.call(this, (opts.labelMin) ? opts.labelMin : min) + '</span>');
				} else {
					$ranger.prepend('<span class="ranger-label min">' + opts.formatter.call(this, (opts.labelMin) ? opts.labelMin : min) + '</span>')
						   .append('<span class="ranger-label max">' + opts.formatter.call(this, (opts.labelMax) ? opts.labelMax : max) + '</span>');
				}
			}

			// Check disabled
			if ($ranger.is(":disabled")) {
				$ranger.addClass("disabled");
			}

			var data = $.extend({}, opts, {
				$input: $input,
				$ranger: $ranger,
				$track: $track,
				$handle: $handle,
				$output: $output,
				min: min,
				max: max,
				step: step,
				stepDigits: step.toString().length - step.toString().indexOf("."),
				value: value
			});

			// Bind click events
			$input.on("focus.ranger", data, _onFocus)
				  .on("blur.ranger", data, _onBlur)
				  .on("change.ranger input.ranger", data, _onChange)
				  .data("ranger", data);

			$ranger.on("touchstart.ranger mousedown.ranger", ".ranger-track", data, _onTrackDown)
				   .on("touchstart.ranger mousedown.ranger", ".ranger-handle", data, _onHandleDown);

			pub.reset.apply($input);
		}
	}

	/**
	 * @method private
	 * @name _onTrackDown
	 * @description Handles mousedown event to track
	 * @param e [object] "Event data"
	 */
	function _onTrackDown(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		if (!data.$input.is(":disabled")) {
			_onMouseMove(e);

			data.$ranger.addClass("focus");

			$("body").on("touchmove.ranger mousemove.ranger", data, _onMouseMove)
					 .one("touchend.ranger touchcancel.ranger mouseup.ranger", data, _onMouseUp);
		}
	}

	/**
	 * @method private
	 * @name _onHandleDown
	 * @description Handles mousedown event to handle
	 * @param e [object] "Event data"
	 */
	function _onHandleDown(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		if (!data.$input.is(":disabled")) {
			data.$ranger.addClass("focus");

			$("body").on("touchmove.ranger mousemove.ranger", data, _onMouseMove)
					 .one("touchend.ranger touchcancel.ranger mouseup.ranger", data, _onMouseUp);
		}
	}

	/**
	 * @method private
	 * @name _onMouseMove
	 * @description Handles mousemove event
	 * @param e [object] "Event data"
	 */
	function _onMouseMove(e) {
		e.preventDefault();
		e.stopPropagation();

		var oe = e.originalEvent,
			data = e.data,
			offset = data.$track.offset(),
			perc = 0;

		if (data.vertical) {
			var pageY = (typeof oe.targetTouches !== "undefined") ? oe.targetTouches[0].pageY : e.pageY;
			perc = 1 - (pageY - offset.top) / data.trackHeight;
		} else {
			var pageX = (typeof oe.targetTouches !== "undefined") ? oe.targetTouches[0].pageX : e.pageX;
			perc = (pageX - offset.left) / data.trackWidth;
		}

		_position(data, perc);
	}

	/**
	 * @method private
	 * @name _onMouseUp
	 * @description Handles mouseup event
	 * @param e [object] "Event data"
	 */
	function _onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		data.$ranger.removeClass("focus");

		$("body").off(".ranger");
	}

	/**
	 * @method private
	 * @name _onFocus
	 * @description Handles instance focus
	 * @param e [object] "Event data"
	 */
	function _onFocus(e) {
		e.data.$ranger.addClass("focus");
	}

	/**
	 * @method private
	 * @name _onBlur
	 * @description Handles instance blur
	 * @param e [object] "Event data"
	 */
	function _onBlur(e) {
		e.data.$ranger.removeClass("focus");
	}

	/**
	 * @method private
	 * @name _position
	 * @description Positions handle
	 * @param data [object] "Instance Data"
	 * @param perc [number] "Position precentage"
	 * @param isReset [boolean] "Called from reset"
	 */
	function _position(data, perc, isReset) {
		if (data.increment > 1) {
			if (data.vertical) {
				perc = (Math.round(perc * data.stepCount) * data.increment) / data.trackHeight;
			} else {
				perc = (Math.round(perc * data.stepCount) * data.increment) / data.trackWidth;
			}
		}

		if (perc < 0) {
			perc = 0;
		}
		if (perc > 1) {
			perc = 1;
		}

		var value = ((data.min - data.max) * perc);
		value = -parseFloat( value.toFixed(data.stepDigits) );

		data.$handle.css((data.vertical) ? "bottom" : "left", (perc * 100) + "%");
		value += data.min;

		if (value !== data.value && value && isReset !== true) {
			data.$input.val(value)
					   .trigger("change", [ true ]);

			data.value = value;
		}
	}

	/**
	 * @method private
	 * @name _onChange
	 * @description Handles change events
	 * @param e [object] "Event data"
	 * @param internal [boolean] "Flag for internal change"
	 */
	function _onChange(e, internal) {
		var data = e.data;

		if (!internal && !data.$input.is(":disabled")) {
			var perc = (data.$input.val() - data.min) / (data.max - data.min);
			_position(data, perc);
		}
	}

	/**
	 * @method private
	 * @name _formatNumber
	 * @description Formats provided number
	 * @param number [number] "Number to format"
	 */
	function _formatNumber(number) {
		var parts = number.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	}

	$.fn.ranger = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.ranger = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery, window);
