
	var Site = {
		_init: function() {
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

			$.shifter();
			$.scout();

			Site._onRender();

			$(window).on("snap", function(e, data) {
				//console.log("OH SNAP! ", data);
			}).on("pronto.request", Site._onRequest)
			  .on("pronto.load", Site._onLoad)
			  .on("pronto.render", Site._onRender);
		},
		_onLoad: function() {
			Disqus._destroy();
		},
		_onRequest: function() {
			$.shifter("close");
			$("#pronto").css({ opacity: 0.5 }, 100);
		},
		_onRender: function() {
			$("#pronto code").each(function() {
				Prism.highlightElement($(this)[0]);
			});

			Site._checkMainNav();
			Disqus._load();

			$("#pronto").css({ opacity: 1 });
		},
		_checkMainNav: function() {
			var href = window.location.href;
			$(".navigation a").removeClass("active").each(function() {
				var url = $(this).attr("href");
				if (href.indexOf(url) > -1) {
					$(this).addClass("active");
				}
			});
		}
	};

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

	$(document).ready(Site._init());