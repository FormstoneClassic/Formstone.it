/* 
 * Roller v3.1.15 - 2014-09-05 
 * A jQuery plugin for simple content carousels. Part of the Formstone Library. 
 * http://formstone.it/roller/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	/**
	 * @options
	 * @param autoAdvance [boolean] <false> "Flag to auto advance items"
	 * @param autoTime [int] <8000> "Auto advance time"
	 * @param autoWidth [boolean] <false> "Flag to fit items to viewport width"
	 * @param controls [boolean] <true> "Flag to draw controls"
	 * @param customClass [string] <''> "Class applied to instance"
	 * @param infinite [boolean] <false> "Flag for looping items"
	 * @param labels.next [string] <'Next'> "Control text"
	 * @param labels.previous [string] <'Previous'> "Control text"
	 * @param maxWidth [string] <'Infinity'> "Width at which to auto-disable plugin"
	 * @param minWidth [string] <'0'> "Width at which to auto-disable plugin"
	 * @param paged [boolean] <false> "Flag for paged items"
	 * @param pagination [boolean] <true> "Flag to draw pagination"
	 * @param single [boolean] <false> "Flag for single items"
	 * @param touchPaged [boolean] <true> "Flag for paged touch interaction"
	 * @param useMargin [boolean] <false> "Use margins instead of css transitions (legacy browser support)"
	 */
	var options = {
		autoAdvance: false,
		autoTime: 8000,
		autoWidth: false,
		controls: true,
		customClass: "",
		infinite: false,
		labels: {
			next: "Next",
			previous: "Previous"
		},
		maxWidth: Infinity,
		minWidth: '0px',
		paged: false,
		pagination: true,
		single: false,
		touchPaged: true,
		useMargin: false
	};

	/**
	 * @events
	 * @event update.roller "Canister position updated"
	 */

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.roller("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").roller("destroy");
		 */
		destroy: function() {
			return $(this).each(function() {
				var data = $(this).data("roller");

				if (data) {
					_clearTimer(data.autoTimer);

					if (!data.single) {
						if (data.viewport) {
							data.$items.unwrap();
						}
						if (data.canister) {
							data.$items.unwrap();
						} else {
							data.$canister.attr("style", null);
						}
					}

					data.$items.removeClass("visible");

					if (data.pagination) {
						data.$pagination.remove();
					}
					if (data.controls) {
						data.$controls.remove();
					}

					data.$roller.removeClass("roller enabled " + (data.single ? "single " : "") + data.customClass)
								.off(".roller")
								.data("roller", null);
				}
			});
		},

		/**
		 * @method
		 * @name disable
		 * @description Disables instance of plugin
		 * @example $(".target").roller("disable");
		 */
		disable: function() {
			return $(this).each(function() {
				var data = $(this).data("roller");

				if (data && data.enabled) {
					_clearTimer(data.autoTimer);

					data.enabled = false;

					data.$roller.removeClass("enabled")
								.off("touchstart.roller click.roller");

					data.$canister.attr("style", "")
								  .css( _prefix("transition", "none") )
								  .off("touchstart.roller");

					data.$controls.removeClass("visible");
					data.$pagination.removeClass("visible")
									.html("");

					if (data.useMargin) {
						data.$canister.css({ marginLeft: "" });
					} else {
						data.$canister.css( _prefix("transform", "translate3d(0px, 0, 0)") );
					}

					data.index = 0;
				}
			});
		},

		/**
		 * @method
		 * @name enable
		 * @description Enables instance of plugin
		 * @example $(".target").roller("enable");
		 */
		enable: function() {
			return $(this).each(function() {
				var data = $(this).data("roller");

				if (data && !data.enabled) {
					data.enabled = true;

					data.$roller.addClass("enabled")
								.on("touchstart.roller click.roller", ".roller-control", data, _onAdvance)
								.on("touchstart.roller click.roller", ".roller-page", data, _onSelect);

					data.$canister.css( _prefix("transition", "") );

					pub.resize.apply(data.$roller);

					if (!data.single) {
						data.$canister.on("touchstart.roller", data, _onTouchStart);
					}
				}
			});
		},

		/**
		 * @method
		 * @name jump
		 * @description Jump instance of plugin to specific page
		 * @example $(".target").roller("jump", 1);
		 */
		jump: function(index) {
			return $(this).each(function() {
				var data = $(this).data("roller");

				if (data && data.enabled) {
					_clearTimer(data.autoTimer);
					_position(data, index-1);
				}
			});
		},

		/**
		 * @method
		 * @name resize
		 * @description Resizes each instance
		 * @example $(".target").roller("resize");
		 */
		resize: function() {
			return $(this).each(function() {
				var data = $(this).data("roller");

				if (data && data.enabled) {
					data.count = data.$items.length;

					if (data.count < 1) { // avoid empty rollers
						return;
					}

					data.viewportWidth = data.$viewport.outerWidth(false);
					data.itemMargin = parseInt(data.$items.eq(0).css("margin-left"), 10) + parseInt(data.$items.eq(0).css("margin-right"), 10);

					if (data.autoWidth) {
						data.$items.css({ width: data.viewportWidth });
					}

					if (data.single) {
						data.perPage = 1;
						data.pageCount = data.count - 1;
					} else if (data.paged) {
						data.canisterWidth = 0;
						for (var i = 0; i < data.count; i++) {
							data.canisterWidth += data.$items.eq(i).outerWidth() + data.itemMargin;
						}
						data.perPage = 1;
						data.pageCount = (data.canisterWidth > data.viewportWidth) ? data.count - 1 : 0;
					} else {
						data.itemWidth = data.$items.eq(0).outerWidth(false) + data.itemMargin;
						data.perPage = Math.floor(data.viewportWidth / data.itemWidth);
						if (data.perPage < 1) {
							data.perPage = 1;
						}
						data.pageCount = Math.ceil(data.count / data.perPage) - 1;
						if (data.count > data.perPage && data.pageCount === 1) {
							data.pageCount++;
						}
						data.pageMove = data.itemWidth * data.perPage;
						data.canisterWidth = data.itemWidth * data.count;
					}

					data.maxMove = -data.canisterWidth + data.viewportWidth + data.itemMargin;

					if (data.canisterWidth + data.maxMove > data.viewportWidth) {
						data.pageCount++;
					}

					if (data.maxMove >= 0) {
						data.maxMove = 0;
						data.pageCount = 1;
					}

					// Reset Page Count
					if (data.pageCount !== Infinity) {
						var html = '';
						for (var j = 0; j <= data.pageCount; j++) {
							html += '<span class="roller-page">' + (j + 1) + '</span>';
						}
						data.$pagination.html(html);
					}

					if (data.pageCount <= 1) {
						data.$controls.removeClass("visible");
						data.$pagination.removeClass("visible");
					} else {
						data.$controls.addClass("visible");
						data.$pagination.addClass("visible");
					}
					data.$paginationItems = data.$roller.find(".roller-page");

					if (!data.single) {
						data.$canister.css({ width: data.canisterWidth });
					}

					_position(data, _calculateIndex(data), false);
				}
			});
		},

		/**
		 * @method
		 * @name reset
		 * @description Resets instance after item change
		 * @example $(".target").roller("reset");
		 */
		reset: function() {
			return $(this).each(function() {
				var data = $(this).data("roller");

				if (data && data.enabled) {
					data.$items = data.$roller.find(".roller-item");
					pub.resize.apply(data.$roller);
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
	 * @param $roller [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($roller, opts) {
		if (!$roller.data("roller")) {
			opts = $.extend({}, opts, $roller.data("roller-options"));

			// Legacy browser support
			if (!opts.useMargin && !_getTransform3DSupport()) {
				opts.useMargin = true;
			}

			if (!opts.single) {
				// Verify viewport and canister are available
				if (!$roller.find(".roller-viewport").length) {
					$roller.wrapInner('<div class="roller-viewport"></div>');
					opts.viewport = true;
				}
				if (!$roller.find(".roller-canister").length) {
					$roller.find(".roller-viewport")
						   .wrapInner('<div class="roller-canister"></div>');
					opts.canister = true;
				}
			}

			// Build controls and pagination
			var html = '';
			if (opts.controls && !$roller.find(".roller-controls").length) {
				html += '<div class="roller-controls">';
				html += '<span class="roller-control previous">' + opts.labels.previous + '</span>';
				html += '<span class="roller-control next">' + opts.labels.next + '</span>';
				html += '</div>';
			}
			if (opts.pagination && !$roller.find(".roller-pagination").length) {
				html += '<div class="roller-pagination">';
				html += '</div>';
			}

			// Modify target
			$roller.addClass("roller " + (opts.single ? "single " : "") + opts.customClass)
				   .append(html);

			var data = $.extend({}, {
				$roller: $roller,
				$viewport: $roller.find(".roller-viewport").eq(0),
				$canister: $roller.find(".roller-canister").eq(0),
				$captions: $roller.find(".roller-captions").eq(0),
				$controls: $roller.find(".roller-controls").eq(0),
				$pagination: $roller.find(".roller-pagination").eq(0),
				index: 0,
				deltaX: null,
				deltaY: null,
				leftPosition: 0,
				xStart: 0,
				yStart: 0,
				enabled: false,
				touchstart: 0,
				touchEnd: 0,
				touchTimer: null,
				hasTouched: false
			}, opts);

			data.$items = (data.single) ? data.$roller.find(".roller-item") : data.$canister.children(".roller-item");
			data.$captionItems = data.$captions.find(".roller-caption");
			data.$controlItems = data.$controls.find(".roller-control");
			data.$paginationItems = data.$pagination.find(".roller-page");
			data.$images = data.$canister.find("img");

			data.totalImages = data.$images.length;

			$roller.data("roller", data);

			// Navtive MQ Support
			if (window.matchMedia !== undefined) {
				data.maxWidth = data.maxWidth === Infinity ? "100000px" : data.maxWidth;
				data.mediaQuery = window.matchMedia("(min-width:" + data.minWidth + ") and (max-width:" + data.maxWidth + ")");
				// Make sure we stay in context
				data.mediaQuery.addListener(function() {
					_onRespond.apply(data.$roller);
				});
				_onRespond.apply(data.$roller);
			}

			// Watch images
			if (data.totalImages > 0) {
				data.loadedImages = 0;
				for (var i = 0; i < data.totalImages; i++) {
					var $img = data.$images.eq(i);
					$img.one("load.roller", data, _onImageLoad);
					if ($img[0].complete || $img[0].height) {
						$img.trigger("load.roller");
					}
				}
			}

			// Auto timer
			if (data.autoAdvance || data.auto) { // backwards compatibility
				data.autoTimer = _startTimer(data.autoTimer, data.autoTime, function() {
					_autoAdvance(data);
				}, true);
			}
		}
	}

	/**
	 * @method private
	 * @name _onImageLoad
	 * @description Handles child image load
	 * @param e [object] "Event data"
	 */
	function _onImageLoad(e) {
		var data = e.data;
		data.loadedImages++;
		if (data.loadedImages === data.totalImages) {
			pub.resize.apply(data.$roller);
		}
	}

	/**
	 * @method private
	 * @name _onTouchStart
	 * @description Handles touchstart event
	 * @param e [object] "Event data"
	 */
	function _onTouchStart(e) {
		e.stopPropagation();

		var data = e.data;

		_clearTimer(data.autoTimer);

		data.touchStart = new Date().getTime();
		data.$canister.css( _prefix("transition", "none") );

		var touch = (typeof e.originalEvent.targetTouches !== "undefined") ? e.originalEvent.targetTouches[0] : null;
		data.xStart = (touch) ? touch.pageX : e.clientX;
		data.yStart = (touch) ? touch.pageY : e.clientY;

		data.$canister.on("touchmove.roller", data, _onTouchMove)
					  .one("touchend.roller touchcancel.roller", data, _onTouchEnd);
	}

	/**
	 * @method private
	 * @name _onTouchMove
	 * @description Handles touchmove event
	 * @param e [object] "Event data"
	 */
	function _onTouchMove(e) {
		e.stopPropagation();

		var data = e.data,
			touch = (typeof e.originalEvent.targetTouches !== "undefined") ? e.originalEvent.targetTouches[0] : null;

		data.deltaX = data.xStart - ((touch) ? touch.pageX : e.clientX);
		data.deltaY = data.yStart - ((touch) ? touch.pageY : e.clientY);

		if (data.deltaX < -10 || data.deltaX > 10) {
			e.preventDefault();
		}

		data.touchLeft = data.leftPosition - data.deltaX;
		if (data.touchLeft > 0) {
			data.touchLeft = 0;
		}
		if (data.touchLeft < data.maxMove) {
			data.touchLeft = data.maxMove;
		}

		if (data.useMargin) {
			data.$canister.css({ marginLeft: data.touchLeft });
		} else {
			data.$canister.css( _prefix("transform", "translate3d("+data.touchLeft+"px, 0, 0)") );
		}
	}

	/**
	 * @method private
	 * @name _onTouchEnd
	 * @description Handles touchend event
	 * @param e [object] "Event data"
	 */
	function _onTouchEnd(e) {
		var data = e.data;

		data.touchEnd = new Date().getTime();
		data.leftPosition = data.touchLeft;
		data.$canister.css( _prefix("transition", "") );

		data.$canister.off("touchmove.roller touchend.roller touchcancel.roller");

		// only update index if we actually moved
		var index = (data.deltaX > -10 && data.deltaX < 10) ? data.index : _calculateIndex(data);

		if (data.touchPaged && !data.swipe) {
			_position(data, index);
		} else {
			data.index = index;
			_updateControls(data);
		}
		data.deltaX = null;
		data.touchStart = 0;
		data.touchEnd = 0;
	}

	/**
	 * @method private
	 * @name _autoAdvance
	 * @description Handles auto advancement
	 * @param data [object] "Instance data"
	 */
	function _autoAdvance(data) {
		var index = data.index + 1;
		if (index > data.pageCount) {
			index = 0;
		}
		_position(data, index);
	}

	/**
	 * @method private
	 * @name _onAdvance
	 * @description Handles item advancement
	 * @param e [object] "Event data"
	 */
	function _onAdvance(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data,
			index = data.index + (($(e.currentTarget).hasClass("next")) ? 1 : -1);

		if (!data.hasTouched) {
			_clearTimer(data.autoTimer);
			_position(data, index);
		}

		if (e.type === "touchstart") {
			data.hasTouched = true;
			data.touchTimer = _startTimer(data.touchTimer, 500, function() {
				data.hasTouched = false;
			});
		}
	}

	/**
	 * @method private
	 * @name _onSelect
	 * @description Handles item select
	 * @param e [object] "Event data"
	 */
	function _onSelect(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data,
			index = data.$paginationItems.index($(e.currentTarget));

		_clearTimer(data.autoTimer);
		_position(data, index);
	}

	/**
	 * @method private
	 * @name _position
	 * @description Handles updating instance position
	 * @param data [object] "Instance data"
	 * @param index [int] "Item index"
	 */
	function _position(data, index, animate) {
		if (index < 0) {
			index = (data.infinite) ? data.pageCount : 0;
		}
		if (index > data.pageCount) {
			index = (data.infinite) ? 0 : data.pageCount;
		}

		if (data.single) {
			data.$items.removeClass("active")
					   .eq(index)
					   .addClass("active");
		} else {
			if (data.paged) {
				var offset = data.$items.eq(index).position();
				if (offset) {
					data.leftPosition = -offset.left;
				}
			} else {
				data.leftPosition = -(index * data.pageMove);
			}

			if (data.leftPosition < data.maxMove) {
				data.leftPosition = data.maxMove;
			}

			if (isNaN(data.leftPosition)) {
				data.leftPosition = 0;
			}

			if (data.useMargin) {
				data.$canister.css({ marginLeft: data.leftPosition });
			} else {
				if (animate === false) {
					data.$canister.css( _prefix("transition", "none") )
								  .css( _prefix("transform", "translate3d("+data.leftPosition+"px, 0, 0)") );

					// Slight delay before adding transitions backs
					data.resizeTimer = _startTimer(data.resizeTimer, 5, function() {
						data.$canister.css( _prefix("transition", "") );
					}, false);
				} else {
					data.$canister.css( _prefix("transform", "translate3d("+data.leftPosition+"px, 0, 0)") );
				}
			}
		}

		data.$items.removeClass("visible");
		if (!data.single && data.perPage !== Infinity) {
			for (var i = 0; i < data.perPage; i++) {
				if (data.leftPosition === data.maxMove) {
					data.$items.eq(data.count - 1 - i).addClass("visible");
				} else {
					data.$items.eq((data.perPage * index) + i).addClass("visible");
				}
			}
		}

		if (animate !== false && index !== data.index && index > -1 && index < data.pageCount) {
			data.$roller.trigger("update.roller", [ index ]);
			data.index = index;
		}

		_updateControls(data);
	}

	/**
	 * @method private
	 * @name _updateControls
	 * @description Handles updating instance controls
	 * @param data [object] "Instance data"
	 */
	function _updateControls(data) {
		data.$captionItems.filter(".active").removeClass("active");
		data.$captionItems.eq(data.index).addClass("active");

		data.$paginationItems.filter(".active").removeClass("active");
		data.$paginationItems.eq(data.index).addClass("active");

		if (data.infinite) {
			data.$controlItems.addClass("enabled");
		} else if (data.pageCount <= 1) {
			data.$controlItems.removeClass("enabled");
		} else {
			data.$controlItems.addClass("enabled");
			if (data.index <= 0) {
				data.$controlItems.filter(".previous").removeClass("enabled");
			} else if (data.index >= data.pageCount || data.leftPosition === data.maxMove) {
				data.$controlItems.filter(".next").removeClass("enabled");
			}
		}
	}

	/**
	 * @method private
	 * @name _onRespond
	 * @description Handles media query match change
	 */
	function _onRespond() {
		var data = $(this).data("roller");

		if (data.mediaQuery.matches) {
			pub.enable.apply(data.$roller);
		} else {
			pub.disable.apply(data.$roller);
		}
	}

	/**
	 * @method private
	 * @name _calculateIndex
	 * @description Determines new index based on current position
	 * @param data [object] "Instance data"
	 * @return [int] "New item index"
	 */
	function _calculateIndex(data) {
		if (data.single) {
			return data.index;
		} if ((data.deltaX > 20 || data.deltaX < -20) && (data.touchStart && data.touchEnd) && data.touchEnd - data.touchStart < 200) {
			// Swipe
			return data.index + ((data.deltaX > 0) ? 1 : -1);
		} else if (data.paged) {
			// Find page
			var goal = Infinity;
			if (data.leftPosition === data.maxMove) {
				return data.$items.length - 1;
			} else {
				var index = 0;
				data.$items.each(function(i) {
					var offset = $(this).position(),
						check = offset.left + data.leftPosition;

					if (check < 0) {
						check = -check;
					}

					if (check < goal) {
						goal = check;
						index = i;
					}
				});
				return index;
			}
		} else {
			// Free scrolling
			return Math.round( -data.leftPosition / data.viewportWidth);
		}
	}

	/**
	 * @method private
	 * @name _prefix
	 * @description Builds vendor-prefixed styles
	 * @param property [string] "Property to prefix"
	 * @param value [string] "Property value"
	 * @return [string] "Vendor-prefixed styles"
	 */
	function _prefix(property, value) {
		var r = {};

		r["-webkit-" + property] = value;
		r[   "-moz-" + property] = value;
		r[    "-ms-" + property] = value;
		r[     "-o-" + property] = value;
		r[             property] = value;

		return r;
	}

	/**
	 * @method private
	 * @name _startTimer
	 * @description Starts an internal timer
	 * @param timer [int] "Timer ID"
	 * @param time [int] "Time until execution"
	 * @param callback [int] "Function to execute"
	 * @param interval [boolean] "Flag for recurring interval"
	 */
	function _startTimer(timer, time, func, interval) {
		_clearTimer(timer, interval);
		if (interval === true) {
			return setInterval(func, time);
		} else {
			return setTimeout(func, time);
		}
	}

	/**
	 * @method private
	 * @name _clearTimer
	 * @description Clears an internal timer
	 * @param timer [int] "Timer ID"
	 */
	function _clearTimer(timer) {
		if (timer !== null) {
			clearInterval(timer);
			timer = null;
		}
	}

	/**
	 * @method private
	 * @name _getTransform3DSupport
	 * @description Determines if transforms are support
	 * @return [boolean] "True if transforms supported"
	 */
	function _getTransform3DSupport() {
		/* http://stackoverflow.com/questions/11628390/how-to-detect-css-translate3d-without-the-webkit-context */
		/*
		var prop = "transform",
			val = "translate3d(0px, 0px, 0px)",
			test = /translate3d\(0px, 0px, 0px\)/g,
			$div = $("<div>");

		$div.css(_prefix(prop, val));
		var check = $div[0].style.cssText.match(test);

		return (check !== null && check.length > 0);
		*/

		/* http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support/12621264#12621264 */
		var el = document.createElement('p'),
			has3d,
			transforms = {
				'webkitTransform':'-webkit-transform',
				'OTransform':'-o-transform',
				'msTransform':'-ms-transform',
				'MozTransform':'-moz-transform',
				'transform':'transform'
			};

		document.body.insertBefore(el, null);
		for (var t in transforms) {
			if (el.style[t] !== undefined) {
				el.style[t] = "translate3d(1px,1px,1px)";
				has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
			}
		}
		document.body.removeChild(el);

		return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
	}


	$.fn.roller = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.roller = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery, window);