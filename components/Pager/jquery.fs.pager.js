/* 
 * Pager v0.1.2 - 2014-03-14 
 * A jQuery plugin for simple pagination. Part of the formstone library. 
 * http://formstone.it/pager/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var userAgent = (window.navigator.userAgent||window.navigator.vendor||window.opera),
		isFirefox = /Firefox/i.test(userAgent),
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(userAgent),
		isFirefoxMobile = (isFirefox && isMobile);

	/**
	 * @options
	 * @param ajax [boolean] <false> "Flag to disable default click actions"
	 * @param labels.close [string] <'Close'> "Close button text"
	 * @param labels.count [string] <'of'> "Gallery count separator text"
	 * @param labels.next [string] <'Next'> "Gallery control text"
	 * @param labels.previous [string] <'Previous'> "Gallery control text"
	 * @param maxWidth [string] <'980px'> "Width at which to auto-disable plugin"
	 * @param visible [int] <2> "Visible pages before and after current page"
	 */
	var options = {
		ajax: true,
		labels: {
			count: "of",
			next: "Next",
			previous: "Previous"
		},
		maxWidth: "740px",
		visible: 2
	};

	/**
	 * @events
	 * @event update.pager "Current page updated"
	 */

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.pager("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").pager("destroy");
		 */
		destroy: function() {
			return $(this).each(function() {
				var data = $(this).data("pager");

				if (data) {
					data.$controls.remove();
					data.$ellipsis.remove();
					data.$select.remove();
					data.$position.remove();
					data.$items.removeClass("active visible first last")
							   .unwrap();
					data.$pager.removeClass("pager")
							   .off(".pager")
							   .data("pager", null);
				}
			});
		},

		/**
		 * @method
		 * @name jump
		 * @description Jump instance of plugin to specific page
		 * @example $(".target").pager("jump", 1);
		 */
		jump: function(index) {
			return $(this).each(function() {
				var data = $(this).data("pager");

				if (data) {
					data.$items.eq(index).trigger("click");
				}
			});
		},
	};


	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Settings
		opts = $.extend(true, {}, options, opts);

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
	 * @description Builds target instance
	 * @param $pager [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($pager, opts) {
		if (!$pager.data("pager")) {
			// EXTEND OPTIONS
			opts = $.extend({}, opts, $pager.data("pager-options"));

			var html = "";
			html += '<button class="pager-control previous">' + opts.labels.previous + '</button>';
			html += '<button class="pager-control next">' + opts.labels.next + '</button>';
			html += '<div class="pager-position">';
			html += '<span class="current">0</span>';
			html += ' ' + opts.labels.count + ' ';
			html += '<span class="total">0</span>';
			html += '</div>';
			html += '<select class="pager-select" tab-index="-1"></select>';

			$pager.addClass("pager")
				  .wrapInner('<div class="pager-pages"></div>')
				  .prepend(html);

			var data = $.extend({}, opts, {
				$pager: $pager,
				$controls: $pager.find(".pager-control"),
				$pages: $pager.find(".pager-pages"),
				$position: $pager.find(".pager-position"),
				$select: $pager.find(".pager-select"),
				$items: $pager.find("a"),
				index: -1
			});

			data.total = data.$items.length - 1;
			var index = data.$items.index(data.$items.filter(".active"));

			data.$items.eq(0).addClass("first")
					   .end().eq(data.total).addClass("last");

			data.$items.filter(".first")
					   .after('<span class="ellipsis first">&hellip;</span>');
			data.$items.filter(".last")
					   .before('<span class="ellipsis last">&hellip;</span>');
			data.$ellipsis = data.$pages.find(".ellipsis");

			_buildMobilePages(data);

			data.$pager.data("pager", data)
					   .on("touchstart.pager click.pager", ".pager-control", _onControlClick)
					   .on("touchstart.pager click.pager", ".pager-pages a", _onPageClick)
					   .on("touchstart.pager click.pager", ".pager-position", _onPositionClick)
					   .on("change.pager", ".pager-select", _onPageSelect);

			// Navtive MQ Support
			if (window.matchMedia !== undefined) {
				data.mediaQuery = window.matchMedia("(max-width:" + (data.maxWidth === Infinity ? "100000px" : data.maxWidth) + ")");
				// Make sure we stay in context
				data.mediaQuery.addListener(function() {
					_onRespond.apply(data.$pager);
				});
				_onRespond.apply(data.$pager);
			}

			_updatePage(data, index);
		}
	}

	/**
	 * @method private
	 * @name _onControlClick
	 * @description Traverses pages
	 * @param e [object] "Event data"
	 */
	function _onControlClick(e) {
		e.preventDefault();
		e.stopPropagation();

		var $target = $(e.currentTarget),
			data = $(e.delegateTarget).data("pager"),
			index = data.index + ($target.hasClass("previous") ? -1 : 1);

		if (index > -1) {
			data.$items.eq(index).trigger("click");
		}
	}

	/**
	 * @method private
	 * @name _onPageClick
	 * @description Jumps to a page
	 * @param e [object] "Event data"
	 */
	function _onPageClick(e) {
		var $target = $(e.currentTarget),
			data = $(e.delegateTarget).data("pager"),
			index = data.$items.index($target);

		if (data.ajax) {
			e.preventDefault();
			e.stopPropagation();

			_updatePage(data, index);
		} else {
			window.location.href = $target.attr("href");
		}
	}

	/**
	 * @method private
	 * @name _onPageSelect
	 * @description Jumps to a page
	 * @param e [object] "Event data"
	 */
	function _onPageSelect(e) {
		e.preventDefault();
		e.stopPropagation();

		var $target = $(e.currentTarget),
			data = $(e.delegateTarget).data("pager"),
			index = parseInt($target.val(), 10);

		data.$items.eq(index).trigger("click");
	}

	/**
	 * @method private
	 * @name _onPositionClick
	 * @description Opens mobile select
	 * @param e [object] "Event data"
	 */
	function _onPositionClick(e) {
		e.preventDefault();
		e.stopPropagation();

		var $target = $(e.currentTarget),
			data = $(e.delegateTarget).data("pager");

		if (isMobile && !isFirefoxMobile) {
			// Only open select on non-firefox mobiel
			var el = data.$select[0];
			if (window.document.createEvent) { // All
				var evt = window.document.createEvent("MouseEvents");
				evt.initMouseEvent("mousedown", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				el.dispatchEvent(evt);
			} else if (el.fireEvent) { // IE
				el.fireEvent("onmousedown");
			}
		}
	}

	/**
	 * @method private
	 * @name _updatePage
	 * @description Updates pagination state
	 * @param data [object] "Instance data"
	 * @param index [int] "New page index"
	 */
	function _updatePage(data, index) {
		if (index < 0) {
			index = 0;
		}
		if (index > data.total) {
			index = data.total;
		}

		if (index !== data.index) {
			data.index = index;

			var start = data.index - data.visible,
				end = data.index + (data.visible + 1);

			if (start < 0) {
				start = 0;
			}
			if (end > data.total) {
				end = data.total;
			}

			data.$items.removeClass("visible")
					   .filter(".active").removeClass("active")
					   .end().eq(data.index).addClass("active")
					   .end().slice(start, end).addClass("visible");

			data.$position.find(".current").text(data.index + 1);
			data.$position.find(".total").text(data.total + 1);

			data.$select.val(data.index);

			// controls
			data.$controls.removeClass("disabled");
			if (index === 0) {
				data.$controls.filter(".previous").addClass("disabled");
			}
			if (index === data.total) {
				data.$controls.filter(".next").addClass("disabled");
			}

			// elipsis
			data.$ellipsis.removeClass("hide");
			if (index <= data.visible + 1) {
				data.$ellipsis.filter(".first").addClass("hide");
			}
			if (index >= data.total - data.visible - 1) {
				data.$ellipsis.filter(".last").addClass("hide");
			}

			data.$pager.trigger("update.pager", [ data.index ]);
		}
	}

	/**
	 * @method private
	 * @name _buildMobilePages
	 * @description Builds options for mobile select
	 * @param data [object] "Instance data"
	 */
	function _buildMobilePages(data) {
		var html = '';

		for (var i = 0; i <= data.total; i++) {
			html += '<option value="' + i + '"';
			if (i === data.index) {
				html += 'selected="selected"';
			}
			html += '>Page ' + (i+1) + '</option>';
		}

		data.$select.html(html);
	}


	/**
	 * @method private
	 * @name _onRespond
	 * @description Handles media query match change
	 */
	function _onRespond() {
		var data = $(this).data("pager");

		if (data.mediaQuery.matches) {
			/* pub.enable.apply(data.$nav); */
			data.$pager.addClass("mobile");
		} else {
			/* pub.disable.apply(data.$nav); */
			data.$pager.removeClass("mobile");
		}
	}

	$.fn.pager = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.pager = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery, window);