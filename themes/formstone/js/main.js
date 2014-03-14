
	var Site = {
		_init: function() {
			$.pronto({
				selector: "a:not(.no-pronto)",
				tracking: {
					manager: true
				}
			});

			Site.$window = $(window);
			Site.$page = $(".shifter-page");
			Site.$progress = $("#progress");

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
			$("#pronto").css({ opacity: 0.5 }, 100);
		},
		_onLoadProgress: function(e, percent) {
			// update progress to reflect loading
			console.log("New page load progress", percent);

			Site.$progress.stop().animate({ width: (percent * 100) + "%" });
		},
		_onLoad: function(e) {
			//Disqus._destroy();

			Site.$progress.css({ width: "100%" });

			Site.$progress.stop().animate({ width: "100%" }, function() {
				Site.$progress.css({ width: 0 });
			});
		},
		_onRender: function(e) {
			$("#pronto code").each(function() {
				Prism.highlightElement($(this)[0]);
			});

			Site._checkMainNav();
			//Disqus._load();

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
		},
		_sizePage: function() {
			Site.$page .css({ minHeight: Site.$window.height() });
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