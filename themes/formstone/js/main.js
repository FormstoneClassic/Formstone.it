
	var Site = {
		transitionEvent: false,
		transitionSupported: false,

		_init: function() {
			Site.transitionEvent = Site._getTransitionEvent();
			Site.transitionSupported = (Site.transitionEvent !== false);

			$.pronto({
				selector: "a:not(.no-pronto)",
				tracking: {
					// manager: true
				}
			});

			Site.$window = $(window);
			Site.$page = $(".shifter-page");
			Site.$progress = $("#progress");
			Site.$pronto = $("#pronto");

			$.rubberband({
				minWidth: [ 320, 500, 740, 980, 1220 ],
				maxWidth: [ 1220, 980, 740, 500, 320 ],
				minHeight: [ 400, 800 ],
				maxHeight: [ 800, 400 ]
			});

			$.shifter();
			$.scout();

			Site._onRender();
			Site._sizePage();

			$(window).on("snap", function(e, data) {
				//console.log("OH SNAP! ", data);
			}).on("pronto.request", Site._onRequest)
			  .on("pronto.progress", Site._onLoadProgress)
			  .on("pronto.load", Site._onLoad)
			  .on("pronto.render", Site._onRender)
			  .on("resize", Site._sizePage);
		},
		_onRequest: function(e) {
			$.shifter("close");
			Site.$pronto.css({ opacity: 0.5 });

			Site.$progress.addClass("visible");
			setTimeout("Site.$progress.css({ width: '15%' });", 10);
		},
		_onLoadProgress: function(e, percent) {
			percent = 15 + ((percent * 100) * 0.7); // to 90%

			Site.$progress.css({ width: percent + "%" });
		},
		_onLoad: function(e) {

			Site._transitionListener( Site.$progress, "width", "100%", Site._resetProgress );

			Site.$progress.css({ width: "100%" });

		},
		_onRender: function(e) {
			Site.$pronto.find("code").each(function() {
				Prism.highlightElement($(this)[0]);
			});

			Site._checkMainNav();

			Site.$pronto.css({ opacity: 1 });
		},
		_resetProgress: function() {
			Site._transitionListener(Site.$progress, "opacity", "0", function() {
				Site.$progress.css({ width: "0%" });
			});

			Site.$progress.removeClass("visible");
		},
		_checkMainNav: function() {
			var href = window.location.href;
			$(".navigation a").removeClass("active").each(function() {
				var url = $(this).attr("href");
				if (href.indexOf(url) > -1) {
					$(this).addClass("active");
				}
			});
		},
		_sizePage: function() {
			Site.$page .css({ minHeight: Site.$window.height() });
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

	/*
	var disqus_shortname = 'formstone',
		disqus_identifier = window.location.pathname,
		disqus_url = window.location.href;

	var Disqus = {
		_load: function() {
			if ($("#disqus_thread").length) {
				if ($("#disqus_script").length) {
					DISQUS.reset({
						reload: true,
						config: function() {
							this.page.identifier = window.location.pathname;
							this.page.url = window.location.href;
						}
					});
				} else {
					$("head").append('<script src="//' + disqus_shortname + '.disqus.com/embed.js" id="disqus_script" async="async"></script>');
				}
			}
		},
		_destroy: function() {
			if (typeof DISQUS !== 'undefined') {
				DISQUS.reset();
				$("#disqus_thread").html('');
			}
		}
	};
	*/

	$(document).ready(Site._init());