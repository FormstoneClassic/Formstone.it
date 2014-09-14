
	var Site = {
		_init: function() {
			Site.$window = $(window);
			Site.$document = $(document);
			Site.$body = $("body");
			Site.$page = $(".shifter-page");
			Site.$pronto = $("#pronto");
			Site.$navigation = $(".navigation a");
			Site.$progress = $("#progress");

			Site.progressTimer = null;

			Site.transitionEvent = Site._getTransitionEvent();
			Site.transitionSupported = (Site.transitionEvent !== false);

			$.pronto({
				selector: "a:not(.no-pronto)",
				tracking: {
					manager: true
				}
			});

			$.rubberband({
				minWidth: [ 320, 500, 740, 980, 1220 ],
				maxWidth: [ 1220, 980, 740, 500, 320 ],
				minHeight: [ 400, 800 ],
				maxHeight: [ 800, 400 ]
			});

			$.shifter({
				maxWidth: "960px"
			});

			Site._onRender();

			$(window).on("snap", function(e, data) {
				//console.log("OH SNAP! ", data);
			}).on("pronto.request", Site._onRequest)
			  .on("pronto.progress", Site._onLoadProgress)
			  .on("pronto.load", Site._onLoad)
			  .on("pronto.render", Site._onRender)
			  .on("resize", Site._sizePage)
			  .trigger("scroll")
			  .trigger("resize");
		},
		_onRequest: function() {
			$.shifter("close");
			Site.$pronto.addClass("loading");
			Site.$progress.addClass("visible");

			clearTimeout(Site.progressTimer);
			Site.progressTimer = setTimeout("Site.$progress.css({ width: '15%' });", 10);
		},
		_onLoadProgress: function(e, percent) {
			percent = 15 + ((percent * 100) * 0.7); // to 70%
			Site.$progress.css({ width: percent + "%" });
		},
		_onLoad: function(e) {
			clearTimeout(Site.progressTimer);
			Site._transitionListener( Site.$progress, "width", "100%", Site._resetProgress );
			Site.$progress.css({ width: "100%" });

			$(".demo_tabbed").tabber("destroy");
		},
		_onRender: function() {
			Pagination._init();

			$("#pronto code").each(function() {
				Prism.highlightElement($(this)[0]);
			});

			Site._checkMainNav();
			Site.$pronto.removeClass("loading");

			$(".demo_tabbed").tabber({
				maxWidth: "0px"
			});
		},
		_resetProgress: function() {
			Site._transitionListener(Site.$progress, "opacity", "0", function() {
				Site.$progress.css({ width: "0%" });
			});

			Site.$progress.removeClass("visible");
		},
		_checkMainNav: function() {
			var href = window.location.href;
			Site.$navigation = $(".navigation a").removeClass("active").each(function() {
				var url = $(this).attr("href");
				if (href.indexOf(url) > -1) {
					$(this).addClass("active");
				}
			});
		},
		_sizePage: function() {
			Site.$page.css({ minHeight: Site.$window.height() });
		},
		_getTransitionEvent: function() {
			var transitions = {
					'WebkitTransition': 'webkitTransitionEnd',
					'MozTransition':    'transitionend',
					'OTransition':      'oTransitionEnd',
					'transition':       'transitionend'
				},
				test = document.createElement('div');

			for (var type in transitions) {
				if (transitions.hasOwnProperty(type) && type in test.style) {
					return transitions[type];
				}
			}

			return false;
		},
		// handle adding and removing transition listeners;
		_transitionListener: function($target, property, value, callback) {
			$target.on(Site.transitionEvent, function(e) {
				var $t = $(e.currentTarget),
					p = e.originalEvent.propertyName,
					v = $t[0].style[p] || $t.css(p);

				if ($t.is($target) && property == p && value == v) {
					$t.off(Site.transitionEvent);

					callback.apply($t);
				}
			});
		}
	};

	var Pagination = {
		inititalized: false,
		scrollTop: 0,

		_init: function() {
			if (Pagination.inititalized) {
				Pagination._destroy();
			}

			Pagination.$positioner = $(".positioner");

			if (Pagination.$positioner.length) {
				Pagination.inititalized = true;

				Pagination.$items = Pagination.$positioner.find(".item");
				Pagination.$menu = Pagination.$positioner.find(".pagination");
				Pagination.$pages = Pagination.$menu.find(".page");

				Pagination.$menu.on("click.pagination", ".page", Pagination._onClick);
				Site.$window.on("resize.pagination", Pagination._onScroll)
							.on("scroll.pagination", Pagination._onScroll)
							.trigger("resize");
			}
		},
		_destroy: function() {
			Pagination.$menu.off(".pagination");
			Site.$window.off(".pagination");

			Pagination.inititalized = false;
		},
		_onClick: function(e) {
			var $target = $(e.currentTarget),
				index = Pagination.$pages.index($target),
				offset = Pagination.$items.eq(index).offset();

			$("html, body").animate({ scrollTop: offset.top + 1 });
		},
		_onScroll: function() {
			Pagination.threshold = Site.$window.height() * 0.4,
			Pagination.positionerOffset = Pagination.$positioner.offset();
			Pagination.scrollTop = Site.$window.scrollTop();

			if (Pagination.scrollTop > Pagination.positionerOffset.top) {
				Pagination.$positioner.addClass("static");
				Pagination.$menu.css({
					left: Pagination.positionerOffset.left - 32,
					top: Pagination.scrollTop + 40
				});
			} else {
				Pagination.$positioner.removeClass("static");
				Pagination.$menu.attr("style", null);
			}

			Pagination.$pages.removeClass("active");

			for (var i = 0, count = Pagination.$items.length; i < count; i++) {
				var $item = Pagination.$items.eq(i),
					itemOffset = $item.offset(),
					itemHeight = $item.outerHeight(true);

				if (Pagination.scrollTop >= itemOffset.top - Pagination.threshold && Pagination.scrollTop <= itemOffset.top + itemHeight - Pagination.threshold) {
					Pagination.$pages.eq(i).addClass("active");
				}
			}
		}
	};


	$(document).ready(Site._init);